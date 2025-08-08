import fs from 'fs-extra';
import CommandUtils from '../utils/commandUtils.js';

/**
 * File validation utilities
 */
class FileValidation {
  /**
   * Validates if a file exists
   * @param filePath - Path to the file
   * @returns Promise with validation result
   */
  static async validateFileExists(filePath: string): Promise<boolean> {
    try {
      const stats = await fs.stat(filePath);
      return stats.isFile();
    } catch {
      return false;
    }
  }

  /**
   * Validates if a file is readable
   * @param filePath - Path to the file
   * @returns Promise with validation result
   */
  static async validateFileReadable(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath, fs.constants.R_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validates if a file is writable
   * @param filePath - Path to the file
   * @returns Promise with validation result
   */
  static async validateFileWritable(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath, fs.constants.W_OK);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validates if a directory exists
   * @param dirPath - Path to the directory
   * @returns Promise with validation result
   */
  static async validateDirectoryExists(dirPath: string): Promise<boolean> {
    try {
      const stats = await fs.stat(dirPath);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * Validates if Xdelta is available
   * @returns Promise with validation result
   */
  static async validateXdeltaAvailable(): Promise<boolean> {
    return CommandUtils.isCommandAvailable('xdelta3');
  }
}

export default FileValidation;
