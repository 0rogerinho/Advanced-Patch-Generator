import { EventEmitter } from 'events';

// Progress event data
export interface ProgressData {
  percentage: number;
  message: string;
  current?: number;
  total?: number;
  speed?: string;
  eta?: string;
}

// Error data
export interface ErrorData {
  message: string;
  code?: string;
  details?: any;
}

// File information
export interface FileInfo {
  exists: boolean;
  size: number;
  sizeFormatted: string;
  modified: Date;
  path: string;
  isDirectory: boolean;
}

// Patch result
export interface PatchResult {
  success: boolean;
  error?: string;
  patchFile: FileInfo;
  metrics: {
    duration: number;
    durationFormatted: string;
    compressionRatio: number;
    originalSize: number;
    patchSize: number;
    isLargeFile: boolean;
  };
}

// Apply patch result
export interface ApplyPatchResult {
  success: boolean;
  error?: string;
  newFile: FileInfo;
  metrics: {
    duration: number;
    durationFormatted: string;
  };
}

// Verify patch result
export interface VerifyPatchResult {
  isValid: boolean;
  error?: string;
  metrics: {
    duration: number;
    durationFormatted: string;
  };
}

// Batch operation result
export interface BatchResult {
  file: string;
  status: 'success' | 'error' | 'skipped';
  error?: string;
  metrics?: {
    duration: number;
    durationFormatted: string;
  };
}

// Main options interface
export interface AdvancedPatchGeneratorOptions {
  xdeltaPath?: string;
  compression?: number;
  verify?: boolean;
  showProgress?: boolean;
  largeFileThreshold?: number;
  timeout?: number;
  memoryLimit?: number;
  enableChunkProcessing?: boolean;
  onProgress?: (progress: ProgressData) => void;
  onError?: (error: ErrorData) => void;
  onComplete?: (result: any) => void;
}

// Patch creation options
export interface CreatePatchOptions {
  compression?: number;
  verify?: boolean;
  showProgress?: boolean;
  timeout?: number;
}

// Apply patch options
export interface ApplyPatchOptions {
  verify?: boolean;
  showProgress?: boolean;
  timeout?: number;
}

// Batch options
export interface BatchOptions {
  maxParallel?: number;
  compression?: number;
  verify?: boolean;
  showProgress?: boolean;
  timeout?: number;
}

// Chunk information for large files
export interface ChunkInfo {
  start: number;
  end: number;
  size: number;
  index: number;
}

// Large file processing options
export interface LargeFileOptions {
  chunkSize?: number;
  overlap?: number;
  compression?: number;
  timeout?: number;
}

// Command execution result
export interface CommandResult {
  success: boolean;
  stdout: string;
  stderr: string;
  error?: Error;
  duration: number;
}

// Metrics utilities interface
export interface MetricsUtils {
  formatBytes(bytes: number): string;
  formatDuration(ms: number): string;
  calculateCompressionRatio(originalSize: number, patchSize: number): number;
  calculateSpeed(bytes: number, duration: number): string;
  calculateETA(processed: number, total: number, speed: number): string;
}

// Display utilities interface
export interface DisplayUtils {
  createProgressBar(total: number): (current: number) => void;
  formatFileInfo(fileInfo: FileInfo): string;
  formatPatchResult(result: PatchResult): string;
  formatBatchResult(results: BatchResult[]): string;
}

// File validation interface
export interface FileValidation {
  validateFileExists(filePath: string): Promise<boolean>;
  validateFileReadable(filePath: string): Promise<boolean>;
  validateFileWritable(filePath: string): Promise<boolean>;
  validateDirectoryExists(dirPath: string): Promise<boolean>;
  validateXdeltaAvailable(): Promise<boolean>;
}

// Patch analyzer interface
export interface PatchAnalyzer {
  analyzePatch(patchFile: string): Promise<any>;
  comparePatches(patch1: string, patch2: string): Promise<any>;
  getPatchInfo(patchFile: string): Promise<any>;
}

// Main class interface
export interface IAdvancedPatchGenerator extends EventEmitter {
  xdeltaPath: string;
  defaultOptions: AdvancedPatchGeneratorOptions;

  getFileInfo(filePath: string): Promise<FileInfo>;
  checkXdelta(): Promise<boolean>;
  createPatch(
    oldFile: string,
    newFile: string,
    patchFile: string,
    options?: CreatePatchOptions
  ): Promise<PatchResult>;
  applyPatch(
    oldFile: string,
    patchFile: string,
    newFile: string,
    options?: ApplyPatchOptions
  ): Promise<ApplyPatchResult>;
  verifyPatch(
    oldFile: string,
    patchFile: string,
    expectedFile: string
  ): Promise<VerifyPatchResult>;
  createBatchPatches(
    oldDir: string,
    newDir: string,
    patchesDir: string,
    options?: BatchOptions
  ): Promise<BatchResult[]>;
  applyBatchPatches(
    oldDir: string,
    patchesDir: string,
    outputDir: string,
    options?: BatchOptions
  ): Promise<BatchResult[]>;
  createPatchWithChunks(
    oldFile: string,
    newFile: string,
    patchFile: string,
    options?: LargeFileOptions
  ): Promise<PatchResult>;
  combinePatchChunks(patchChunks: string[], outputPath: string): Promise<void>;
}
