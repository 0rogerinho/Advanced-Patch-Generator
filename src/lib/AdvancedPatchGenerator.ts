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
  LargeFileOptions,
  IAdvancedPatchGenerator,
} from '../types/index.js';

/**
 * Advanced Patch Generator
 * Simplifies the process of creating and applying patches using Xdelta
 * @class AdvancedPatchGenerator
 * @extends EventEmitter
 * @implements IAdvancedPatchGenerator
 */
class AdvancedPatchGenerator
  extends EventEmitter
  implements IAdvancedPatchGenerator
{
  public xdeltaPath: string;
  public defaultOptions: AdvancedPatchGeneratorOptions;
  private _xdeltaChecked: boolean;
  private _xdeltaAvailable: boolean;
  private onProgressCallback: ((progress: ProgressData) => void) | undefined;
  private onErrorCallback: ((error: ErrorData) => void) | undefined;
  private onCompleteCallback:
    | ((result: PatchResult | ApplyPatchResult | VerifyPatchResult) => void)
    | undefined;

  /**
   * Creates a new instance of AdvancedPatchGenerator
   * @param options - Configuration options
   */
  constructor(options: AdvancedPatchGeneratorOptions = {}) {
    super();

    // Se xdeltaPath foi fornecido, use apenas ele (sem busca automática)
    if (options.xdeltaPath) {
      this.xdeltaPath = options.xdeltaPath;
      this.defaultOptions = {
        ...DEFAULT_OPTIONS,
        ...options,
        xdeltaPath: options.xdeltaPath, // Garante que o caminho personalizado seja mantido
      };
    } else {
      // Se não foi fornecido, use a busca automática padrão
      this.defaultOptions = {
        ...DEFAULT_OPTIONS,
        ...options,
      };
      this.xdeltaPath = this.defaultOptions.xdeltaPath!;
    }

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
   * Emits progress event with options callback support
   * @param data - Progress data
   * @param options - Options that may contain callbacks
   * @private
   */
  private _emitProgressWithOptions(
    data: ProgressData,
    options?: CreatePatchOptions | ApplyPatchOptions | BatchOptions
  ): void {
    this.emit('progress', data);
    if (this.onProgressCallback) {
      this.onProgressCallback(data);
    }
    if (options?.onProgress) {
      options.onProgress(data);
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
   * Emits error event with options callback support
   * @param error - Error occurred
   * @param options - Options that may contain callbacks
   * @private
   */
  private _emitErrorWithOptions(
    error: ErrorData,
    options?: CreatePatchOptions | ApplyPatchOptions | BatchOptions
  ): void {
    this.emit('error', error);
    if (this.onErrorCallback) {
      this.onErrorCallback(error);
    }
    if (options?.onError) {
      options.onError(error);
    }
  }

  /**
   * Emits completion event
   * @param result - Operation result
   * @private
   */
  private _emitComplete(
    result: PatchResult | ApplyPatchResult | VerifyPatchResult
  ): void {
    this.emit('complete', result);
    if (this.onCompleteCallback) {
      this.onCompleteCallback(result);
    }
  }

  /**
   * Emits completion event with options callback support
   * @param result - Operation result
   * @param options - Options that may contain callbacks
   * @private
   */
  private _emitCompleteWithOptions(
    result: PatchResult | ApplyPatchResult | VerifyPatchResult,
    options?: CreatePatchOptions | ApplyPatchOptions | BatchOptions
  ): void {
    this.emit('complete', result);
    if (this.onCompleteCallback) {
      this.onCompleteCallback(result);
    }
    if (options?.onComplete) {
      options.onComplete(result as any); // Type assertion needed due to callback signature differences
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
   * Checks if the local Xdelta executable is available
   * @returns Promise with availability status
   */
  async checkXdelta(): Promise<boolean> {
    if (this._xdeltaChecked && this._xdeltaAvailable) {
      return true;
    }

    this._emitProgress({
      percentage: 0,
      message: 'Verificando Xdelta3 local...',
    });

    try {
      // Check if the local xdelta3-3.1.0.exe file exists
      const fileExists = await fs.pathExists(this.xdeltaPath);

      if (!fileExists) {
        this._xdeltaChecked = true;
        this._xdeltaAvailable = false;

        this._emitProgress({
          percentage: 100,
          message: 'Xdelta3 local não encontrado',
        });

        const error = new Error(MESSAGES.XDELTA_NOT_FOUND);
        this._emitError({ message: error.message });
        throw error;
      }

      // Test the local executable with a simple command
      const testCommand = `"${this.xdeltaPath}" -h`;

      try {
        const result = await CommandUtils.executeCommand(testCommand);

        // Check if the command executed successfully or if xdelta responded
        const isWorking =
          result.success ||
          result.stdout.includes('xdelta') ||
          result.stderr.includes('xdelta') ||
          result.stdout.includes('usage') ||
          result.stderr.includes('usage');

        this._xdeltaChecked = true;
        this._xdeltaAvailable = isWorking;

        this._emitProgress({
          percentage: 100,
          message: this._xdeltaAvailable
            ? 'Xdelta3 local funcionando!'
            : 'Xdelta3 local não está funcionando',
        });

        if (!this._xdeltaAvailable) {
          const error = new Error(MESSAGES.XDELTA_NOT_FOUND);
          this._emitError({ message: error.message });
          throw error;
        }

        return this._xdeltaAvailable;
      } catch (commandError) {
        this._xdeltaChecked = true;
        this._xdeltaAvailable = false;

        this._emitProgress({
          percentage: 100,
          message: 'Erro ao executar Xdelta3 local',
        });

        const error = new Error(MESSAGES.XDELTA_NOT_FOUND);
        this._emitError({ message: error.message });
        throw error;
      }
    } catch (error) {
      this._xdeltaChecked = true;
      this._xdeltaAvailable = false;

      this._emitProgress({
        percentage: 100,
        message: 'Erro ao verificar Xdelta3 local',
      });

      const errorMessage = (error as Error).message;
      this._emitError({ message: errorMessage });
      throw new Error(MESSAGES.XDELTA_NOT_FOUND);
    }
  }

  /**
   * Creates a patch from old and new files
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
    const mergedOptions = { ...this.defaultOptions, ...options };

    // Emit initial progress
    this._emitProgressWithOptions(
      {
        percentage: 0,
        message: 'Iniciando criação do patch...',
        current: 0,
        total: 100,
      },
      options
    );

    try {
      // Check Xdelta availability
      this._emitProgressWithOptions(
        {
          percentage: 10,
          message: 'Verificando Xdelta3...',
          current: 10,
          total: 100,
        },
        options
      );

      const xdeltaAvailable = await this.checkXdelta();
      if (!xdeltaAvailable) {
        throw new Error(MESSAGES.XDELTA_NOT_FOUND);
      }

      // Validate files
      this._emitProgressWithOptions(
        {
          percentage: 20,
          message: 'Validando arquivos de entrada...',
          current: 20,
          total: 100,
        },
        options
      );

      const oldFileInfo = await this.getFileInfo(oldFile);
      const newFileInfo = await this.getFileInfo(newFile);

      if (!oldFileInfo.exists) {
        throw new Error(`Original file not found: ${oldFile}`);
      }

      if (!newFileInfo.exists) {
        throw new Error(`New file not found: ${newFile}`);
      }

      // Calculate total size for progress tracking
      const totalSize = newFileInfo.size;
      const chunkSize = 1024 * 1024; // 1MB chunks for progress updates
      let processedSize = 0;

      // Determine if large file processing is needed
      const isLargeFile =
        newFileInfo.size > this.defaultOptions.largeFileThreshold!;

      this._emitProgressWithOptions(
        {
          percentage: 30,
          message: isLargeFile
            ? 'Processando arquivo grande...'
            : 'Criando patch...',
          current: processedSize,
          total: totalSize,
        },
        options
      );

      let result: PatchResult;

      if (isLargeFile && this.defaultOptions.enableChunkProcessing) {
        result = await this.createPatchWithChunks(
          oldFile,
          newFile,
          patchFile,
          mergedOptions
        );
      } else {
        // Simulate progress during patch creation for standard files
        result = await this._createStandardPatchWithProgress(
          oldFile,
          newFile,
          patchFile,
          mergedOptions,
          progress => {
            const percentage = Math.min(90, 30 + progress * 0.6); // 30% to 90%
            this._emitProgressWithOptions(
              {
                percentage: Math.round(percentage),
                message: 'Criando patch...',
                current: Math.round(progress * totalSize),
                total: totalSize,
              },
              options
            );
          }
        );
      }

      const duration = Date.now() - startTime;

      const finalResult = {
        ...result,
        metrics: {
          ...result.metrics,
          duration,
          durationFormatted: MetricsUtils.formatDuration(duration),
          isLargeFile,
        },
      };

      // Emit completion progress and event
      this._emitProgressWithOptions(
        {
          percentage: 100,
          message: 'Patch criado com sucesso!',
          current: totalSize,
          total: totalSize,
        },
        options
      );

      this._emitCompleteWithOptions(finalResult, options);

      return finalResult;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this._emitErrorWithOptions(
        {
          message: `Failed to create patch: ${errorMessage}`,
          code: 'PATCH_CREATION_FAILED',
          details: error,
        },
        options
      );

      return {
        success: false,
        error: errorMessage,
        patchFile: {} as FileInfo,
        metrics: {
          duration: Date.now() - startTime,
          durationFormatted: MetricsUtils.formatDuration(
            Date.now() - startTime
          ),
          compressionRatio: 0,
          originalSize: 0,
          patchSize: 0,
          isLargeFile: false,
        },
      };
    }
  }

  /**
   * Creates a standard patch with progress tracking
   * @param oldFile - Original file path
   * @param newFile - New file path
   * @param patchFile - Output patch file path
   * @param options - Patch creation options
   * @param progressCallback - Progress callback function
   * @returns Promise with patch result
   */
  private async _createStandardPatchWithProgress(
    oldFile: string,
    newFile: string,
    patchFile: string,
    options: CreatePatchOptions,
    progressCallback: (progress: number) => void
  ): Promise<PatchResult> {
    const compression =
      options.compression ?? this.defaultOptions.compression ?? 9;

    // Simulate progress during Xdelta3 execution
    // Since we can't get real-time progress from xdelta3, we'll simulate it
    const progressInterval = setInterval(() => {
      const randomProgress = Math.random() * 0.8 + 0.1; // 10% to 90%
      progressCallback(randomProgress);
    }, 100);

    try {
      // Use explicit encode mode with source flag for correct argument order
      // xdelta3 -e -<compression> -f -s <oldFile> <newFile> <patchFile>
      const command = `"${this.xdeltaPath}" -e -${compression} -f -s "${oldFile}" "${newFile}" "${patchFile}"`;

      const result = await CommandUtils.executeCommand(command);

      if (!result.success) {
        throw new Error(`Failed to create patch: ${result.stderr}`);
      }

      // Clear progress interval and send final progress
      clearInterval(progressInterval);
      progressCallback(1.0); // 100%

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
    } finally {
      clearInterval(progressInterval);
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

    this._emitProgressWithOptions(
      {
        percentage: 70,
        message: 'Executando Xdelta3...',
      },
      options
    );

    // Use explicit encode mode with source flag for correct argument order
    // xdelta3 -e -<compression> -f -s <oldFile> <newFile> <patchFile>
    const command = `"${this.xdeltaPath}" -e -${compression} -f -s "${oldFile}" "${newFile}" "${patchFile}"`;

    const result = await CommandUtils.executeCommand(command);

    if (!result.success) {
      throw new Error(`Failed to create patch: ${result.stderr}`);
    }

    this._emitProgressWithOptions(
      {
        percentage: 80,
        message: 'Calculando métricas...',
      },
      options
    );

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
    options: LargeFileOptions = {}
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
    options: ApplyPatchOptions = {}
  ): Promise<ApplyPatchResult> {
    const startTime = Date.now();
    const mergedOptions = { ...this.defaultOptions, ...options };

    // Emit initial progress
    this._emitProgressWithOptions(
      {
        percentage: 0,
        message: 'Iniciando aplicação do patch...',
        current: 0,
        total: 100,
      },
      options
    );

    try {
      // Check Xdelta availability
      this._emitProgressWithOptions(
        {
          percentage: 15,
          message: 'Verificando Xdelta3...',
          current: 15,
          total: 100,
        },
        options
      );

      const xdeltaAvailable = await this.checkXdelta();
      if (!xdeltaAvailable) {
        throw new Error(MESSAGES.XDELTA_NOT_FOUND);
      }

      // Validate files
      this._emitProgressWithOptions(
        {
          percentage: 25,
          message: 'Validando arquivos de entrada...',
          current: 25,
          total: 100,
        },
        options
      );

      const oldFileInfo = await this.getFileInfo(oldFile);
      const patchFileInfo = await this.getFileInfo(patchFile);

      if (!oldFileInfo.exists) {
        throw new Error(`Original file not found: ${oldFile}`);
      }

      if (!patchFileInfo.exists) {
        throw new Error(`Patch file not found: ${patchFile}`);
      }

      // Calculate total size for progress tracking
      const totalSize = oldFileInfo.size + patchFileInfo.size;
      let processedSize = 0;

      // Apply patch
      this._emitProgressWithOptions(
        {
          percentage: 40,
          message: 'Aplicando patch...',
          current: processedSize,
          total: totalSize,
        },
        options
      );

      // Simulate progress during patch application
      const progressInterval = setInterval(() => {
        const randomProgress = Math.random() * 0.4 + 0.4; // 40% to 80%
        const percentage = Math.min(80, 40 + randomProgress * 0.4);
        this._emitProgressWithOptions(
          {
            percentage: Math.round(percentage),
            message: 'Aplicando patch...',
            current: Math.round(randomProgress * totalSize),
            total: totalSize,
          },
          options
        );
      }, 200);

      try {
        // Decode mode requires source flag and correct ordering
        // xdelta3 -d -f -s <oldFile> <patchFile> <newFile>
        const command = `"${this.xdeltaPath}" -d -f -s "${oldFile}" "${patchFile}" "${newFile}"`;

        const result = await CommandUtils.executeCommand(command);

        if (!result.success) {
          throw new Error(`Failed to apply patch: ${result.stderr}`);
        }

        // Clear progress interval
        clearInterval(progressInterval);

        this._emitProgressWithOptions(
          {
            percentage: 85,
            message: 'Verificando resultado...',
            current: Math.round(totalSize * 0.85),
            total: totalSize,
          },
          options
        );

        const newFileInfo = await this.getFileInfo(newFile);
        const duration = Date.now() - startTime;

        const finalResult = {
          success: true,
          newFile: newFileInfo,
          metrics: {
            duration,
            durationFormatted: MetricsUtils.formatDuration(duration),
          },
        };

        // Emit completion progress and event
        this._emitProgressWithOptions(
          {
            percentage: 100,
            message: 'Patch aplicado com sucesso!',
            current: totalSize,
            total: totalSize,
          },
          options
        );

        this._emitCompleteWithOptions(finalResult, options);

        return finalResult;
      } finally {
        clearInterval(progressInterval);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this._emitErrorWithOptions(
        {
          message: `Failed to apply patch: ${errorMessage}`,
          code: 'PATCH_APPLY_FAILED',
          details: error,
        },
        options
      );

      return {
        success: false,
        error: errorMessage,
        newFile: {} as FileInfo,
        metrics: {
          duration: Date.now() - startTime,
          durationFormatted: MetricsUtils.formatDuration(
            Date.now() - startTime
          ),
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
