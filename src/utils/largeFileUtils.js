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
      return 0; // Compressão zero para máxima velocidade (>1GB)
    } else if (fileSize > METRICS.HUGE_FILE_THRESHOLD) {
      return 0; // Compressão zero também para arquivos >500MB
    } else if (fileSize > METRICS.LARGE_FILE_THRESHOLD) {
      return 1; // Compressão mínima para arquivos grandes (>50MB)
    }
    return 3; // Compressão baixa para arquivos pequenos (era 6)
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
      
      // Usa um buffer menor para reduzir o uso de memória
      const readStream = createReadStream(filePath, {
        highWaterMark: Math.min(64 * 1024 * 1024, chunkSize) // 64MB ou menor
      });
      
      let chunkIndex = 0;
      let bytesRead = 0;
      let currentChunkPath = path.join(outputDir, `chunk_${chunkIndex}.bin`);
      let writeStream = createWriteStream(currentChunkPath);
      
      return new Promise((resolve, reject) => {
        readStream.on('data', async (chunk) => {
          try {
            bytesRead += chunk.length;
            
            // Escreve o chunk diretamente no arquivo
            if (!writeStream.write(chunk)) {
              // Se o buffer estiver cheio, aguarda o drain
              await new Promise(resolve => writeStream.once('drain', resolve));
            }
            
            if (bytesRead >= chunkSize) {
              // Fecha o stream atual e aguarda finalização
              await new Promise(resolve => {
                writeStream.end(() => {
                  chunks.push({
                    index: chunkIndex,
                    path: currentChunkPath,
                    size: bytesRead,
                    startByte: chunkIndex * chunkSize,
                    endByte: Math.min((chunkIndex + 1) * chunkSize, totalSize)
                  });
                  resolve();
                });
              });
              
              // Prepara o próximo chunk
              chunkIndex++;
              bytesRead = 0;
              currentChunkPath = path.join(outputDir, `chunk_${chunkIndex}.bin`);
              writeStream = createWriteStream(currentChunkPath);
            }
          } catch (error) {
            readStream.destroy();
            writeStream.destroy();
            reject(error);
          }
        });
        
        readStream.on('end', async () => {
          // Finaliza o último chunk se houver dados
          if (bytesRead > 0) {
            await new Promise(resolve => {
              writeStream.end(() => {
                chunks.push({
                  index: chunkIndex,
                  path: currentChunkPath,
                  size: bytesRead,
                  startByte: chunkIndex * chunkSize,
                  endByte: totalSize
                });
                resolve();
              });
            });
          }
          
          resolve(chunks);
        });
        
        readStream.on('error', (error) => {
          writeStream.destroy();
          reject(error);
        });
        
        writeStream.on('error', (error) => {
          readStream.destroy();
          reject(error);
        });
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
      // Primeiro verifica se os tamanhos são iguais
      const [stats1, stats2] = await Promise.all([
        fs.stat(file1),
        fs.stat(file2)
      ]);
      
      if (stats1.size !== stats2.size) {
        console.log(`Tamanhos diferentes: ${stats1.size} vs ${stats2.size}`);
        return false;
      }
      
      const chunkSize = 32 * 1024 * 1024; // 32MB chunks para melhor performance
      const stream1 = createReadStream(file1, { highWaterMark: chunkSize });
      const stream2 = createReadStream(file2, { highWaterMark: chunkSize });
      
      return new Promise((resolve, reject) => {
        let chunk1Buffer = null;
        let chunk2Buffer = null;
        let stream1Ended = false;
        let stream2Ended = false;
        let position = 0;
        
        const compareChunks = () => {
          if (chunk1Buffer && chunk2Buffer) {
            const minLength = Math.min(chunk1Buffer.length, chunk2Buffer.length);
            
            // Compara os bytes
            if (!chunk1Buffer.slice(0, minLength).equals(chunk2Buffer.slice(0, minLength))) {
              stream1.destroy();
              stream2.destroy();
              resolve(false);
              return;
            }
            
            position += minLength;
            
            // Remove os bytes comparados
            if (chunk1Buffer.length === minLength) {
              chunk1Buffer = null;
            } else {
              chunk1Buffer = chunk1Buffer.slice(minLength);
            }
            
            if (chunk2Buffer.length === minLength) {
              chunk2Buffer = null;
            } else {
              chunk2Buffer = chunk2Buffer.slice(minLength);
            }
            
            // Continua comparando se ainda há dados
            compareChunks();
          }
        };
        
        stream1.on('data', (chunk) => {
          chunk1Buffer = chunk1Buffer ? Buffer.concat([chunk1Buffer, chunk]) : chunk;
          compareChunks();
        });
        
        stream2.on('data', (chunk) => {
          chunk2Buffer = chunk2Buffer ? Buffer.concat([chunk2Buffer, chunk]) : chunk;
          compareChunks();
        });
        
        stream1.on('end', () => {
          stream1Ended = true;
          if (stream2Ended) {
            // Verifica se sobraram dados em algum buffer
            const hasRemainingData = (chunk1Buffer && chunk1Buffer.length > 0) || 
                                   (chunk2Buffer && chunk2Buffer.length > 0);
            resolve(!hasRemainingData);
          }
        });
        
        stream2.on('end', () => {
          stream2Ended = true;
          if (stream1Ended) {
            // Verifica se sobraram dados em algum buffer
            const hasRemainingData = (chunk1Buffer && chunk1Buffer.length > 0) || 
                                   (chunk2Buffer && chunk2Buffer.length > 0);
            resolve(!hasRemainingData);
          }
        });
        
        stream1.on('error', (error) => {
          console.error('Erro no stream1:', error);
          stream2.destroy();
          reject(error);
        });
        
        stream2.on('error', (error) => {
          console.error('Erro no stream2:', error);
          stream1.destroy();
          reject(error);
        });
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
