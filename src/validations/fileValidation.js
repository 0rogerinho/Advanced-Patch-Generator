import fs from 'fs-extra';
import path from 'path';
import { COMPRESSION_LEVELS } from '../constants/index.js';

/**
 * Validações para arquivos e caminhos
 * @class FileValidation
 */
class FileValidation {
  /**
   * Verifica se um arquivo existe
   * @param {string} filePath - Caminho do arquivo
   * @returns {Promise<boolean>} True se o arquivo existe
   */
  static async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Verifica se um diretório existe
   * @param {string} dirPath - Caminho do diretório
   * @returns {Promise<boolean>} True se o diretório existe
   */
  static async directoryExists(dirPath) {
    try {
      const stats = await fs.stat(dirPath);
      return stats.isDirectory();
    } catch (error) {
      return false;
    }
  }

  /**
   * Valida se um arquivo é acessível para leitura
   * @param {string} filePath - Caminho do arquivo
   * @returns {Promise<boolean>} True se o arquivo é legível
   */
  static async isReadable(filePath) {
    try {
      await fs.access(filePath, fs.constants.R_OK);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Valida se um arquivo é acessível para escrita
   * @param {string} filePath - Caminho do arquivo
   * @returns {Promise<boolean>} True se o arquivo é gravável
   */
  static async isWritable(filePath) {
    try {
      // Tenta criar o diretório se não existir
      const dir = path.dirname(filePath);
      await fs.ensureDir(dir);
      
      // Verifica se pode escrever no diretório
      await fs.access(dir, fs.constants.W_OK);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Valida o nível de compressão
   * @param {number} level - Nível de compressão
   * @returns {boolean} True se o nível é válido
   */
  static isValidCompressionLevel(level) {
    return typeof level === 'number' && 
           level >= COMPRESSION_LEVELS.MIN && 
           level <= COMPRESSION_LEVELS.MAX;
  }

  /**
   * Valida se o caminho do Xdelta é válido
   * @param {string} xdeltaPath - Caminho para o executável xdelta
   * @returns {boolean} True se o caminho é válido
   */
  static isValidXdeltaPath(xdeltaPath) {
    if (!xdeltaPath || typeof xdeltaPath !== 'string') {
      return false;
    }
    
    // Verifica se tem extensão .exe no Windows
    if (process.platform === 'win32' && !xdeltaPath.toLowerCase().endsWith('.exe')) {
      return false;
    }
    
    return true;
  }

  /**
   * Valida se os arquivos de entrada são válidos para criar patch
   * @param {string} oldFile - Caminho do arquivo antigo
   * @param {string} newFile - Caminho do arquivo novo
   * @returns {Promise<Object>} Resultado da validação
   */
  static async validatePatchInputs(oldFile, newFile) {
    const result = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Verifica se os arquivos existem
    if (!(await this.fileExists(oldFile))) {
      result.isValid = false;
      result.errors.push(`Arquivo original não encontrado: ${oldFile}`);
    }

    if (!(await this.fileExists(newFile))) {
      result.isValid = false;
      result.errors.push(`Arquivo novo não encontrado: ${newFile}`);
    }

    // Verifica se os arquivos são legíveis
    if (await this.fileExists(oldFile) && !(await this.isReadable(oldFile))) {
      result.isValid = false;
      result.errors.push(`Arquivo original não é legível: ${oldFile}`);
    }

    if (await this.fileExists(newFile) && !(await this.isReadable(newFile))) {
      result.isValid = false;
      result.errors.push(`Arquivo novo não é legível: ${newFile}`);
    }

    // Verifica se os arquivos são diferentes
    if (await this.fileExists(oldFile) && await this.fileExists(newFile)) {
      try {
        const oldStats = await fs.stat(oldFile);
        const newStats = await fs.stat(newFile);
        
        if (oldStats.ino === newStats.ino && oldStats.dev === newStats.dev) {
          result.warnings.push('Os arquivos parecem ser o mesmo arquivo');
        }
      } catch (error) {
        result.warnings.push('Não foi possível comparar os arquivos');
      }
    }

    return result;
  }

  /**
   * Valida se os arquivos de entrada são válidos para aplicar patch
   * @param {string} oldFile - Caminho do arquivo original
   * @param {string} patchFile - Caminho do arquivo de patch
   * @returns {Promise<Object>} Resultado da validação
   */
  static async validateApplyInputs(oldFile, patchFile) {
    const result = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Verifica se os arquivos existem
    if (!(await this.fileExists(oldFile))) {
      result.isValid = false;
      result.errors.push(`Arquivo original não encontrado: ${oldFile}`);
    }

    if (!(await this.fileExists(patchFile))) {
      result.isValid = false;
      result.errors.push(`Arquivo de patch não encontrado: ${patchFile}`);
    }

    // Verifica se os arquivos são legíveis
    if (await this.fileExists(oldFile) && !(await this.isReadable(oldFile))) {
      result.isValid = false;
      result.errors.push(`Arquivo original não é legível: ${oldFile}`);
    }

    if (await this.fileExists(patchFile) && !(await this.isReadable(patchFile))) {
      result.isValid = false;
      result.errors.push(`Arquivo de patch não é legível: ${patchFile}`);
    }

    // Verifica se o arquivo de patch tem a extensão correta
    if (await this.fileExists(patchFile) && !patchFile.toLowerCase().endsWith('.xdelta')) {
      result.warnings.push('O arquivo de patch não tem a extensão .xdelta');
    }

    return result;
  }
}

export default FileValidation;
