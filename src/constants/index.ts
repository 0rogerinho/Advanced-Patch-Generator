/**
 * System constants
 */

export const DEFAULT_OPTIONS = {
  // Use a cross-platform default. On Windows, PATHEXT resolves .exe automatically.
  xdeltaPath: 'xdelta3',
  compression: 9,
  verify: true,
  showProgress: true,
  // New options for large files
  largeFileThreshold: 10 * 1024 * 1024, // 10MB - activates optimizations very early
  hugeFileThreshold: 500 * 1024 * 1024, // 500MB - much lower threshold
  extremeFileThreshold: 1000 * 1024 * 1024, // 1GB - activates extreme mode for 500MB+ files
  chunkSize: 64 * 1024 * 1024, // 64MB for chunk processing
  memoryLimit: 512 * 1024 * 1024, // 512MB memory limit
  timeout: 300000, // 5 minutes
  // New options for extremely large files
  enableChunkProcessing: true,
  maxChunkSize: 128 * 1024 * 1024, // 128MB per chunk - optimized for maximum speed
  enableStreaming: true,
} as const;

export const COMPRESSION_LEVELS = {
  MIN: 0,
  MAX: 9,
  DEFAULT: 9,
  // Optimized levels for large files
  LARGE_FILE: 6,
  HUGE_FILE: 3,
  EXTREME_FILE: 1, // Minimum compression for extremely large files
} as const;

export const FILE_EXTENSIONS = {
  PATCH: '.xdelta',
  TEMP: '.temp',
  CHUNK: '.chunk',
} as const;

export const LARGE_FILE_OPTIONS = {
  // Specific options for large files
  USE_CHUNKS: true,
  SKIP_VERIFICATION: true,
  LOWER_COMPRESSION: true,
  STREAM_PROCESSING: true,
  // New options for extremely large files
  ENABLE_CHUNK_PROCESSING: true,
  ENABLE_STREAMING: true,
  ENABLE_MEMORY_OPTIMIZATION: true,
} as const;

export const MESSAGES = {
  XDELTA_NOT_FOUND: 'Xdelta3 not found on system.',
  XDELTA_INSTALL_INSTRUCTIONS: `
📋 To install Xdelta3 on Windows:
1. Visit: https://github.com/jmacd/xdelta/releases
2. Download the latest version for Windows
3. Extract the xdelta3.exe file
4. Place xdelta3.exe in a folder in PATH
   (e.g., C:\\Windows\\System32\\ or add to system PATH)

💡 Alternatives:
   - Use Scoop: scoop install xdelta3
   - Use Chocolatey: choco install xdelta3

🔧 Or configure the path manually:
   const patchGen = new AdvancedPatchGenerator({
     xdeltaPath: "C:\\path\\to\\xdelta3.exe"
   });
`,
  PATCH_CREATED: '🎉 PATCH CREATED SUCCESSFULLY!',
  PATCH_APPLIED: '✅ PATCH APPLIED SUCCESSFULLY!',
  ERROR_CREATE_PATCH: 'Error creating patch:',
  ERROR_APPLY_PATCH: 'Error applying patch:',
  ERROR_VERIFY_PATCH: 'Error verifying patch:',
  // New messages for large files
  FILE_TOO_LARGE: 'File too large. Using optimized processing.',
  MEMORY_WARNING: 'Large file detected. Optimizing for low memory consumption.',
  CHUNK_PROCESSING: 'Processing large file in chunks to optimize memory.',
  SKIPPING_VERIFICATION:
    'Skipping verification for large file (memory optimization).',
  EXTREME_FILE_WARNING:
    'Extremely large file detected. Using chunk processing.',
  CHUNK_PROCESSING_START: 'Starting chunk processing...',
  CHUNK_PROCESSING_COMPLETE: 'Chunk processing completed!',
} as const;

export const PROGRESS_BAR = {
  DEFAULT_WIDTH: 30,
  FILLED_CHAR: '█',
  EMPTY_CHAR: '░',
} as const;

export const METRICS = {
  BYTES_CONVERSION: 1024,
  TIME_UNITS: {
    MILLISECOND: 1000,
    MINUTE: 60000,
  },
  // Optimized limits for maximum speed
  LARGE_FILE_THRESHOLD: 10 * 1024 * 1024, // 10MB
  HUGE_FILE_THRESHOLD: 500 * 1024 * 1024, // 500MB
  EXTREME_FILE_THRESHOLD: 1000 * 1024 * 1024, // 1GB
  // Removed MAX_FILE_SIZE to allow files larger than 2GB
} as const;
