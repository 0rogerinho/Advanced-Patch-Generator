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
        // Aumenta buffer padrão para evitar estouro em saídas maiores
        maxBuffer: 16 * 1024 * 1024, // 16MB
        timeout: options.timeoutMs || 0,
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

      let timeoutHandle = null;
      if (options.timeoutMs && Number.isFinite(options.timeoutMs) && options.timeoutMs > 0) {
        timeoutHandle = setTimeout(() => {
          try { child.kill('SIGKILL'); } catch (_) {}
          reject({
            success: false,
            stdout,
            stderr: `${stderr}\nProcesso finalizado por timeout após ${options.timeoutMs}ms`,
            code: null,
            command,
            args,
            error: `Process timeout after ${options.timeoutMs}ms`,
          });
        }, options.timeoutMs);
      }

      child.on('close', (code) => {
        if (timeoutHandle) clearTimeout(timeoutHandle);
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
        if (timeoutHandle) clearTimeout(timeoutHandle);
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
    const compressionFlag = options.compression !== undefined ? `-${options.compression}` : '';
    const verifyFlag = options.verify ? '-v' : '';
    
    // Parâmetros otimizados para máxima velocidade (perfil estável)
    const fileSize = options.fileSize || 0;
    const isLargeFile = fileSize > 100 * 1024 * 1024; // 100MB
    const isHugeFile = fileSize > 1024 * 1024 * 1024; // 1GB
    const isExtremeFile = fileSize > 2 * 1024 * 1024 * 1024; // 2GB
    
    const args = [
      compressionFlag,
      verifyFlag,
      '-e', // encode
      '-f', // force overwrite
    ];
    
    // Otimizações estáveis para velocidade
    if (isExtremeFile) {
      // Arquivos muito grandes: janela maior e compressão baixa
      args.push('-W', '16777216'); // 16MB (máximo)
      args.push('-P', '262144');   // 256KB
      // Para estabilidade, não desabilitamos checksums nem instruções
      // Compressão será controlada pelo nível (-0..-9)
    } else if (isHugeFile) {
      args.push('-W', '8388608');  // 8MB
      args.push('-P', '262144');   // 256KB
    } else if (isLargeFile) {
      args.push('-W', '4194304');  // 4MB
      args.push('-P', '131072');   // 128KB
    }

    // Caminhos adicionados sem quotes para uso com spawn; a string é quoteada em fullCommand
    args.push('-s', oldFile, newFile, patchFile);
    
    const filteredArgs = args.filter(Boolean);

    return {
      command: xdeltaPath,
      args: filteredArgs,
      fullCommand: process.platform === 'win32'
        ? `"${xdeltaPath}" ${filteredArgs.map(a => (String(a).includes(' ') ? `"${a}"` : a)).join(' ')}`
        : `${xdeltaPath} ${filteredArgs.map(a => (String(a).includes(' ') ? `"${a}"` : a)).join(' ')}`
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
        ? `"${xdeltaPath}" ${args.map(a => (String(a).includes(' ') ? `"${a}"` : a)).join(' ')}`
        : `${xdeltaPath} ${args.map(a => (String(a).includes(' ') ? `"${a}"` : a)).join(' ')}`
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
