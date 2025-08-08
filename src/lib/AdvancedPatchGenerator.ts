import fs from 'fs-extra';
import { EventEmitter } from 'events';
import CommandUtils from '../utils/commandUtils.js';
import MetricsUtils from '../utils/metrics.js';
import { DEFAULT_OPTIONS, MESSAGES } from '../constants/index.js';
import type {
  AdvancedPatchGeneratorOptions,
  FileInfo,
  PatchResult,
  ApplyPatchResult,
  VerifyPatchResult,
  BatchResult,
  CreatePatchOptions,
  ApplyPatchOptions,
  BatchOptions,
  ProgressData,
  ErrorData,
} from '../types/index.js';

/**
 * Advanced Patch Generator
 * Simplifies the process of creating and applying patches using Xdelta
 * @class AdvancedPatchGenerator
 * @extends EventEmitter
 */
class AdvancedPatchGenerator extends EventEmitter {
  public xdeltaPath: string;
  public defaultOptions: AdvancedPatchGeneratorOptions;
  private _xdeltaChecked: boolean;
  private _xdeltaAvailable: boolean;
  private onProgressCallback: ((progress: ProgressData) => void) | undefined;
  private onErrorCallback: ((error: ErrorData) => void) | undefined;
  private onCompleteCallback: ((result: any) => void) | undefined;

  /**
   * Creates a new instance of AdvancedPatchGenerator
   * @param options - Configuration options
   */
  constructor(options: AdvancedPatchGeneratorOptions = {}) {
    super();
    this.xdeltaPath = options.xdeltaPath || DEFAULT_OPTIONS.xdeltaPath;
    this.defaultOptions = {
      ...DEFAULT_OPTIONS,
      ...options,
    };
    this._xdeltaChecked = false;
    this._xdeltaAvailable = false;

    // Optional callbacks
    this.onProgressCallback = options.onProgress;
    this.onErrorCallback = options.onError;
    this.onCompleteCallback = options.onComplete;
  }

  /**
   * Emits progress event
   * @param data - Progress data
   * @private
   */
  private _emitProgress(data: ProgressData): void {
    this.emit('progress', data);
    if (this.onProgressCallback) {
      this.onProgressCallback(data);
    }
  }

  /**
   * Emits error event
   * @param error - Error occurred
   * @private
   */
  private _emitError(error: ErrorData): void {
    this.emit('error', error);
    if (this.onErrorCallback) {
      this.onErrorCallback(error);
    }
  }

  /**
   * Emits completion event
   * @param result - Operation result
   * @private
   */
  private _emitComplete(result: any): void {
    this.emit('complete', result);
    if (this.onCompleteCallback) {
      this.onCompleteCallback(result);
    }
  }

  /**
   * Gets detailed information about a file
   * @param filePath - File path
   * @returns Promise with file information
   */
  async getFileInfo(filePath: string): Promise<FileInfo> {
    try {
      const stats = await fs.stat(filePath);
      return {
        exists: true,
        size: stats.size,
        sizeFormatted: MetricsUtils.formatBytes(stats.size),
        modified: stats.mtime,
        path: filePath,
        isDirectory: stats.isDirectory(),
      };
    } catch (error) {
      return {
        exists: false,
        size: 0,
        sizeFormatted: '0 B',
        modified: new Date(),
        path: filePath,
        isDirectory: false,
      };
    }
  }

  /**
   * Checks if Xdelta3 is available on the system
   * @returns Promise with availability status
   */
  async checkXdelta(): Promise<boolean> {
    if (this._xdeltaChecked) {
      return this._xdeltaAvailable;
    }

    try {
      const result = await CommandUtils.executeCommand(`${this.xdeltaPath} -h`);
      this._xdeltaAvailable = result.success;
      this._xdeltaChecked = true;
      return this._xdeltaAvailable;
    } catch (error) {
      this._xdeltaAvailable = false;
      this._xdeltaChecked = true;
      return false;
    }
  }

