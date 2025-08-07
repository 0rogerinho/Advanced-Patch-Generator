import { exec, spawn } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Utilitários para comandos e execução de processos
 * @class CommandUtils
 */
class CommandUtils {
  /**
   * Executa um comando de forma assíncrona
   * @param {string} command - Comando a ser executado
   * @param {Object} options - Opções de execução
   * @returns {Promise<Object>} Resultado da execução
   */
  static async executeCommand(command, options = {}) {
    try {
      const { stdout, stderr } = await execAsync(command, {
        ...options,
        shell: process.platform === 'win32',
      });
      
      return {
        success: true,
        stdout,
        stderr,
        command
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        stdout: error.stdout || '',
        stderr: error.stderr || '',
        command
      };
    }
  }

  /**
   * Executa um comando usando spawn para melhor controle
   * @param {string} command - Comando a ser executado
   * @param {Array<string>} args - Argumentos do comando
   * @param {Object} options - Opções de spawn
   * @returns {Promise<Object>} Resultado da execução
   */
  static async spawnCommand(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      const child = spawn(command, args, {
        stdio: 'pipe',
        shell: process.platform === 'win32',
        ...options,
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        // Para comandos de ajuda (-h), o Xdelta3 retorna código 1, mas isso é normal
        const isHelpCommand = args.includes('-h') || args.includes('--help');
        const isSuccess = code === 0 || (isHelpCommand && code === 1);
        
        if (isSuccess) {
          resolve({
            success: true,
            stdout,
            stderr,
            code,
            command,
            args
          });
        } else {
          reject({
            success: false,
            stdout,
            stderr,
            code,
            command,
            args,
            error: `Process exited with code ${code}`
          });
        }
      });

      child.on('error', (error) => {
        reject({
          success: false,
          error: error.message,
          command,
          args
        });
      });
    });
  }

  /**
   * Constrói um comando Xdelta para criar patch
   * @param {string} xdeltaPath - Caminho para o executável xdelta
   * @param {string} oldFile - Arquivo original
   * @param {string} newFile - Arquivo novo
   * @param {string} patchFile - Arquivo de patch de saída
   * @param {Object} options - Opções do comando
   * @returns {string} Comando formatado
   */
  static buildCreatePatchCommand(xdeltaPath, oldFile, newFile, patchFile, options = {}) {
    const compressionFlag = options.compression ? `-${options.compression}` : '';
    const verifyFlag = options.verify ? '-v' : '';
    
    const args = [
      compressionFlag,
      verifyFlag,
      '-e', // encode
      '-f', // force overwrite
      '-s', // source file
      oldFile,
      newFile,
      patchFile
    ].filter(Boolean);

    return {
      command: xdeltaPath,
      args,
      fullCommand: process.platform === 'win32'
        ? `"${xdeltaPath}" ${args.join(' ')}`
        : `${xdeltaPath} ${args.join(' ')}`
    };
  }

  /**
   * Constrói um comando Xdelta para aplicar patch
   * @param {string} xdeltaPath - Caminho para o executável xdelta
   * @param {string} oldFile - Arquivo original
   * @param {string} patchFile - Arquivo de patch
   * @param {string} newFile - Arquivo de saída
   * @param {Object} options - Opções do comando
   * @returns {string} Comando formatado
   */
  static buildApplyPatchCommand(xdeltaPath, oldFile, patchFile, newFile, options = {}) {
    const verifyFlag = options.verify ? '-v' : '';
    
    const args = [
      verifyFlag,
      '-d', // decode
      '-f', // force overwrite
      '-s', // source file
      oldFile,
      patchFile,
      newFile
    ].filter(Boolean);

    return {
      command: xdeltaPath,
      args,
      fullCommand: process.platform === 'win32'
        ? `"${xdeltaPath}" ${args.join(' ')}`
        : `${xdeltaPath} ${args.join(' ')}`
    };
  }

  /**
   * Verifica se um comando está disponível no sistema
   * @param {string} command - Comando a ser verificado
   * @returns {Promise<boolean>} True se o comando está disponível
   */
  static async isCommandAvailable(command) {
    try {
      const result = await this.executeCommand(
        process.platform === 'win32' 
          ? `where ${command}` 
          : `which ${command}`
      );
      return result.success;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtém a versão de um comando
   * @param {string} command - Comando
   * @param {string} versionFlag - Flag para obter versão (padrão: '--version')
   * @returns {Promise<string>} Versão do comando
   */
  static async getCommandVersion(command, versionFlag = '--version') {
    try {
      const result = await this.executeCommand(`${command} ${versionFlag}`);
      if (result.success) {
        return result.stdout.trim();
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}

export default CommandUtils;
