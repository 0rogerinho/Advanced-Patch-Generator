import fs from 'fs-extra';
import path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import CommandUtils from '../utils/commandUtils.js';
import DisplayUtils from '../utils/displayUtils.js';
import MetricsUtils from '../utils/metrics.js';
import LargeFileUtils from '../utils/largeFileUtils.js';
import FileValidation from '../validations/fileValidation.js';
import { DEFAULT_OPTIONS, MESSAGES } from '../constants/index.js';

/**
 * Gerenciador de Patch Avançado
 * Simplifica o processo de criação e aplicação de patches usando Xdelta
 * @class AdvancedPatchGenerator
 */
class AdvancedPatchGenerator {
  /**
   * Cria uma nova instância do AdvancedPatchGenerator
   * @param {Object} options - Opções de configuração
   * @param {string} [options.xdeltaPath='xdelta3.exe'] - Caminho para o executável xdelta3
   * @param {number} [options.compression=9] - Nível de compressão (0-9)
   * @param {boolean} [options.verify=true] - Verificar integridade dos patches
   * @param {boolean} [options.showProgress=true] - Mostrar progresso das operações
   * @example
   * const patchGen = new AdvancedPatchGenerator({
   *   compression: 6,
   *   verify: true,
   *   showProgress: true
   * });
   */
  constructor(options = {}) {
    this.xdeltaPath = options.xdeltaPath || DEFAULT_OPTIONS.xdeltaPath;
    this.defaultOptions = {
      ...DEFAULT_OPTIONS,
      ...options,
    };
  }

