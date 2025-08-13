import fs from 'fs-extra';
import type {
  PatchAnalysisResult,
  PatchComparisonResult,
  PatchInfoResult,
  IPatchAnalyzer,
} from '../types/index.js';

/**
 * Utility class for analyzing patch files
 * @class PatchAnalyzer
 * @implements IPatchAnalyzer
 */
class PatchAnalyzer implements IPatchAnalyzer {
  /**
   * Analyzes a patch file and returns detailed information
   * @param patchFile - Path to the patch file
   * @returns Promise with patch analysis result
   */
  async analyzePatch(patchFile: string): Promise<PatchAnalysisResult> {
    try {
      const stats = await fs.stat(patchFile);

      return {
        success: true,
        patchInfo: {
          size: stats.size,
          sizeFormatted: PatchAnalyzer.formatBytes(stats.size),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        patchInfo: {
          size: 0,
          sizeFormatted: '0 B',
        },
      };
    }
  }

  /**
   * Compares two patch files and returns comparison metrics
   * @param patch1 - Path to first patch file
   * @param patch2 - Path to second patch file
   * @returns Promise with patch comparison result
   */
  async comparePatches(
    patch1: string,
    patch2: string
  ): Promise<PatchComparisonResult> {
    try {
      const stats1 = await fs.stat(patch1);
      const stats2 = await fs.stat(patch2);

      const sizeDifference = Math.abs(stats1.size - stats2.size);
      const similarity =
        stats1.size === stats2.size
          ? 100
          : Math.max(
              0,
              100 - (sizeDifference / Math.max(stats1.size, stats2.size)) * 100
            );

      return {
        success: true,
        comparison: {
          sizeDifference,
          sizeDifferenceFormatted: PatchAnalyzer.formatBytes(sizeDifference),
          compressionRatioDifference: 0, // Would need actual analysis
          similarity,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        comparison: {
          sizeDifference: 0,
          sizeDifferenceFormatted: '0 B',
          compressionRatioDifference: 0,
          similarity: 0,
        },
      };
    }
  }

  /**
   * Gets basic information about a patch file
   * @param patchFile - Path to the patch file
   * @returns Promise with patch information result
   */
  async getPatchInfo(patchFile: string): Promise<PatchInfoResult> {
    try {
      const stats = await fs.stat(patchFile);

      return {
        success: true,
        info: {
          size: stats.size,
          sizeFormatted: PatchAnalyzer.formatBytes(stats.size),
          format: 'xdelta',
          version: '3',
          flags: [],
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        info: {
          size: 0,
          sizeFormatted: '0 B',
          format: 'unknown',
          flags: [],
        },
      };
    }
  }

  /**
   * Formats bytes into human-readable format
   * @param bytes - Number of bytes
   * @returns Formatted string
   * @private
   */
  private static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Static methods for convenience
  static async analyzePatch(patchFile: string): Promise<PatchAnalysisResult> {
    const instance = new PatchAnalyzer();
    return instance.analyzePatch(patchFile);
  }

  static async comparePatches(
    patch1: string,
    patch2: string
  ): Promise<PatchComparisonResult> {
    const instance = new PatchAnalyzer();
    return instance.comparePatches(patch1, patch2);
  }

  static async getPatchInfo(patchFile: string): Promise<PatchInfoResult> {
    const instance = new PatchAnalyzer();
    return instance.getPatchInfo(patchFile);
  }
}

export default PatchAnalyzer;
