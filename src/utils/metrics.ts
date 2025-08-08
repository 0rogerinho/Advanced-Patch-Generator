import { METRICS } from '../constants/index.js';

/**
 * Utility functions for metrics and formatting
 */
class MetricsUtils {
  /**
   * Formats bytes into human-readable format
   * @param bytes - Number of bytes
   * @returns Formatted string
   */
  static formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = METRICS.BYTES_CONVERSION;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Formats duration in milliseconds to human-readable format
   * @param ms - Duration in milliseconds
   * @returns Formatted string
   */
  static formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
    return `${(ms / 3600000).toFixed(1)}h`;
  }

  /**
   * Calculates compression ratio
   * @param originalSize - Original file size
   * @param patchSize - Patch file size
   * @returns Compression ratio percentage
   */
  static calculateCompressionRatio(
    originalSize: number,
    patchSize: number
  ): number {
    if (originalSize === 0) return 0;
    return Math.round(((originalSize - patchSize) / originalSize) * 100);
  }

  /**
   * Calculates processing speed
   * @param bytes - Number of bytes processed
   * @param duration - Duration in milliseconds
   * @returns Speed string
   */
  static calculateSpeed(bytes: number, duration: number): string {
    if (duration === 0) return '0 B/s';
    const bytesPerSecond = (bytes / duration) * 1000;
    return this.formatBytes(bytesPerSecond) + '/s';
  }

  /**
   * Calculates estimated time to completion
   * @param processed - Bytes processed
   * @param total - Total bytes
   * @param speed - Speed in bytes per second
   * @returns ETA string
   */
  static calculateETA(processed: number, total: number, speed: number): string {
    if (speed === 0 || processed >= total) return '0s';
    const remaining = total - processed;
    const etaSeconds = remaining / speed;
    return this.formatDuration(etaSeconds * 1000);
  }
}

export default MetricsUtils;
