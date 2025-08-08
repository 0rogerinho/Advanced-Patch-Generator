import fs from 'fs-extra';
import path from 'path';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { EventEmitter } from 'events';
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
 * @extends EventEmitter
 */
class AdvancedPatchGenerator extends EventEmitter {
  /**
   * Cria uma nova instância do AdvancedPatchGenerator
   * @param {Object} options - Opções de configuração
   * @param {string} [options.xdeltaPath='xdelta3.exe'] - Caminho para o executável xdelta3
   * @param {number} [options.compression=9] - Nível de compressão (0-9)
   * @param {boolean} [options.verify=true] - Verificar integridade dos patches
   * @param {boolean} [options.showProgress=true] - Mostrar progresso das operações
   * @param {Function} [options.onProgress] - Callback para progresso
   * @param {Function} [options.onError] - Callback para erros
   * @param {Function} [options.onComplete] - Callback para conclusão
   * @example
   * const patchGen = new AdvancedPatchGenerator({
   *   compression: 6,
   *   verify: true,
   *   showProgress: true,
   *   onProgress: (progress) => console.log(`Progresso: ${progress}%`),
   *   onError: (error) => console.error('Erro:', error),
   *   onComplete: (result) => console.log('Concluído:', result)
   * });
   */
  constructor(options = {}) {
    super();
    this.xdeltaPath = options.xdeltaPath || DEFAULT_OPTIONS.xdeltaPath;
    this.defaultOptions = {
      ...DEFAULT_OPTIONS,
      ...options,
    };
    this._xdeltaChecked = false;
    this._xdeltaAvailable = false;
    
    // Callbacks opcionais
    this.onProgressCallback = options.onProgress;
    this.onErrorCallback = options.onError;
    this.onCompleteCallback = options.onComplete;
  }

  /**
   * Emite evento de progresso
   * @param {Object} data - Dados do progresso
   * @private
   */
  _emitProgress(data) {
    this.emit('progress', data);
    if (this.onProgressCallback) {
      this.onProgressCallback(data);
    }
  }

  /**
   * Emite evento de erro
   * @param {Error} error - Erro ocorrido
   * @private
   */
  _emitError(error) {
    this.emit('error', error);
    if (this.onErrorCallback) {
      this.onErrorCallback(error);
    }
  }

