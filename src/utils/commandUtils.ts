import { spawn } from 'child_process';
import type { CommandResult } from '../types/index.js';

/**
 * Utility functions for command execution
 */
class CommandUtils {
  /**
   * Executes a command and returns the result
   * @param command - Command to execute
   * @returns Promise with command result
   */
  static async executeCommand(command: string): Promise<CommandResult> {
    return new Promise(resolve => {
      const startTime = Date.now();
      const parts = command.split(' ');
      const cmd = parts[0]!;
      const args = parts.slice(1);

      const child = spawn(cmd, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true,
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data: Buffer) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      child.on('close', (code: number | null) => {
        const duration = Date.now() - startTime;
        const success = code === 0;

        resolve({
          success,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          duration,
          error: success
            ? undefined
            : new Error(`Command failed with code ${code}`),
        } as CommandResult);
      });

      child.on('error', (error: Error) => {
        const duration = Date.now() - startTime;
        resolve({
          success: false,
          stdout: '',
          stderr: error.message,
          duration,
          error,
        } as CommandResult);
      });
    });
  }

  /**
   * Checks if a command is available on the system
   * @param command - Command to check
   * @returns Promise with availability status
   */
  static async isCommandAvailable(command: string): Promise<boolean> {
    try {
      const result = await this.executeCommand(`${command} --version`);
      return result.success;
    } catch {
      return false;
    }
  }
}

export default CommandUtils;
