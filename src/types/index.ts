import { EventEmitter } from 'events';

// Progress event data
export type ProgressData = {
  percentage: number;
  message: string;
  current?: number;
  total?: number;
  speed?: string;
  eta?: string;
};

// Error data
export type ErrorData = {
  message: string;
  code?: string;
  details?: any;
};

// File information
export type FileInfo = {
  exists: boolean;
  size: number;
  sizeFormatted: string;
  modified: Date;
  path: string;
  isDirectory: boolean;
};

// Patch result
export type PatchResult = {
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
};

// Apply patch result
export type ApplyPatchResult = {
  success: boolean;
  error?: string;
  newFile: FileInfo;
  metrics: {
    duration: number;
    durationFormatted: string;
  };
};

// Verify patch result
export type VerifyPatchResult = {
  isValid: boolean;
  error?: string;
  metrics: {
    duration: number;
    durationFormatted: string;
  };
};

// Batch operation result
export type BatchResult = {
  file: string;
  status: 'success' | 'error' | 'skipped';
  error?: string;
  metrics?: {
    duration: number;
    durationFormatted: string;
  };
};

// Main options type
export type AdvancedPatchGeneratorOptions = {
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
};

// Patch creation options
export type CreatePatchOptions = {
  compression?: number;
  verify?: boolean;
  showProgress?: boolean;
  timeout?: number;
  onProgress?: (progress: ProgressData) => void;
  onError?: (error: ErrorData) => void;
  onComplete?: (result: any) => void;
};

// Apply patch options
export type ApplyPatchOptions = {
  verify?: boolean;
  showProgress?: boolean;
  timeout?: number;
  onProgress?: (progress: ProgressData) => void;
  onError?: (error: ErrorData) => void;
  onComplete?: (result: any) => void;
};

// Batch options
export type BatchOptions = {
  maxParallel?: number;
  compression?: number;
  verify?: boolean;
  showProgress?: boolean;
  timeout?: number;
};

// Chunk information for large files
export type ChunkInfo = {
  start: number;
  end: number;
  size: number;
  index: number;
};

// Large file processing options
export type LargeFileOptions = {
  chunkSize?: number;
  overlap?: number;
  compression?: number;
  timeout?: number;
};

// Command execution result
export type CommandResult = {
  success: boolean;
  stdout: string;
  stderr: string;
  error?: Error;
  duration: number;
};

// Metrics utilities type
export type MetricsUtils = {
  formatBytes(bytes: number): string;
  formatDuration(ms: number): string;
  calculateCompressionRatio(originalSize: number, patchSize: number): number;
  calculateSpeed(bytes: number, duration: number): string;
  calculateETA(processed: number, total: number, speed: number): string;
};

// Display utilities type
export type DisplayUtils = {
  createProgressBar(total: number): (current: number) => void;
  formatFileInfo(fileInfo: FileInfo): string;
  formatPatchResult(result: PatchResult): string;
  formatBatchResult(results: BatchResult[]): string;
};

// File validation type
export type FileValidation = {
  validateFileExists(filePath: string): Promise<boolean>;
  validateFileReadable(filePath: string): Promise<boolean>;
  validateFileWritable(filePath: string): Promise<boolean>;
  validateDirectoryExists(dirPath: string): Promise<boolean>;
  validateXdeltaAvailable(): Promise<boolean>;
};

// Patch analyzer type
export type PatchAnalyzer = {
  analyzePatch(patchFile: string): Promise<any>;
  comparePatches(patch1: string, patch2: string): Promise<any>;
  getPatchInfo(patchFile: string): Promise<any>;
};

// Main class type
export type IAdvancedPatchGenerator = EventEmitter & {
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
};