  /**
   * Emite evento de conclusão
   * @param {Object} result - Resultado da operação
   * @private
   */
  _emitComplete(result) {
    this.emit('complete', result);
    if (this.onCompleteCallback) {
      this.onCompleteCallback(result);
    }
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
    if (this._xdeltaChecked && this._xdeltaAvailable) {
      return true;
    }
    
    this._emitProgress({
      type: 'checking',
      message: 'Verificando Xdelta3...',
      percentage: 0
    });

    try {
      const result = await CommandUtils.spawnCommand(this.xdeltaPath, ['-h'], { timeoutMs: 15_000 });
      this._xdeltaChecked = true;
      this._xdeltaAvailable = !!result?.success;
      
      this._emitProgress({
        type: 'checking',
        message: this._xdeltaAvailable ? 'Xdelta3 encontrado!' : 'Xdelta3 não encontrado',
        percentage: 100,
        success: this._xdeltaAvailable
      });

      if (!this._xdeltaAvailable) {
        const error = new Error(MESSAGES.XDELTA_NOT_FOUND);
        this._emitError(error);
        if (this.defaultOptions.showProgress) {
          DisplayUtils.displayXdeltaInstallInstructions();
        }
        throw error;
      }

      return this._xdeltaAvailable;
    } catch (error) {
      this._xdeltaChecked = true;
      this._xdeltaAvailable = false;
      
      this._emitProgress({
        type: 'checking',
        message: 'Erro ao verificar Xdelta3',
        percentage: 100,
        success: false,
        error: error.message
      });

      this._emitError(error);
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
    const mergedOptions = { ...this.defaultOptions, ...options };

    this._emitProgress({
      type: 'create',
      message: 'Iniciando criação do patch...',
      percentage: 0
    });

    try {
      // Validação dos arquivos de entrada
      this._emitProgress({
        type: 'create',
        message: 'Validando arquivos de entrada...',
        percentage: 10
      });

      const validation = await FileValidation.validatePatchInputs(oldFile, newFile);
      if (!validation.isValid) {
        const error = new Error(`Validação falhou: ${validation.errors.join(', ')}`);
        this._emitError(error);
        throw error;
      }

      // Verifica se o Xdelta está disponível
      this._emitProgress({
        type: 'create',
        message: 'Verificando Xdelta3...',
        percentage: 20
      });

      await this.checkXdelta();

      // Obtém informações dos arquivos
      this._emitProgress({
        type: 'create',
        message: 'Analisando arquivos...',
        percentage: 30
      });

      const [oldFileInfo, newFileInfo] = await Promise.all([
        this.getFileInfo(oldFile),
        this.getFileInfo(newFile)
      ]);

      if (!oldFileInfo.exists || !newFileInfo.exists) {
        const error = new Error('Arquivo não encontrado');
        this._emitError(error);
        throw error;
      }

      // Determina se é um arquivo grande
      const isLargeFile = oldFileInfo.size > mergedOptions.largeFileThreshold || 
                         newFileInfo.size > mergedOptions.largeFileThreshold;

      this._emitProgress({
        type: 'create',
        message: isLargeFile ? 'Processando arquivo grande...' : 'Criando patch...',
        percentage: 40,
        isLargeFile
      });

      let result;
      if (isLargeFile) {
        result = await this.createPatchWithChunks(oldFile, newFile, patchFile, mergedOptions);
      } else {
        result = await this._createStandardPatch(oldFile, newFile, patchFile, mergedOptions);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      const finalResult = {
        success: true,
        oldFile: {
          path: oldFile,
          size: oldFileInfo.size,
          sizeFormatted: oldFileInfo.sizeFormatted
        },
        newFile: {
          path: newFile,
          size: newFileInfo.size,
          sizeFormatted: newFileInfo.sizeFormatted
        },
        patchFile: {
          path: patchFile,
          size: result.patchSize,
          sizeFormatted: MetricsUtils.formatBytes(result.patchSize)
        },
        metrics: {
          duration,
          durationFormatted: MetricsUtils.formatDuration(duration),
          compressionRatio: result.compressionRatio,
          isLargeFile
        }
      };

      this._emitProgress({
        type: 'create',
        message: 'Patch criado com sucesso!',
        percentage: 100,
        success: true
      });

      this._emitComplete(finalResult);
      return finalResult;

    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      this._emitProgress({
        type: 'create',
        message: `Erro: ${error.message}`,
        percentage: 100,
        success: false,
        error: error.message
      });

      this._emitError(error);

      return {
        success: false,
        error: error.message,
        duration,
        durationFormatted: MetricsUtils.formatDuration(duration)
      };
    }
  }

  /**
   * Cria um patch padrão (não chunked)
   * @param {string} oldFile - Arquivo antigo
   * @param {string} newFile - Arquivo novo
   * @param {string} patchFile - Arquivo de patch
   * @param {Object} options - Opções
   * @returns {Promise<Object>} Resultado
   * @private
   */
  async _createStandardPatch(oldFile, newFile, patchFile, options) {
    this._emitProgress({
      type: 'create',
      message: 'Executando Xdelta3...',
      percentage: 50
    });

    const args = [
      '-e',
      '-f',
      '-s', oldFile,
      newFile,
      patchFile
    ];

    if (options.compression !== undefined) {
      args.splice(1, 0, `-${options.compression}`);
    }

    const result = await CommandUtils.spawnCommand(this.xdeltaPath, args, {
      timeoutMs: options.timeout || 300000
    });

    if (!result.success) {
      throw new Error(`Falha ao criar patch: ${result.error}`);
    }

    this._emitProgress({
      type: 'create',
      message: 'Calculando métricas...',
      percentage: 80
    });

    // Obtém informações do patch criado
    const patchInfo = await this.getFileInfo(patchFile);
    const oldFileInfo = await this.getFileInfo(oldFile);
    const newFileInfo = await this.getFileInfo(newFile);

    const compressionRatio = oldFileInfo.size > 0 ? 
      ((newFileInfo.size - patchInfo.size) / oldFileInfo.size * 100) : 0;

    return {
      patchSize: patchInfo.size,
      compressionRatio: Math.round(compressionRatio * 100) / 100
    };
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

      // Processa chunks em paralelo
      const patchChunks = [];
      const optimizationSettings = LargeFileUtils.getOptimizationSettings(await LargeFileUtils.getFileSize(newFile));
      
      // Define o número máximo de chunks processados em paralelo
      const maxParallelChunks = 4; // Ajuste baseado na CPU e memória disponível
      
      // Processa chunks em lotes paralelos
      for (let i = 0; i < Math.max(oldChunks.length, newChunks.length); i += maxParallelChunks) {
        const chunkPromises = [];
        
        // Cria promessas para o lote atual de chunks
        for (let j = 0; j < maxParallelChunks && (i + j) < Math.max(oldChunks.length, newChunks.length); j++) {
          const chunkIndex = i + j;
          const oldChunk = oldChunks[chunkIndex];
          const newChunk = newChunks[chunkIndex];
          
          if (!oldChunk || !newChunk) {
            // Se um dos arquivos não tem chunk correspondente
            if (!oldChunk && newChunk) {
              // Novo chunk - copia diretamente
              const chunkPatchPath = path.join(tempDir, `patch_chunk_${chunkIndex}.xdelta`);
              chunkPromises.push(
                fs.copy(newChunk.path, chunkPatchPath)
                  .then(() => ({
                    index: chunkIndex,
                    path: chunkPatchPath,
                    type: 'new_chunk'
                  }))
              );
            } else if (oldChunk && !newChunk) {
              // Chunk removido - marca como removido
              chunkPromises.push(
                Promise.resolve({
                  index: chunkIndex,
                  path: null,
                  type: 'removed_chunk'
                })
              );
            }
            continue;
          }

          // Cria patch para o chunk
          const chunkPatchPath = path.join(tempDir, `patch_chunk_${chunkIndex}.xdelta`);
          
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

          chunkPromises.push(
            CommandUtils.spawnCommand(
              commandConfig.command,
              commandConfig.args,
              { timeoutMs: this.defaultOptions.timeout }
            ).then(result => {
              if (result.success) {
                return {
                  index: chunkIndex,
                  path: chunkPatchPath,
                  type: 'patch_chunk'
                };
              } else {
                throw new Error(`Erro ao criar patch para chunk ${chunkIndex}: ${result.stderr || result.error}`);
              }
            })
          );
        }

        // Aguarda todos os chunks do lote atual terminarem
        const results = await Promise.all(chunkPromises);
        patchChunks.push(...results);
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

      if (this.defaultOptions.showProgress) {
        DisplayUtils.displayError(MESSAGES.ERROR_CREATE_PATCH, error.message);
      }

      return {
        success: false,
        error: error.message,
        duration,
        durationFormatted: MetricsUtils.formatTime(duration),
      };
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
    const mergedOptions = { ...this.defaultOptions, ...options };

    this._emitProgress({
      type: 'apply',
      message: 'Iniciando aplicação do patch...',
      percentage: 0
    });

    try {
      // Validação dos arquivos de entrada
      this._emitProgress({
        type: 'apply',
        message: 'Validando arquivos de entrada...',
        percentage: 10
      });

      const validation = await FileValidation.validateApplyInputs(oldFile, patchFile);
      if (!validation.isValid) {
        const error = new Error(`Validação falhou: ${validation.errors.join(', ')}`);
        this._emitError(error);
        throw error;
      }

      // Verifica se o Xdelta está disponível
      this._emitProgress({
        type: 'apply',
        message: 'Verificando Xdelta3...',
        percentage: 20
      });

      await this.checkXdelta();

      // Obtém informações dos arquivos
      this._emitProgress({
        type: 'apply',
        message: 'Analisando arquivos...',
        percentage: 30
      });

      const [oldFileInfo, patchInfo] = await Promise.all([
        this.getFileInfo(oldFile),
        this.getFileInfo(patchFile)
      ]);

      if (!oldFileInfo.exists || !patchInfo.exists) {
        const error = new Error('Arquivo não encontrado');
        this._emitError(error);
        throw error;
      }

      this._emitProgress({
        type: 'apply',
        message: 'Aplicando patch...',
        percentage: 50
      });

      const commandConfig = CommandUtils.buildApplyPatchCommand(
        this.xdeltaPath, 
        oldFile, 
        patchFile, 
        newFile, 
        mergedOptions
      );

      const result = await CommandUtils.spawnCommand(
        commandConfig.command,
        commandConfig.args,
        { timeoutMs: mergedOptions.timeout || 300000 }
      );

      if (!result.success) {
        throw new Error(`Erro ao aplicar patch: ${result.stderr || result.error}`);
      }

      this._emitProgress({
        type: 'apply',
        message: 'Verificando resultado...',
        percentage: 80
      });

      const endTime = Date.now();
      const duration = endTime - startTime;
      const newFileInfo = await this.getFileInfo(newFile);

      const applyResult = {
        success: true,
        oldFile: {
          path: oldFile,
          size: oldFileInfo.size,
          sizeFormatted: oldFileInfo.sizeFormatted,
        },
        patchFile: {
          path: patchFile,
          size: patchInfo.size,
          sizeFormatted: patchInfo.sizeFormatted,
        },
        newFile: {
          path: newFile,
          size: newFileInfo.size,
          sizeFormatted: newFileInfo.sizeFormatted,
        },
        metrics: {
          duration,
          durationFormatted: MetricsUtils.formatDuration(duration)
        }
      };

      this._emitProgress({
        type: 'apply',
        message: 'Patch aplicado com sucesso!',
        percentage: 100,
        success: true
      });

      this._emitComplete(applyResult);
      return applyResult;

    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;

      this._emitProgress({
        type: 'apply',
        message: `Erro: ${error.message}`,
        percentage: 100,
        success: false,
        error: error.message
      });

      this._emitError(error);

      return {
        success: false,
        error: error.message,
        duration,
        durationFormatted: MetricsUtils.formatDuration(duration),
      };
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
      const newFiles = await fs.readdir(newDir);

      const patches = [];
      const maxParallel = Math.max(1, Math.min(4, options.maxParallel || 4));
      const queue = [...newFiles];
      const running = [];
      const allPromises = [];

      const runNext = () => {
        if (queue.length === 0) return;
        const file = queue.shift();
        const oldPath = path.join(oldDir, file);
        const newPath = path.join(newDir, file);
        const patchPath = path.join(patchesDir, `${file}.xdelta`);

        const task = (async () => {
          if (await FileValidation.fileExists(oldPath)) {
            // Opcional: pular se não houver diferença detectável
            if (options.skipUnchanged) {
              try {
                const [sOld, sNew] = await Promise.all([fs.stat(oldPath), fs.stat(newPath)]);
                if (sOld.size === sNew.size) {
                  const equal = await LargeFileUtils.compareFilesStream(oldPath, newPath);
                  if (equal) {
                    patches.push({ file, patchPath, status: 'skipped', reason: 'Sem alterações' });
                    return;
                  }
                }
              } catch (_) { /* ignora comparação em erro */ }
            }
            try {
              await this.createPatch(oldPath, newPath, patchPath, options);
              patches.push({ file, patchPath, status: 'success' });
            } catch (error) {
              patches.push({ file, patchPath, status: 'error', error: error.message });
            }
          } else {
            patches.push({ file, patchPath, status: 'skipped', reason: 'Arquivo original não encontrado' });
          }
        })().finally(() => {
          running.splice(running.indexOf(taskPromise), 1);
          runNext();
        });
        const taskPromise = task;
        running.push(taskPromise);
        allPromises.push(taskPromise);
        if (running.length < maxParallel) runNext();
      };

      for (let i = 0; i < maxParallel; i++) runNext();
      await Promise.all(allPromises);

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
      const patchFiles = (await fs.readdir(patchesDir)).filter(f => f.endsWith('.xdelta'));

      const results = [];
      const maxParallel = Math.max(1, Math.min(4, options.maxParallel || 4));
      const queue = [...patchFiles];
      const running = [];
      const allPromises = [];

      const runNext = () => {
        if (queue.length === 0) return;
        const patchFile = queue.shift();
        const originalFile = patchFile.replace('.xdelta', '');
        const oldPath = path.join(oldDir, originalFile);
        const patchPath = path.join(patchesDir, patchFile);
        const newPath = path.join(outputDir, originalFile);

        const task = (async () => {
          if (await FileValidation.fileExists(oldPath)) {
            try {
              await this.applyPatch(oldPath, patchPath, newPath, options);
              results.push({ file: originalFile, status: 'success' });
            } catch (error) {
              results.push({ file: originalFile, status: 'error', error: error.message });
            }
          } else {
            results.push({ file: originalFile, status: 'skipped', reason: 'Arquivo original não encontrado' });
          }
        })().finally(() => {
          running.splice(running.indexOf(taskPromise), 1);
          runNext();
        });
        const taskPromise = task;
        running.push(taskPromise);
        allPromises.push(taskPromise);
        if (running.length < maxParallel) runNext();
      };

      for (let i = 0; i < maxParallel; i++) runNext();
      await Promise.all(allPromises);

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
    this._emitProgress({
      type: 'verify',
      message: 'Iniciando verificação do patch...',
      percentage: 0
    });

    try {
      // Validação dos arquivos de entrada
      this._emitProgress({
        type: 'verify',
        message: 'Validando arquivos de entrada...',
        percentage: 10
      });

      const validation = await FileValidation.validateVerifyInputs(oldFile, patchFile);
      if (!validation.isValid) {
        const error = new Error(`Validação falhou: ${validation.errors.join(', ')}`);
        this._emitError(error);
        throw error;
      }

      // Verifica se o Xdelta está disponível
      this._emitProgress({
        type: 'verify',
        message: 'Verificando Xdelta3...',
        percentage: 20
      });

      await this.checkXdelta();

      // Verifica se é um arquivo grande
      this._emitProgress({
        type: 'verify',
        message: 'Analisando arquivos...',
        percentage: 30
      });

      const newFileSize = await LargeFileUtils.getFileSize(newFile);
      const isLargeFile = newFileSize > this.defaultOptions.largeFileThreshold;

      let result;
      if (isLargeFile) {
        this._emitProgress({
          type: 'verify',
          message: 'Verificando arquivo grande...',
          percentage: 50
        });

        // Usa verificação otimizada para arquivos grandes
        result = await LargeFileUtils.verifyPatchForLargeFile(
          oldFile, 
          patchFile, 
          newFile, 
          this.applyPatch.bind(this)
        );
      } else {
        this._emitProgress({
          type: 'verify',
          message: 'Verificando arquivo...',
          percentage: 50
        });

        // Usa verificação normal para arquivos pequenos
        const tempFile = `${newFile}.temp`;

        // Aplica o patch
        const applyResult = await this.applyPatch(oldFile, patchFile, tempFile, {
          showProgress: false,
          onProgress: null,
          onError: null,
          onComplete: null
        });

        if (!applyResult.success) {
          throw new Error(`Falha ao aplicar patch para verificação: ${applyResult.error}`);
        }

        // Compara com o arquivo original
        const originalBuffer = await fs.readFile(newFile);
        const patchedBuffer = await fs.readFile(tempFile);

        // Remove arquivo temporário
        await fs.remove(tempFile);

        const isValid = originalBuffer.equals(patchedBuffer);

        result = {
          isValid,
          originalSize: originalBuffer.length,
          patchedSize: patchedBuffer.length,
        };
      }

      this._emitProgress({
        type: 'verify',
        message: result.isValid ? 'Patch é válido!' : 'Patch é inválido!',
        percentage: 100,
        success: result.isValid
      });

      this._emitComplete(result);
      return result;

    } catch (error) {
      this._emitProgress({
        type: 'verify',
        message: `Erro: ${error.message}`,
        percentage: 100,
        success: false,
        error: error.message
      });

      this._emitError(error);
      throw error;
    }
  }
}

export default AdvancedPatchGenerator;
