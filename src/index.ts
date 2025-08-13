// Main exports
export { default as AdvancedPatchGenerator } from './lib/AdvancedPatchGenerator.js';
export { default as PatchAnalyzer } from './lib/PatchAnalyzer.js';

// Default export for backward compatibility
export { default } from './lib/AdvancedPatchGenerator.js';

// Export all types and interfaces
export type {
  // Core types
  ProgressData,
  ErrorData,
  FileInfo,
  PatchResult,
  ApplyPatchResult,
  VerifyPatchResult,
  BatchResult,

  // Options types
  AdvancedPatchGeneratorOptions,
  CreatePatchOptions,
  ApplyPatchOptions,
  BatchOptions,
  LargeFileOptions,

  // Utility types
  CommandResult,
  ChunkInfo,

  // Analysis types
  PatchAnalysisResult,
  PatchComparisonResult,
  PatchInfoResult,

  // Interface types
  IAdvancedPatchGenerator,
  IPatchAnalyzer,
} from './types/index.js';

// Export utilities
export * from './utils/index.js';
export * from './validations/index.js';
export * from './constants/index.js';

// Re-export for convenience
export { DEFAULT_OPTIONS, MESSAGES } from './constants/index.js';
