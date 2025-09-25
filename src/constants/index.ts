/**
 * System constants
 */

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';

// Function to validate if the found file is actually the correct xdelta3-3.1.0.exe
function validateXdeltaExecutable(filePath: string): boolean {
  try {
    // Verifica se o arquivo existe
    if (!fs.existsSync(filePath)) {
      return false;
    }

    // Verifica se é realmente um arquivo
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) {
      return false;
    }

    // Verifica se o nome do arquivo está correto
    const fileName = path.basename(filePath);
    if (fileName !== 'xdelta3-3.1.0.exe') {
      return false;
    }

    // Verifica se está dentro do diretório do pacote (quando possível)
    try {
      const packagePath = require.resolve(
        'advanced-patch-generator/package.json'
      );
      const packageDir = path.dirname(packagePath);
      const relativePath = path.relative(packageDir, filePath);

      // O arquivo deve estar no diretório raiz do pacote ou em subdiretórios válidos
      return !relativePath.startsWith('..') && !path.isAbsolute(relativePath);
    } catch {
      // Se não conseguir resolver o pacote, aceita o arquivo se passar nas outras validações
      return true;
    }
  } catch {
    return false;
  }
}

// Helper function to check if a path is valid and log debug info
function checkPath(possiblePath: string, debug: boolean): string | null {
  if (!possiblePath) return null;

  try {
    if (fs.existsSync(possiblePath)) {
      const isValidXdelta = validateXdeltaExecutable(possiblePath);
      if (isValidXdelta) {
        if (debug) {
          console.log(
            `✅ [DEBUG] Found valid xdelta3-3.1.0.exe at: ${possiblePath}`
          );
        }
        return possiblePath;
      } else if (debug) {
        console.log(
          `⚠️ [DEBUG] Found file but validation failed: ${possiblePath}`
        );
      }
    } else if (debug) {
      console.log(`❌ [DEBUG] Not found at: ${possiblePath}`);
    }
  } catch (error) {
    if (debug) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.log(
        `⚠️ [DEBUG] Error checking: ${possiblePath} - ${errorMessage}`
      );
    }
  }

  return null;
}

// Function to find the xdelta3-3.1.0.exe file
function findXdeltaExecutable(): string {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // Debug information
  const debug =
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG === 'advanced-patch-generator';

  if (debug) {
    console.log('🔍 [DEBUG] Searching for xdelta3-3.1.0.exe...');
    console.log('📁 [DEBUG] Current module dir:', __dirname);
    console.log('📁 [DEBUG] Current working dir:', process.cwd());
  }

  // Possible locations for the executable
  const possiblePaths = [
    // ✅ CORRIGIDO: Para instalação via npm (dist/constants -> package root)
    path.resolve(__dirname, '../xdelta3-3.1.0.exe'),
    // Development: from src/constants to project root
    path.resolve(__dirname, '../../../xdelta3-3.1.0.exe'),
    // ✅ NOVO: Busca usando require.resolve (mais confiável para npm)
    (() => {
      try {
        const packagePath = require.resolve(
          'advanced-patch-generator/package.json'
        );
        return path.resolve(path.dirname(packagePath), 'xdelta3-3.1.0.exe');
      } catch {
        return null;
      }
    })(),
    // ✅ NOVO: Busca usando import.meta.resolve (ES6 moderno)
    (() => {
      try {
        const resolved = import.meta.resolve(
          'advanced-patch-generator/xdelta3-3.1.0.exe'
        );
        return path.resolve(resolved);
      } catch {
        return null;
      }
    })(),
    // Fallback: try to find in current working directory
    path.resolve(process.cwd(), 'xdelta3-3.1.0.exe'),
    // Fallback: try to find in node_modules
    path.resolve(
      process.cwd(),
      'node_modules/advanced-patch-generator/xdelta3-3.1.0.exe'
    ),
    // Legacy fallback: old path structure
    path.resolve(__dirname, '../../xdelta3-3.1.0.exe'),
  ];

  // Check each possible path synchronously
  for (const possiblePath of possiblePaths) {
    if (possiblePath) {
      const result = checkPath(possiblePath, debug);
      if (result) {
        return result;
      }
    }
  }

  // If none found, return the most likely path (development/production)
  const fallbackPath = path.resolve(__dirname, '../xdelta3-3.1.0.exe');
  if (debug) {
    console.log(
      `⚠️ [DEBUG] No xdelta3-3.1.0.exe found, using fallback: ${fallbackPath}`
    );
  }
  return fallbackPath;
}

export const DEFAULT_OPTIONS = {
  // Use the included xdelta3-3.1.0.exe file with automatic detection
  xdeltaPath: findXdeltaExecutable(),
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
  XDELTA_NOT_FOUND:
    'Xdelta3 local executable not found. The included xdelta3-3.1.0.exe file may be missing or corrupted.',
  XDELTA_INSTALL_INSTRUCTIONS: `
📋 The library uses ONLY the included xdelta3-3.1.0.exe file and does not use system-installed xdelta.

🔧 If you encounter issues, you can:
1. Ensure xdelta3-3.1.0.exe is present in the project root
2. Check if the file has proper execution permissions
3. Or configure a custom path manually:
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
