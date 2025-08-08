import { PROGRESS_BAR } from '../constants/index.js';
import type { FileInfo, PatchResult, BatchResult } from '../types/index.js';

/**
 * Utility functions for display and formatting
 */
class DisplayUtils {
  /**
   * Creates a progress bar function
   * @param total - Total items to process
   * @returns Function to update progress
   */
  static createProgressBar(total: number): (current: number) => void {
    return (current: number) => {
      const percentage = Math.round((current / total) * 100);
      const filled = Math.floor(
        (percentage / 100) * PROGRESS_BAR.DEFAULT_WIDTH
      );
      const empty = PROGRESS_BAR.DEFAULT_WIDTH - filled;

      const bar =
        PROGRESS_BAR.FILLED_CHAR.repeat(filled) +
        PROGRESS_BAR.EMPTY_CHAR.repeat(empty);

      process.stdout.write(`\r[${bar}] ${percentage}%`);
    };
  }

  /**
   * Formats file information for display
   * @param fileInfo - File information
   * @returns Formatted string
   */
  static formatFileInfo(fileInfo: FileInfo): string {
    if (!fileInfo.exists) {
      return `❌ File not found: ${fileInfo.path}`;
    }

    return `📁 ${fileInfo.path} (${fileInfo.sizeFormatted})`;
  }

  /**
   * Formats patch result for display
   * @param result - Patch result
   * @returns Formatted string
   */
  static formatPatchResult(result: PatchResult): string {
    if (!result.success) {
      return `❌ Failed: ${result.error}`;
    }

    return `✅ Success: ${result.patchFile.sizeFormatted} (${result.metrics.compressionRatio}% compression)`;
  }

  /**
   * Formats batch results for display
   * @param results - Batch results
   * @returns Formatted string
   */
  static formatBatchResult(results: BatchResult[]): string {
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    const skippedCount = results.filter(r => r.status === 'skipped').length;

    return `📊 Batch completed: ${successCount} success, ${errorCount} errors, ${skippedCount} skipped`;
  }
}

export default DisplayUtils;
