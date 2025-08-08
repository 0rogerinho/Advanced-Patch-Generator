import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra';
import path from 'path';

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
            error: `Command failed with code ${code}`
          });
        }
      });

      child.on('error', (error) => {
        if (timeoutHandle) clearTimeout(timeoutHandle);
        reject({
          success: false,
          stdout,
          stderr,
          code: null,
          command,
          args,
          error: error.message
        });
      });
    });
  }

  /**
   * Busca o caminho do Xdelta3 no sistema
   * @returns {Promise<string|null>} Caminho do Xdelta3 ou null se não encontrado
   */
  static async findXdelta3Path() {
    const possiblePaths = [
      // Caminhos padrão do Windows
      'xdelta3.exe',
      'xdelta3',
      'C:\\ProgramData\\chocolatey\\bin\\xdelta3.exe',
      'C:\\ProgramData\\chocolatey\\bin\\xdelta3',
      'C:\\tools\\xdelta3\\xdelta3.exe',
      'C:\\tools\\xdelta3\\xdelta3',
      // Caminhos do Scoop
      `${process.env.USERPROFILE}\\scoop\\apps\\xdelta3\\current\\xdelta3.exe`,
      `${process.env.USERPROFILE}\\scoop\\apps\\xdelta3\\current\\xdelta3`,
      // Caminhos do Winget
      'C:\\Program Files\\WindowsApps\\xdelta3\\xdelta3.exe',
      // Caminhos do PATH
      'xdelta3.exe',
      'xdelta3'
    ];

    // Primeiro, tenta encontrar no PATH
    try {
      const whereResult = await this.executeCommand(
        process.platform === 'win32' ? 'where xdelta3' : 'which xdelta3'
      );
      
      if (whereResult.success && whereResult.stdout.trim()) {
        const paths = whereResult.stdout.trim().split('\n');
        for (const path of paths) {
          const trimmedPath = path.trim();
          if (trimmedPath && await this.testXdelta3Path(trimmedPath)) {
            return trimmedPath;
          }
        }
      }
    } catch (error) {
      // Continua para os outros métodos
    }

    // Testa caminhos específicos
    for (const testPath of possiblePaths) {
      if (await this.testXdelta3Path(testPath)) {
        return testPath;
      }
    }

    return null;
  }

  /**
   * Testa se um caminho do Xdelta3 é válido
   * @param {string} xdeltaPath - Caminho para testar
   * @returns {Promise<boolean>} True se o caminho é válido
   */
  static async testXdelta3Path(xdeltaPath) {
    try {
      // Verifica se o arquivo existe
      if (process.platform === 'win32' && xdeltaPath.includes('.exe')) {
        const exists = await fs.pathExists(xdeltaPath);
        if (!exists) return false;
      }

      // Testa executando o comando de ajuda
      const result = await this.spawnCommand(xdeltaPath, ['-h'], { timeoutMs: 5000 });
      return result.success;
    } catch (error) {
      return false;
    }
  }

  /**
   * Escapa caminhos com espaços para uso em comandos
   * @param {string} filePath - Caminho do arquivo
   * @returns {string} Caminho escapado
   */
  static escapePath(filePath) {
    if (!filePath) return '';
    
    // Remove aspas existentes
    let cleanPath = filePath.replace(/^["']|["']$/g, '');
    
    // Escapa aspas internas se necessário
    cleanPath = cleanPath.replace(/"/g, '\\"');
    
    // Adiciona aspas se contém espaços ou caracteres especiais
    if (cleanPath.includes(' ') || cleanPath.includes('&') || cleanPath.includes('|') || cleanPath.includes(';')) {
      return `"${cleanPath}"`;
    }
    
    return cleanPath;
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

    // Escapa caminhos para evitar problemas com espaços
    const escapedOldFile = this.escapePath(oldFile);
    const escapedNewFile = this.escapePath(newFile);
    const escapedPatchFile = this.escapePath(patchFile);
    
    // Caminhos adicionados com escape adequado
    args.push('-s', escapedOldFile, escapedNewFile, escapedPatchFile);
    
    const filteredArgs = args.filter(Boolean);

    return {
      command: xdeltaPath,
      args: filteredArgs,
      fullCommand: process.platform === 'win32'
        ? `"${xdeltaPath}" ${filteredArgs.join(' ')}`
        : `${xdeltaPath} ${filteredArgs.join(' ')}`
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
    
    // Escapa caminhos para evitar problemas com espaços
    const escapedOldFile = this.escapePath(oldFile);
    const escapedPatchFile = this.escapePath(patchFile);
    const escapedNewFile = this.escapePath(newFile);
    
    const args = [
      verifyFlag,
      '-d', // decode
      '-f', // force overwrite
      '-s', // source file
      escapedOldFile,
      escapedPatchFile,
      escapedNewFile
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
