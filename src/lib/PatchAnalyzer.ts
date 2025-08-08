import fs from 'fs-extra';
import type { FileInfo } from '../types/index.js';
import MetricsUtils from '../utils/metrics.js';

/**
 * Patch analyzer for analyzing patch files
 */
class PatchAnalyzer {
  /**
   * Analyzes a patch file
   * @param patchFile - Path to the patch file
   * @returns Promise with analysis result
   */
  static async analyzePatch(patchFile: string): Promise<any> {
    try {
      const stats = await fs.stat(patchFile);
      const fileInfo: FileInfo = {
        exists: true,
        size: stats.size,
        sizeFormatted: MetricsUtils.formatBytes(stats.size),
        modified: stats.mtime,
        path: patchFile,
        isDirectory: false,
      };

      return {
        success: true,
        patchFile: fileInfo,
        analysis: {
          size: stats.size,
          sizeFormatted: fileInfo.sizeFormatted,
          modified: stats.mtime,
          isCompressed: true, // Xdelta patches are always compressed
        },
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Compares two patches
   * @param patch1 - Path to first patch
   * @param patch2 - Path to second patch
   * @returns Promise with comparison result
   */
  static async comparePatches(patch1: string, patch2: string): Promise<any> {
    try {
      const analysis1 = await this.analyzePatch(patch1);
      const analysis2 = await this.analyzePatch(patch2);

      if (!analysis1.success || !analysis2.success) {
        return {
          success: false,
          error: 'Failed to analyze one or both patches',
        };
      }

      const sizeDiff = analysis1.patchFile.size - analysis2.patchFile.size;
      const sizeDiffFormatted = MetricsUtils.formatBytes(Math.abs(sizeDiff));

      return {
        success: true,
        comparison: {
          patch1: analysis1.patchFile,
          patch2: analysis2.patchFile,
          sizeDifference: sizeDiff,
          sizeDifferenceFormatted: sizeDiffFormatted,
          isPatch1Smaller: sizeDiff < 0,
          isPatch2Smaller: sizeDiff > 0,
          areEqual: sizeDiff === 0,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Gets information about a patch file
   * @param patchFile - Path to the patch file
   * @returns Promise with patch information
   */
  static async getPatchInfo(patchFile: string): Promise<any> {
    return this.analyzePatch(patchFile);
  }
}

export default PatchAnalyzer;
