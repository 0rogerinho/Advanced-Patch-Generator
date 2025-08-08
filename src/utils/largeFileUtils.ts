import fs from 'fs-extra';
import type { ChunkInfo } from '../types/index.js';

/**
 * Utility functions for large file processing
 */
class LargeFileUtils {
  /**
   * Creates chunks for large file processing
   * @param filePath - Path to the file
   * @param chunkSize - Size of each chunk
   * @param overlap - Overlap between chunks
   * @returns Array of chunk information
   */
  static async createChunks(
    filePath: string,
    chunkSize: number,
    overlap: number = 0
  ): Promise<ChunkInfo[]> {
    const stats = await fs.stat(filePath);
    const fileSize = stats.size;
    const chunks: ChunkInfo[] = [];

    let start = 0;
    let index = 0;

    while (start < fileSize) {
      const end = Math.min(start + chunkSize, fileSize);
      const size = end - start;

      chunks.push({
        start,
        end,
        size,
        index,
      });

      start = end - overlap;
      index++;
    }

    return chunks;
  }

  /**
   * Checks if a file is considered large
   * @param filePath - Path to the file
   * @param threshold - Size threshold
   * @returns True if file is large
   */
  static async isLargeFile(
    filePath: string,
    threshold: number
  ): Promise<boolean> {
    try {
      const stats = await fs.stat(filePath);
      return stats.size > threshold;
    } catch {
      return false;
    }
  }

  /**
   * Gets optimal chunk size based on file size
   * @param fileSize - Size of the file
   * @returns Optimal chunk size
   */
  static getOptimalChunkSize(fileSize: number): number {
    if (fileSize < 100 * 1024 * 1024) return 10 * 1024 * 1024; // 10MB
    if (fileSize < 1024 * 1024 * 1024) return 50 * 1024 * 1024; // 50MB
    return 100 * 1024 * 1024; // 100MB
  }
}

export default LargeFileUtils;