  /**
   * Obtém informações detalhadas de um arquivo
   * @param {string} filePath - Caminho do arquivo
   * @returns {Promise<Object>} Informações do arquivo
   */
  async getFileInfo(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return {
        size: stats.size,
        sizeFormatted: MetricsUtils.formatBytes(stats.size),
        modified: stats.mtime,
        exists: true,
      };
    } catch (error) {
      return { exists: false, error: error.message };
    }
  }

  /**
   * Verifica se o Xdelta está instalado
   * @returns {Promise<boolean>} True se o Xdelta está disponível
   */
  async checkXdelta() {
    try {
      const result = await CommandUtils.spawnCommand(this.xdeltaPath, ['-h']);
      return result.success;
    } catch (error) {
      if (this.defaultOptions.showProgress) {
        DisplayUtils.displayXdeltaInstallInstructions();
      }
      throw new Error(MESSAGES.XDELTA_NOT_FOUND);
    }
  }

  /**
   * Cria um patch entre dois arquivos com métricas detalhadas
   * @param {string} oldFile - Caminho do arquivo antigo
   * @param {string} newFile - Caminho do arquivo novo
   * @param {string} patchFile - Caminho do arquivo de patch de saída
   * @param {Object} options - Opções adicionais
   * @returns {Promise<Object>} Resultado da criação do patch
   */
  async createPatch(oldFile, newFile, patchFile, options = {}) {
    const startTime = Date.now();

    try {
      // Validação dos arquivos de entrada
      const validation = await FileValidation.validatePatchInputs(oldFile, newFile);
      if (!validation.isValid) {
        throw new Error(`Validação falhou: ${validation.errors.join(', ')}`);
      }

      if (validation.warnings.length > 0 && this.defaultOptions.showProgress) {
        validation.warnings.forEach(warning => {
          console.log(`⚠️  Aviso: ${warning}`);
        });
      }

      await this.checkXdelta();

      // Obtém informações dos arquivos
      const oldFileInfo = await this.getFileInfo(oldFile);
      const newFileInfo = await this.getFileInfo(newFile);

      // Verifica se é um arquivo grande e aplica otimizações
      const newFileSize = newFileInfo.size;
      const isLargeFile = await LargeFileUtils.isLargeFile(newFile);
      const isHugeFile = await LargeFileUtils.isHugeFile(newFile);
      const isExtremeFile = await LargeFileUtils.isExtremeFile(newFile);

      if (isLargeFile && this.defaultOptions.showProgress) {
        LargeFileUtils.displayLargeFileWarning(newFileSize);
      }

      // Para arquivos extremamente grandes, usa processamento em chunks
      if (isExtremeFile && this.defaultOptions.enableChunkProcessing) {
        return await this.createPatchWithChunks(oldFile, newFile, patchFile, options);
      }

      if (this.defaultOptions.showProgress) {
        console.log('\n📊 Informações dos Arquivos:');
        DisplayUtils.displayFileInfo('Arquivo Original', oldFile, oldFileInfo);
        DisplayUtils.displayFileInfo('Arquivo Novo', newFile, newFileInfo);
        console.log(`📁 Patch de Saída: ${patchFile}`);
        console.log('\n🔄 Criando patch...');
      }

      // Aplica otimizações para arquivos grandes
      const optimizationSettings = LargeFileUtils.getOptimizationSettings(newFileSize);
      const opts = { 
        ...this.defaultOptions, 
        ...options,
        compression: optimizationSettings.compressionLevel,
        verify: !optimizationSettings.skipVerification
      };

      const commandConfig = CommandUtils.buildCreatePatchCommand(
        this.xdeltaPath, 
        oldFile, 
        newFile, 
        patchFile, 
        opts
      );

      const result = await CommandUtils.executeCommand(commandConfig.fullCommand);

      if (!result.success) {
        throw new Error(`Erro ao criar patch: ${result.stderr || result.error}`);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;
      const patchInfo = await this.getFileInfo(patchFile);

      const patchResult = {
        success: true,
        patchFile,
        duration,
        durationFormatted: MetricsUtils.formatTime(duration),
        oldFile: {
          path: oldFile,
          size: oldFileInfo.size,
          sizeFormatted: oldFileInfo.sizeFormatted,
        },
        newFile: {
          path: newFile,
          size: newFileInfo.size,
          sizeFormatted: newFileInfo.sizeFormatted,
        },
        patch: {
          path: patchFile,
          size: patchInfo.size,
          sizeFormatted: patchInfo.sizeFormatted,
        },
        compression: {
          ratio: MetricsUtils.calculateCompressionRatio(
            newFileInfo.size,
            patchInfo.size,
          ),
          level: opts.compression,
          originalSize: newFileInfo.size,
          compressedSize: patchInfo.size,
        },
        processing: {
          method: 'standard',
          optimizations: optimizationSettings
        }
      };

      if (this.defaultOptions.showProgress) {
        DisplayUtils.displayPatchResult(patchResult);
      }

      return patchResult;
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      const result = {
        success: false,
        error: error.message,
        duration,
        durationFormatted: MetricsUtils.formatTime(duration),
      };

      if (this.defaultOptions.showProgress) {
        DisplayUtils.displayError(result);
      }

      return result;
    }
  }

  /**
   * Cria um patch para arquivos extremamente grandes usando processamento em chunks
   * @param {string} oldFile - Caminho do arquivo antigo
   * @param {string} newFile - Caminho do arquivo novo
   * @param {string} patchFile - Caminho do arquivo de patch de saída
   * @param {Object} options - Opções adicionais
   * @returns {Promise<Object>} Resultado da criação do patch
   */
  async createPatchWithChunks(oldFile, newFile, patchFile, options = {}) {
    const startTime = Date.now();

    try {
      if (this.defaultOptions.showProgress) {
        console.log('\n🔧 Processando arquivo extremamente grande em chunks...');
        console.log('📊 Informações dos Arquivos:');
        const oldFileInfo = await this.getFileInfo(oldFile);
        const newFileInfo = await this.getFileInfo(newFile);
        DisplayUtils.displayFileInfo('Arquivo Original', oldFile, oldFileInfo);
        DisplayUtils.displayFileInfo('Arquivo Novo', newFile, newFileInfo);
        console.log(`📁 Patch de Saída: ${patchFile}`);
      }

      // Cria diretórios temporários para chunks
      const tempDir = path.join(path.dirname(patchFile), 'temp_chunks');
      await fs.ensureDir(tempDir);

      // Divide os arquivos em chunks
      const chunkSize = this.defaultOptions.maxChunkSize;
      const oldChunks = await LargeFileUtils.createFileChunks(oldFile, tempDir, chunkSize);
      const newChunks = await LargeFileUtils.createFileChunks(newFile, tempDir, chunkSize);

      if (this.defaultOptions.showProgress) {
        console.log(`📦 Criados ${oldChunks.length} chunks do arquivo original`);
        console.log(`📦 Criados ${newChunks.length} chunks do arquivo novo`);
      }

      // Processa cada chunk
      const patchChunks = [];
      const optimizationSettings = LargeFileUtils.getOptimizationSettings(await LargeFileUtils.getFileSize(newFile));
      
      for (let i = 0; i < Math.max(oldChunks.length, newChunks.length); i++) {
        const oldChunk = oldChunks[i];
        const newChunk = newChunks[i];
        
        if (!oldChunk || !newChunk) {
          // Se um dos arquivos não tem chunk correspondente, cria um patch vazio ou completo
          if (!oldChunk && newChunk) {
            // Novo chunk - copia diretamente
            const chunkPatchPath = path.join(tempDir, `patch_chunk_${i}.xdelta`);
            await fs.copy(newChunk.path, chunkPatchPath);
            patchChunks.push({
              index: i,
              path: chunkPatchPath,
              type: 'new_chunk'
            });
          } else if (oldChunk && !newChunk) {
            // Chunk removido - marca como removido
            patchChunks.push({
              index: i,
              path: null,
              type: 'removed_chunk'
            });
          }
          continue;
        }

        // Cria patch para o chunk
        const chunkPatchPath = path.join(tempDir, `patch_chunk_${i}.xdelta`);
        
        const opts = { 
          ...this.defaultOptions, 
          ...options,
          compression: optimizationSettings.compressionLevel,
          verify: false // Pula verificação para chunks
        };

        const commandConfig = CommandUtils.buildCreatePatchCommand(
          this.xdeltaPath, 
          oldChunk.path, 
          newChunk.path, 
          chunkPatchPath, 
          opts
        );

        const result = await CommandUtils.executeCommand(commandConfig.fullCommand);

        if (result.success) {
          patchChunks.push({
            index: i,
            path: chunkPatchPath,
            type: 'patch_chunk'
          });
        } else {
          throw new Error(`Erro ao criar patch para chunk ${i}: ${result.stderr || result.error}`);
        }
      }

      // Combina todos os patches de chunks em um único arquivo
      const combinedPatchPath = path.join(tempDir, 'combined_patch.xdelta');
      await this.combinePatchChunks(patchChunks, combinedPatchPath);

      // Move o patch combinado para o local final
      await fs.move(combinedPatchPath, patchFile, { overwrite: true });

      // Limpa arquivos temporários
      await fs.remove(tempDir);

      const endTime = Date.now();
      const duration = endTime - startTime;
      const patchInfo = await this.getFileInfo(patchFile);
      const newFileInfo = await this.getFileInfo(newFile);

      const patchResult = {
        success: true,
        patchFile,
        duration,
        durationFormatted: MetricsUtils.formatTime(duration),
        oldFile: {
          path: oldFile,
          size: (await this.getFileInfo(oldFile)).size,
          sizeFormatted: (await this.getFileInfo(oldFile)).sizeFormatted,
        },
        newFile: {
          path: newFile,
          size: newFileInfo.size,
          sizeFormatted: newFileInfo.sizeFormatted,
        },
        patch: {
          path: patchFile,
          size: patchInfo.size,
          sizeFormatted: patchInfo.sizeFormatted,
        },
        compression: {
          ratio: MetricsUtils.calculateCompressionRatio(
            newFileInfo.size,
            patchInfo.size,
          ),
          level: optimizationSettings.compressionLevel,
          originalSize: newFileInfo.size,
          compressedSize: patchInfo.size,
        },
        processing: {
          method: 'chunk_processing',
          chunksProcessed: patchChunks.length,
          chunkSize: chunkSize,
          optimizations: optimizationSettings
        }
      };

      if (this.defaultOptions.showProgress) {
        DisplayUtils.displayPatchResult(patchResult);
        console.log(`🔧 Processamento em chunks concluído!`);
      }

      return patchResult;
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      const result = {
        success: false,
        error: error.message,
        duration,
        durationFormatted: MetricsUtils.formatTime(duration),
      };

      if (this.defaultOptions.showProgress) {
        DisplayUtils.displayError(result);
      }

      return result;
    }
  }

  /**
   * Combina patches de chunks em um único arquivo
   * @param {Array} patchChunks - Array de informações dos chunks de patch
   * @param {string} outputPath - Caminho do arquivo de saída
   * @returns {Promise<void>}
   */
  async combinePatchChunks(patchChunks, outputPath) {
    try {
      const writeStream = createWriteStream(outputPath);
      
      for (const chunk of patchChunks) {
        if (chunk.path && chunk.type === 'patch_chunk') {
          const readStream = createReadStream(chunk.path);
          await pipeline(readStream, writeStream);
        } else if (chunk.type === 'new_chunk') {
          // Para chunks novos, adiciona um marcador especial
          const marker = Buffer.from(`NEW_CHUNK_${chunk.index}\n`);
          writeStream.write(marker);
          
          const readStream = createReadStream(chunk.path);
          await pipeline(readStream, writeStream);
        } else if (chunk.type === 'removed_chunk') {
          // Para chunks removidos, adiciona um marcador
          const marker = Buffer.from(`REMOVED_CHUNK_${chunk.index}\n`);
          writeStream.write(marker);
        }
      }
      
      writeStream.end();
    } catch (error) {
      throw new Error(`Erro ao combinar patches de chunks: ${error.message}`);
    }
  }

  /**
   * Aplica um patch a um arquivo com métricas detalhadas
   * @param {string} oldFile - Caminho do arquivo original
   * @param {string} patchFile - Caminho do arquivo de patch
   * @param {string} newFile - Caminho do arquivo de saída
   * @param {Object} options - Opções adicionais
   * @returns {Promise<Object>} Resultado da aplicação do patch
   */
  async applyPatch(oldFile, patchFile, newFile, options = {}) {
    const startTime = Date.now();

    try {
      // Validação dos arquivos de entrada
      const validation = await FileValidation.validateApplyInputs(oldFile, patchFile);
      if (!validation.isValid) {
        throw new Error(`Validação falhou: ${validation.errors.join(', ')}`);
      }

      if (validation.warnings.length > 0 && this.defaultOptions.showProgress) {
        validation.warnings.forEach(warning => {
          console.log(`⚠️  Aviso: ${warning}`);
        });
      }

      await this.checkXdelta();

      // Obtém informações dos arquivos
      const oldFileInfo = await this.getFileInfo(oldFile);
      const patchInfo = await this.getFileInfo(patchFile);

      if (this.defaultOptions.showProgress) {
        console.log('\n📊 Informações dos Arquivos:');
        DisplayUtils.displayFileInfo('Arquivo Original', oldFile, oldFileInfo);
        DisplayUtils.displayFileInfo('Patch', patchFile, patchInfo);
        console.log(`📁 Arquivo de Saída: ${newFile}`);
        console.log('\n🔄 Aplicando patch...');
      }

      const opts = { ...this.defaultOptions, ...options };
      const commandConfig = CommandUtils.buildApplyPatchCommand(
        this.xdeltaPath, 
        oldFile, 
        patchFile, 
        newFile, 
        opts
      );

      const result = await CommandUtils.executeCommand(commandConfig.fullCommand);

      if (!result.success) {
        throw new Error(`Erro ao aplicar patch: ${result.stderr || result.error}`);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;
      const newFileInfo = await this.getFileInfo(newFile);

      const applyResult = {
        success: true,
        newFile,
        duration,
        durationFormatted: MetricsUtils.formatTime(duration),
        oldFile: {
          path: oldFile,
          size: oldFileInfo.size,
          sizeFormatted: oldFileInfo.sizeFormatted,
        },
        patch: {
          path: patchFile,
          size: patchInfo.size,
          sizeFormatted: patchInfo.sizeFormatted,
        },
        appliedFile: {
          path: newFile,
          size: newFileInfo.size,
          sizeFormatted: newFileInfo.sizeFormatted,
        },
      };

      if (this.defaultOptions.showProgress) {
        DisplayUtils.displayApplyResult(applyResult);
      }

      return applyResult;
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      const result = {
        success: false,
        error: error.message,
        duration,
        durationFormatted: MetricsUtils.formatTime(duration),
      };

      if (this.defaultOptions.showProgress) {
        DisplayUtils.displayError('Erro ao Aplicar Patch', error.message);
      }

      throw new Error(`${MESSAGES.ERROR_APPLY_PATCH} ${error.message}`);
    }
  }

  /**
   * Cria patches em lote para múltiplos arquivos
   * @param {string} oldDir - Diretório com arquivos antigos
   * @param {string} newDir - Diretório com arquivos novos
   * @param {string} patchesDir - Diretório para salvar os patches
   * @param {Object} options - Opções adicionais
   * @returns {Promise<Array>} Lista de resultados dos patches
   */
  async createBatchPatches(oldDir, newDir, patchesDir, options = {}) {
    try {
      await fs.ensureDir(patchesDir);

      const oldFiles = await fs.readdir(oldDir);
      const newFiles = await fs.readdir(newDir);

      const patches = [];

      for (const file of newFiles) {
        const oldPath = path.join(oldDir, file);
        const newPath = path.join(newDir, file);
        const patchPath = path.join(patchesDir, `${file}.xdelta`);

        if (await FileValidation.fileExists(oldPath)) {
          try {
            await this.createPatch(oldPath, newPath, patchPath, options);
            patches.push({
              file,
              patchPath,
              status: 'success',
            });
          } catch (error) {
            patches.push({
              file,
              patchPath,
              status: 'error',
              error: error.message,
            });
          }
        } else {
          patches.push({
            file,
            patchPath,
            status: 'skipped',
            reason: 'Arquivo original não encontrado',
          });
        }
      }

      if (this.defaultOptions.showProgress) {
        DisplayUtils.displayBatchStats(patches);
      }

      return patches;
    } catch (error) {
      throw new Error(`Erro ao criar patches em lote: ${error.message}`);
    }
  }

  /**
   * Aplica patches em lote
   * @param {string} oldDir - Diretório com arquivos originais
   * @param {string} patchesDir - Diretório com os patches
   * @param {string} outputDir - Diretório de saída
   * @param {Object} options - Opções adicionais
   * @returns {Promise<Array>} Lista de resultados da aplicação
   */
  async applyBatchPatches(oldDir, patchesDir, outputDir, options = {}) {
    try {
      await fs.ensureDir(outputDir);

      const patchFiles = await fs.readdir(patchesDir);
      const results = [];

      for (const patchFile of patchFiles) {
        if (patchFile.endsWith('.xdelta')) {
          const originalFile = patchFile.replace('.xdelta', '');
          const oldPath = path.join(oldDir, originalFile);
          const patchPath = path.join(patchesDir, patchFile);
          const newPath = path.join(outputDir, originalFile);

          if (await FileValidation.fileExists(oldPath)) {
            try {
              await this.applyPatch(oldPath, patchPath, newPath, options);
              results.push({
                file: originalFile,
                status: 'success',
              });
            } catch (error) {
              results.push({
                file: originalFile,
                status: 'error',
                error: error.message,
              });
            }
          } else {
            results.push({
              file: originalFile,
              status: 'skipped',
              reason: 'Arquivo original não encontrado',
            });
          }
        }
      }

      if (this.defaultOptions.showProgress) {
        DisplayUtils.displayBatchStats(results);
      }

      return results;
    } catch (error) {
      throw new Error(`Erro ao aplicar patches em lote: ${error.message}`);
    }
  }

  /**
   * Verifica a integridade de um patch
   * @param {string} oldFile - Arquivo original
   * @param {string} patchFile - Arquivo de patch
   * @param {string} newFile - Arquivo novo para comparação
   * @returns {Promise<Object>} Resultado da verificação
   */
  async verifyPatch(oldFile, patchFile, newFile) {
    try {
      // Verifica se é um arquivo grande
      const newFileSize = await LargeFileUtils.getFileSize(newFile);
      const isLargeFile = newFileSize > DEFAULT_OPTIONS.largeFileThreshold;

      if (isLargeFile) {
        // Usa verificação otimizada para arquivos grandes
        return await LargeFileUtils.verifyPatchForLargeFile(
          oldFile, 
          patchFile, 
          newFile, 
          this.applyPatch.bind(this)
        );
      } else {
        // Usa verificação normal para arquivos pequenos
        const tempFile = `${newFile}.temp`;

        // Aplica o patch
        await this.applyPatch(oldFile, patchFile, tempFile);

        // Compara com o arquivo original
        const originalBuffer = await fs.readFile(newFile);
        const patchedBuffer = await fs.readFile(tempFile);

        // Remove arquivo temporário
        await fs.remove(tempFile);

        const isValid = originalBuffer.equals(patchedBuffer);

        return {
          isValid,
          originalSize: originalBuffer.length,
          patchedSize: patchedBuffer.length,
        };
      }
    } catch (error) {
      throw new Error(`${MESSAGES.ERROR_VERIFY_PATCH} ${error.message}`);
    }
  }
}

export default AdvancedPatchGenerator;
