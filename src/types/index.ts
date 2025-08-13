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
  details?: unknown;
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
  onComplete?: (
    result: PatchResult | ApplyPatchResult | VerifyPatchResult
  ) => void;
};

// Patch creation options
export type CreatePatchOptions = {
  compression?: number;
  verify?: boolean;
  showProgress?: boolean;
  timeout?: number;
  onProgress?: (progress: ProgressData) => void;
  onError?: (error: ErrorData) => void;
  onComplete?: (result: PatchResult) => void;
};

// Apply patch options
export type ApplyPatchOptions = {
  showProgress?: boolean;
  timeout?: number;
  onProgress?: (progress: ProgressData) => void;
  onError?: (error: ErrorData) => void;
  onComplete?: (result: ApplyPatchResult) => void;
};

// Batch options
export type BatchOptions = {
  showProgress?: boolean;
  timeout?: number;
  onProgress?: (progress: ProgressData) => void;
  onError?: (error: ErrorData) => void;
  onComplete?: (result: BatchResult[]) => void;
};

// Command execution result
export type CommandResult = {
  success: boolean;
  stdout: string;
  stderr: string;
  duration: number;
};

// Chunk information for large file processing
export type ChunkInfo = {
  start: number;
  end: number;
  size: number;
  index: number;
};

// Large file options
export type LargeFileOptions = {
  chunkSize?: number;
  overlap?: number;
  compression?: number;
  onProgress?: (progress: ProgressData) => void;
};

// Patch analysis result
export type PatchAnalysisResult = {
  success: boolean;
  error?: string;
  patchInfo: {
    size: number;
    sizeFormatted: string;
    compressionRatio?: number;
    estimatedOriginalSize?: number;
    estimatedNewSize?: number;
  };
  metadata?: Record<string, unknown>;
};

// Patch comparison result
export type PatchComparisonResult = {
  success: boolean;
  error?: string;
  comparison: {
    sizeDifference: number;
    sizeDifferenceFormatted: string;
    compressionRatioDifference: number;
    similarity: number; // 0-100%
  };
};

// Patch information result
export type PatchInfoResult = {
  success: boolean;
  error?: string;
  info: {
    size: number;
    sizeFormatted: string;
    format: string;
    version?: string;
    flags?: string[];
    metadata?: Record<string, unknown>;
  };
};

// Main class type
export type IAdvancedPatchGenerator = EventEmitter & {
  xdeltaPath: string;
  defaultOptions: AdvancedPatchGeneratorOptions;

  // Core methods
  checkXdelta(): Promise<boolean>;
  getFileInfo(filePath: string): Promise<FileInfo>;
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

  // Large file methods
  createPatchWithChunks(
    oldFile: string,
    newFile: string,
    patchFile: string,
    options?: LargeFileOptions
  ): Promise<PatchResult>;
  combinePatchChunks(patchChunks: string[], outputPath: string): Promise<void>;

  // Batch methods
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

  // Event emitter methods
  on(
    event: 'progress',
    listener: (data: ProgressData) => void
  ): IAdvancedPatchGenerator;
  on(
    event: 'error',
    listener: (error: ErrorData) => void
  ): IAdvancedPatchGenerator;
  on(
    event: 'complete',
    listener: (
      result: PatchResult | ApplyPatchResult | VerifyPatchResult
    ) => void
  ): IAdvancedPatchGenerator;
  on(
    event: string,
    listener: (...args: unknown[]) => void
  ): IAdvancedPatchGenerator;

  emit(event: 'progress', data: ProgressData): boolean;
  emit(event: 'error', error: ErrorData): boolean;
  emit(
    event: 'complete',
    result: PatchResult | ApplyPatchResult | VerifyPatchResult
  ): boolean;
  emit(event: string, ...args: unknown[]): boolean;
};

// Patch analyzer type
export type IPatchAnalyzer = {
  analyzePatch(patchFile: string): Promise<PatchAnalysisResult>;
  comparePatches(
    patch1: string,
    patch2: string
  ): Promise<PatchComparisonResult>;
  getPatchInfo(patchFile: string): Promise<PatchInfoResult>;
};