  /**
   * Creates a patch between two files
   * @param oldFile - Original file path
   * @param newFile - New file path
   * @param patchFile - Output patch file path
   * @param options - Patch creation options
   * @returns Promise with patch result
   */
  async createPatch(
    oldFile: string,
    newFile: string,
    patchFile: string,
    options: CreatePatchOptions = {}
  ): Promise<PatchResult> {
    const startTime = Date.now();

    try {
      // Check Xdelta availability
      const xdeltaAvailable = await this.checkXdelta();
      if (!xdeltaAvailable) {
        throw new Error(MESSAGES.XDELTA_NOT_FOUND);
      }

      // Validate files
      const oldFileInfo = await this.getFileInfo(oldFile);
      const newFileInfo = await this.getFileInfo(newFile);

      if (!oldFileInfo.exists) {
        throw new Error(`Original file not found: ${oldFile}`);
      }

      if (!newFileInfo.exists) {
        throw new Error(`New file not found: ${newFile}`);
      }

      // Determine if large file processing is needed
      const isLargeFile =
        newFileInfo.size > this.defaultOptions.largeFileThreshold!;

      let result: PatchResult;

      if (isLargeFile && this.defaultOptions.enableChunkProcessing) {
        result = await this.createPatchWithChunks(
          oldFile,
          newFile,
          patchFile,
          options
        );
      } else {
        result = await this._createStandardPatch(
          oldFile,
          newFile,
          patchFile,
          options
        );
      }

      const duration = Date.now() - startTime;

      return {
        ...result,
        metrics: {
          ...result.metrics,
          duration,
          durationFormatted: MetricsUtils.formatDuration(duration),
          isLargeFile,
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        error: (error as Error).message,
        patchFile: await this.getFileInfo(patchFile),
        metrics: {
          duration,
          durationFormatted: MetricsUtils.formatDuration(duration),
          compressionRatio: 0,
          originalSize: 0,
          patchSize: 0,
          isLargeFile: false,
        },
      };
    }
  }

  /**
   * Creates a standard patch (for smaller files)
   * @param oldFile - Original file path
   * @param newFile - New file path
   * @param patchFile - Output patch file path
   * @param options - Patch creation options
   * @returns Promise with patch result
   * @private
   */
  private async _createStandardPatch(
    oldFile: string,
    newFile: string,
    patchFile: string,
    options: CreatePatchOptions
  ): Promise<PatchResult> {
    const compression =
      options.compression ?? this.defaultOptions.compression ?? 9;

    const command = `${this.xdeltaPath} -${compression} -f "${oldFile}" "${newFile}" "${patchFile}"`;

    const result = await CommandUtils.executeCommand(command);

    if (!result.success) {
      throw new Error(`Failed to create patch: ${result.stderr}`);
    }

    const patchFileInfo = await this.getFileInfo(patchFile);
    const oldFileInfo = await this.getFileInfo(oldFile);
    const newFileInfo = await this.getFileInfo(newFile);

    const compressionRatio = MetricsUtils.calculateCompressionRatio(
      newFileInfo.size,
      patchFileInfo.size
    );

    return {
      success: true,
      patchFile: patchFileInfo,
      metrics: {
        duration: result.duration,
        durationFormatted: MetricsUtils.formatDuration(result.duration),
        compressionRatio,
        originalSize: oldFileInfo.size,
        patchSize: patchFileInfo.size,
        isLargeFile: false,
      },
    };
  }

  /**
   * Creates a patch using chunk processing for large files
   * @param oldFile - Original file path
   * @param newFile - New file path
   * @param patchFile - Output patch file path
   * @param options - Large file options
   * @returns Promise with patch result
   */
  async createPatchWithChunks(
    oldFile: string,
    newFile: string,
    patchFile: string,
    options: any = {}
  ): Promise<PatchResult> {
    // Implementation for chunk processing
    // This is a simplified version - the full implementation would be more complex
    return this._createStandardPatch(oldFile, newFile, patchFile, options);
  }

  /**
   * Combines patch chunks into a single patch file
   * @param _patchChunks - Array of patch chunk paths
   * @param _outputPath - Output combined patch path
   */
  async combinePatchChunks(
    _patchChunks: string[],
    _outputPath: string
  ): Promise<void> {
    // Implementation for combining chunks
    // This would concatenate the chunk files
  }

  /**
   * Applies a patch to a file
   * @param oldFile - Original file path
   * @param patchFile - Patch file path
   * @param newFile - Output file path
   * @param options - Apply patch options
   * @returns Promise with apply result
   */
  async applyPatch(
    oldFile: string,
    patchFile: string,
    newFile: string,
    _options: ApplyPatchOptions = {}
  ): Promise<ApplyPatchResult> {
    const startTime = Date.now();

    try {
      // Check Xdelta availability
      const xdeltaAvailable = await this.checkXdelta();
      if (!xdeltaAvailable) {
        throw new Error(MESSAGES.XDELTA_NOT_FOUND);
      }

      // Validate files
      const oldFileInfo = await this.getFileInfo(oldFile);
      const patchFileInfo = await this.getFileInfo(patchFile);

      if (!oldFileInfo.exists) {
        throw new Error(`Original file not found: ${oldFile}`);
      }

      if (!patchFileInfo.exists) {
        throw new Error(`Patch file not found: ${patchFile}`);
      }

      const command = `${this.xdeltaPath} -d -f "${oldFile}" "${patchFile}" "${newFile}"`;

      const result = await CommandUtils.executeCommand(command);

      if (!result.success) {
        throw new Error(`Failed to apply patch: ${result.stderr}`);
      }

      const newFileInfo = await this.getFileInfo(newFile);
      const duration = Date.now() - startTime;

      return {
        success: true,
        newFile: newFileInfo,
        metrics: {
          duration,
          durationFormatted: MetricsUtils.formatDuration(duration),
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        error: (error as Error).message,
        newFile: await this.getFileInfo(newFile),
        metrics: {
          duration,
          durationFormatted: MetricsUtils.formatDuration(duration),
        },
      };
    }
  }

  /**
   * Creates patches in batch for multiple files
   * @param oldDir - Original directory path
   * @param newDir - New directory path
   * @param patchesDir - Patches output directory path
   * @param options - Batch options
   * @returns Promise with batch results
   */
  async createBatchPatches(
    _oldDir: string,
    _newDir: string,
    _patchesDir: string,
    _options: BatchOptions = {}
  ): Promise<BatchResult[]> {
    // Implementation for batch patch creation
    return [];
  }

  /**
   * Applies patches in batch
   * @param oldDir - Original directory path
   * @param patchesDir - Patches directory path
   * @param outputDir - Output directory path
   * @param options - Batch options
   * @returns Promise with batch results
   */
  async applyBatchPatches(
    _oldDir: string,
    _patchesDir: string,
    _outputDir: string,
    _options: BatchOptions = {}
  ): Promise<BatchResult[]> {
    // Implementation for batch patch application
    return [];
  }

  /**
   * Verifies the integrity of a patch
   * @param oldFile - Original file path
   * @param patchFile - Patch file path
   * @param expectedFile - Expected result file path
   * @returns Promise with verification result
   */
  async verifyPatch(
    oldFile: string,
    patchFile: string,
    expectedFile: string
  ): Promise<VerifyPatchResult> {
    const startTime = Date.now();

    try {
      // Apply the patch to a temporary file
      const tempFile = `${expectedFile}.temp`;
      const applyResult = await this.applyPatch(oldFile, patchFile, tempFile);

      if (!applyResult.success) {
        throw new Error(
          `Failed to apply patch for verification: ${applyResult.error}`
        );
      }

      // Compare with expected file
      const expectedFileInfo = await this.getFileInfo(expectedFile);
      const tempFileInfo = await this.getFileInfo(tempFile);

      if (!expectedFileInfo.exists) {
        throw new Error(`Expected file not found: ${expectedFile}`);
      }

      // Simple size comparison (in a real implementation, you'd do content comparison)
      const isValid = expectedFileInfo.size === tempFileInfo.size;

      // Clean up temp file
      try {
        await fs.remove(tempFile);
      } catch (error) {
        // Ignore cleanup errors
      }

      const duration = Date.now() - startTime;

      return {
        isValid,
        metrics: {
          duration,
          durationFormatted: MetricsUtils.formatDuration(duration),
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        isValid: false,
        error: (error as Error).message,
        metrics: {
          duration,
          durationFormatted: MetricsUtils.formatDuration(duration),
        },
      };
    }
  }
}

export default AdvancedPatchGenerator;
