import fs from 'fs-extra';
import path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { DEFAULT_OPTIONS, METRICS, MESSAGES } from '../constants/index.js';

/**
 * Utilitários para processamento de arquivos grandes
 * @class LargeFileUtils
 */
class LargeFileUtils {
  /**
   * Verifica se um arquivo é considerado grande
   * @param {string} filePath - Caminho do arquivo
   * @returns {Promise<boolean>} True se o arquivo é grande
   */
  static async isLargeFile(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return stats.size > DEFAULT_OPTIONS.largeFileThreshold;
    } catch (error) {
      return false;
    }
  }

  /**
   * Verifica se um arquivo é muito grande (>1GB)
   * @param {string} filePath - Caminho do arquivo
   * @returns {Promise<boolean>} True se o arquivo é muito grande
   */
  static async isHugeFile(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return stats.size > METRICS.HUGE_FILE_THRESHOLD;
    } catch (error) {
      return false;
    }
  }

  /**
   * Verifica se um arquivo é extremamente grande (>5GB)
   * @param {string} filePath - Caminho do arquivo
   * @returns {Promise<boolean>} True se o arquivo é extremamente grande
   */
  static async isExtremeFile(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return stats.size > METRICS.EXTREME_FILE_THRESHOLD;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtém o tamanho do arquivo em bytes
   * @param {string} filePath - Caminho do arquivo
   * @returns {Promise<number>} Tamanho do arquivo em bytes
   */
  static async getFileSize(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return stats.size;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Calcula o nível de compressão otimizado baseado no tamanho do arquivo
   * @param {number} fileSize - Tamanho do arquivo em bytes
   * @returns {number} Nível de compressão otimizado
   */
  static getOptimizedCompressionLevel(fileSize) {
    if (fileSize > METRICS.EXTREME_FILE_THRESHOLD) {
      return 1; // Compressão mínima para arquivos extremamente grandes
    } else if (fileSize > METRICS.HUGE_FILE_THRESHOLD) {
      return 3; // Compressão baixa para arquivos muito grandes
    } else if (fileSize > METRICS.LARGE_FILE_THRESHOLD) {
      return 6; // Compressão média para arquivos grandes
    }
    return 9; // Compressão máxima para arquivos pequenos
  }

  /**
   * Verifica se deve pular a verificação baseado no tamanho do arquivo
   * @param {number} fileSize - Tamanho do arquivo em bytes
   * @returns {boolean} True se deve pular a verificação
   */
  static shouldSkipVerification(fileSize) {
    return fileSize > METRICS.LARGE_FILE_THRESHOLD;
  }

  /**
   * Verifica se deve usar processamento em chunks
   * @param {number} fileSize - Tamanho do arquivo em bytes
   * @returns {boolean} True se deve usar chunks
   */
  static shouldUseChunkProcessing(fileSize) {
    return fileSize > METRICS.EXTREME_FILE_THRESHOLD;
  }

  /**
   * Divide um arquivo grande em chunks para processamento
   * @param {string} filePath - Caminho do arquivo
   * @param {string} outputDir - Diretório de saída para os chunks
   * @param {number} chunkSize - Tamanho de cada chunk em bytes
   * @returns {Promise<Array>} Array com informações dos chunks criados
   */
  static async createFileChunks(filePath, outputDir, chunkSize = DEFAULT_OPTIONS.maxChunkSize) {
    try {
      const stats = await fs.stat(filePath);
      const totalSize = stats.size;
      const chunks = [];
      
      const readStream = createReadStream(filePath);
      let chunkIndex = 0;
      let bytesRead = 0;
      let currentChunk = [];
      
      return new Promise((resolve, reject) => {
        readStream.on('data', (chunk) => {
          currentChunk.push(chunk);
          bytesRead += chunk.length;
          
          if (bytesRead >= chunkSize) {
            const chunkPath = path.join(outputDir, `chunk_${chunkIndex}.bin`);
            const writeStream = createWriteStream(chunkPath);
            
            const buffer = Buffer.concat(currentChunk);
            writeStream.write(buffer);
            writeStream.end();
            
            chunks.push({
              index: chunkIndex,
              path: chunkPath,
              size: buffer.length,
              startByte: chunkIndex * chunkSize,
              endByte: Math.min((chunkIndex + 1) * chunkSize, totalSize)
            });
            
            chunkIndex++;
            bytesRead = 0;
            currentChunk = [];
          }
        });
        
        readStream.on('end', () => {
          // Processa o último chunk se houver dados restantes
          if (currentChunk.length > 0) {
            const chunkPath = path.join(outputDir, `chunk_${chunkIndex}.bin`);
            const writeStream = createWriteStream(chunkPath);
            
            const buffer = Buffer.concat(currentChunk);
            writeStream.write(buffer);
            writeStream.end();
            
            chunks.push({
              index: chunkIndex,
              path: chunkPath,
              size: buffer.length,
              startByte: chunkIndex * chunkSize,
              endByte: totalSize
            });
          }
          
          resolve(chunks);
        });
        
        readStream.on('error', reject);
      });
    } catch (error) {
      throw new Error(`Erro ao criar chunks: ${error.message}`);
    }
  }

  /**
   * Combina chunks em um arquivo único
   * @param {Array} chunks - Array de informações dos chunks
   * @param {string} outputPath - Caminho do arquivo de saída
   * @returns {Promise<void>}
   */
  static async combineChunks(chunks, outputPath) {
    try {
      const writeStream = createWriteStream(outputPath);
      
      for (const chunk of chunks) {
        const readStream = createReadStream(chunk.path);
        await pipeline(readStream, writeStream);
      }
      
      writeStream.end();
    } catch (error) {
      throw new Error(`Erro ao combinar chunks: ${error.message}`);
    }
  }

  /**
   * Compara dois arquivos grandes usando streams para economizar memória
   * @param {string} file1 - Primeiro arquivo
   * @param {string} file2 - Segundo arquivo
   * @returns {Promise<boolean>} True se os arquivos são idênticos
   */
  static async compareFilesStream(file1, file2) {
    try {
      const stream1 = createReadStream(file1);
      const stream2 = createReadStream(file2);
      
      let isEqual = true;
      let position = 0;
      
      return new Promise((resolve, reject) => {
        stream1.on('data', (chunk1) => {
          // Lê o chunk correspondente do segundo arquivo
          const chunk2 = stream2.read(chunk1.length);
          
          if (!chunk2 || !chunk1.equals(chunk2)) {
            isEqual = false;
            stream1.destroy();
            stream2.destroy();
            resolve(false);
          }
          
          position += chunk1.length;
        });
        
        stream1.on('end', () => {
          // Verifica se o segundo arquivo também terminou
          const remaining = stream2.read();
          if (remaining) {
            isEqual = false;
          }
          stream2.destroy();
          resolve(isEqual);
        });
        
        stream1.on('error', reject);
        stream2.on('error', reject);
      });
    } catch (error) {
      console.error('Erro ao comparar arquivos:', error);
      return false;
    }
  }

  /**
   * Verifica a integridade de um patch para arquivos grandes sem carregar tudo na memória
   * @param {string} oldFile - Arquivo original
   * @param {string} patchFile - Arquivo de patch
   * @param {string} newFile - Arquivo novo para comparação
   * @returns {Promise<Object>} Resultado da verificação
   */
  static async verifyPatchForLargeFile(oldFile, patchFile, newFile, applyPatchFunction) {
    try {
      const tempFile = `${newFile}.temp`;
      
      // Aplica o patch
      await applyPatchFunction(oldFile, patchFile, tempFile);
      
      // Compara usando streams para economizar memória
      const isValid = await this.compareFilesStream(newFile, tempFile);
      
      // Remove arquivo temporário
      await fs.remove(tempFile);
      
      return {
        isValid,
        method: 'stream_comparison',
        note: 'Verificação otimizada para arquivo grande'
      };
    } catch (error) {
      throw new Error(`Erro na verificação de arquivo grande: ${error.message}`);
    }
  }

  /**
   * Obtém informações de otimização para arquivos grandes
   * @param {number} fileSize - Tamanho do arquivo em bytes
   * @returns {Object} Configurações de otimização
   */
  static getOptimizationSettings(fileSize) {
    const isLarge = fileSize > METRICS.LARGE_FILE_THRESHOLD;
    const isHuge = fileSize > METRICS.HUGE_FILE_THRESHOLD;
    const isExtreme = fileSize > METRICS.EXTREME_FILE_THRESHOLD;
    
    return {
      compressionLevel: this.getOptimizedCompressionLevel(fileSize),
      skipVerification: this.shouldSkipVerification(fileSize),
      useStreaming: isLarge,
      memoryOptimized: isLarge,
      useChunkProcessing: this.shouldUseChunkProcessing(fileSize),
      warning: isExtreme ? MESSAGES.EXTREME_FILE_WARNING : 
               isHuge ? MESSAGES.FILE_TOO_LARGE : 
               isLarge ? MESSAGES.MEMORY_WARNING : null
    };
  }

  /**
   * Exibe avisos sobre arquivos grandes
   * @param {number} fileSize - Tamanho do arquivo em bytes
   */
  static displayLargeFileWarning(fileSize) {
    const settings = this.getOptimizationSettings(fileSize);
    
    if (settings.warning) {
      console.log(`⚠️  ${settings.warning}`);
    }
    
    if (settings.memoryOptimized) {
      console.log(`🔧 Otimizações aplicadas:`);
      console.log(`   - Compressão: nível ${settings.compressionLevel}`);
      console.log(`   - Verificação: ${settings.skipVerification ? 'pulada' : 'habilitada'}`);
      console.log(`   - Processamento: ${settings.useStreaming ? 'streaming' : 'normal'}`);
      
      if (settings.useChunkProcessing) {
        console.log(`   - Chunks: habilitado para arquivo extremamente grande`);
      }
    }
  }
}

export default LargeFileUtils;
