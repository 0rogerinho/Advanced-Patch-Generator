import fs from 'fs-extra';
import path from 'path';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Utilitários para formatação e métricas
 * @class MetricsUtils
 */
class MetricsUtils {
  /**
   * Formata bytes em unidades legíveis (KB, MB, GB)
   * @param {number} bytes - Número de bytes
   * @returns {string} String formatada com unidade
   * @example
   * MetricsUtils.formatBytes(1024) // "1 KB"
   * MetricsUtils.formatBytes(1048576) // "1 MB"
   */
  static formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Formata milissegundos em unidades legíveis (ms, s, min)
   * @param {number} ms - Milissegundos
   * @returns {string} String formatada com unidade
   * @example
   * MetricsUtils.formatTime(500) // "500ms"
   * MetricsUtils.formatTime(1500) // "1.50s"
   */
  static formatTime(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    return `${(ms / 60000).toFixed(2)}min`;
  }

  /**
   * Calcula a taxa de compressão entre dois tamanhos
   * @param {number} originalSize - Tamanho original em bytes
   * @param {number} compressedSize - Tamanho comprimido em bytes
   * @returns {string} Taxa de compressão em porcentagem
   * @example
   * MetricsUtils.calculateCompressionRatio(1000, 500) // "50.00"
   */
  static calculateCompressionRatio(originalSize, compressedSize) {
    const ratio = ((originalSize - compressedSize) / originalSize) * 100;
    return ratio.toFixed(2);
  }

  /**
   * Cria uma barra de progresso visual
   * @param {number} percentage - Porcentagem de progresso (0-100)
   * @param {number} width - Largura da barra (padrão: 30)
   * @returns {string} Barra de progresso formatada
   * @example
   * MetricsUtils.createProgressBar(75) // "[████████████████████████░░░░░░] 75.0%"
   */
  static createProgressBar(percentage, width = 30) {
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    return `[${bar}] ${percentage.toFixed(1)}%`;
  }
}

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
    this.xdeltaPath = options.xdeltaPath || 'xdelta3.exe';
    this.defaultOptions = {
      compression: options.compression || 9,
      verify: options.verify !== false,
      showProgress: options.showProgress !== false,
      ...options,
    };
  }

  /**
   * Obtém informações detalhadas de um arquivo
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
   */
  async checkXdelta() {
    return new Promise((resolve, reject) => {
      const args = ['-h'];
      const child = spawn(this.xdeltaPath, args, {
        stdio: 'pipe',
        shell: process.platform === 'win32',
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
        // Se temos saída (mesmo que seja stderr), significa que o comando funcionou
        if (stdout || stderr) {
          resolve(true);
        } else {
          reject(new Error('Xdelta3 não encontrado'));
        }
      });

      child.on('error', (error) => {
        console.log('\n❌ Xdelta3 não encontrado no sistema.');
        console.log('\n📋 Para instalar o Xdelta3 no Windows:');
        console.log('1. Acesse: https://github.com/jmacd/xdelta/releases');
        console.log('2. Baixe a versão mais recente para Windows');
        console.log('3. Extraia o arquivo xdelta3.exe');
        console.log('4. Coloque o xdelta3.exe em uma pasta no PATH');
        console.log(
          '   (ex: C:\\Windows\\System32\\ ou adicione ao PATH do sistema)',
        );
        console.log('\n💡 Alternativas:');
        console.log('   - Use o Scoop: scoop install xdelta3');
        console.log('   - Use o Chocolatey: choco install xdelta3');
        console.log('\n🔧 Ou configure o caminho manualmente:');
        console.log('   const patchGen = new AdvancedPatchGenerator({');
        console.log('     xdeltaPath: "C:\\caminho\\para\\xdelta3.exe"');
        console.log('   });');

        reject(
          new Error(
            'Xdelta3 não encontrado. Siga as instruções acima para instalar.',
          ),
        );
      });
    });
  }

  /**
   * Cria um patch entre dois arquivos com métricas detalhadas
   * @param {string} oldFile - Caminho do arquivo antigo
   * @param {string} newFile - Caminho do arquivo novo
   * @param {string} patchFile - Caminho do arquivo de patch de saída
   * @param {Object} options - Opções adicionais
   */
  async createPatch(oldFile, newFile, patchFile, options = {}) {
    const startTime = Date.now();

    try {
      await this.checkXdelta();

      // Verifica se os arquivos existem
      await fs.access(oldFile);
      await fs.access(newFile);

      // Obtém informações dos arquivos
      const oldFileInfo = await this.getFileInfo(oldFile);
      const newFileInfo = await this.getFileInfo(newFile);

      if (this.defaultOptions.showProgress) {
        console.log('\n📊 Informações dos Arquivos:');
        console.log(`📁 Arquivo Original: ${oldFile}`);
        console.log(`   Tamanho: ${oldFileInfo.sizeFormatted}`);
        console.log(`📁 Arquivo Novo: ${newFile}`);
        console.log(`   Tamanho: ${newFileInfo.sizeFormatted}`);
        console.log(`📁 Patch de Saída: ${patchFile}`);
        console.log('\n🔄 Criando patch...');
      }

      const opts = { ...this.defaultOptions, ...options };
      const compressionFlag = opts.compression ? `-${opts.compression}` : '';
      const verifyFlag = opts.verify ? '-v' : '';

      const command =
        process.platform === 'win32'
          ? `"${this.xdeltaPath}" ${compressionFlag} ${verifyFlag} -e -f -s "${oldFile}" "${newFile}" "${patchFile}"`
          : `${this.xdeltaPath} ${compressionFlag} ${verifyFlag} -e -f -s "${oldFile}" "${newFile}" "${patchFile}"`;

      const { stdout, stderr } = await execAsync(command);

      if (stderr && !stderr.includes('xdelta3')) {
        throw new Error(`Erro ao criar patch: ${stderr}`);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;
      const patchInfo = await this.getFileInfo(patchFile);

      const result = {
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
      };

      if (this.defaultOptions.showProgress) {
        this.displayPatchResult(result);
      }

      return result;
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
        console.log(`❌ Erro ao criar patch: ${error.message}`);
      }

      throw new Error(`Erro ao criar patch: ${error.message}`);
    }
  }

  /**
   * Aplica um patch a um arquivo com métricas detalhadas
   * @param {string} oldFile - Caminho do arquivo original
   * @param {string} patchFile - Caminho do arquivo de patch
   * @param {string} newFile - Caminho do arquivo de saída
   * @param {Object} options - Opções adicionais
   */
  async applyPatch(oldFile, patchFile, newFile, options = {}) {
    const startTime = Date.now();

    try {
      await this.checkXdelta();

      // Verifica se os arquivos existem
      await fs.access(oldFile);
      await fs.access(patchFile);

      // Obtém informações dos arquivos
      const oldFileInfo = await this.getFileInfo(oldFile);
      const patchInfo = await this.getFileInfo(patchFile);

      if (this.defaultOptions.showProgress) {
        console.log('\n📊 Informações dos Arquivos:');
        console.log(`📁 Arquivo Original: ${oldFile}`);
        console.log(`   Tamanho: ${oldFileInfo.sizeFormatted}`);
        console.log(`📁 Patch: ${patchFile}`);
        console.log(`   Tamanho: ${patchInfo.sizeFormatted}`);
        console.log(`📁 Arquivo de Saída: ${newFile}`);
        console.log('\n🔄 Aplicando patch...');
      }

      const opts = { ...this.defaultOptions, ...options };
      const verifyFlag = opts.verify ? '-v' : '';

      const command =
        process.platform === 'win32'
          ? `"${this.xdeltaPath}" ${verifyFlag} -d -f -s "${oldFile}" "${patchFile}" "${newFile}"`
          : `${this.xdeltaPath} ${verifyFlag} -d -f -s "${oldFile}" "${patchFile}" "${newFile}"`;

      const { stdout, stderr } = await execAsync(command);

      if (stderr && !stderr.includes('xdelta3')) {
        throw new Error(`Erro ao aplicar patch: ${stderr}`);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;
      const newFileInfo = await this.getFileInfo(newFile);

      const result = {
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
        this.displayApplyResult(result);
      }

      return result;
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
        console.log(`❌ Erro ao aplicar patch: ${error.message}`);
      }

      throw new Error(`Erro ao aplicar patch: ${error.message}`);
    }
  }

  /**
   * Exibe resultado da criação do patch de forma bonita
   */
  displayPatchResult(result) {
    console.log('\n' + '='.repeat(60));
    console.log('🎉 PATCH CRIADO COM SUCESSO!');
    console.log('='.repeat(60));

    console.log('\n⏱️  Métricas de Tempo:');
    console.log(`   Tempo de Geração: ${result.durationFormatted}`);

    console.log('\n📊 Métricas de Tamanho:');
    console.log(`   Arquivo Original: ${result.oldFile.sizeFormatted}`);
    console.log(`   Arquivo Novo:     ${result.newFile.sizeFormatted}`);
    console.log(`   Patch Gerado:     ${result.patch.sizeFormatted}`);

    console.log('\n🗜️  Eficiência de Compressão:');
    console.log(`   Nível de Compressão: ${result.compression.level}`);
    console.log(`   Taxa de Compressão:  ${result.compression.ratio}%`);
    console.log(
      `   Tamanho Economizado:  ${MetricsUtils.formatBytes(
        result.compression.originalSize - result.compression.compressedSize,
      )}`,
    );

    console.log('\n📁 Arquivos:');
    console.log(`   Original: ${result.oldFile.path}`);
    console.log(`   Novo:     ${result.newFile.path}`);
    console.log(`   Patch:    ${result.patch.path}`);

    console.log('\n' + '='.repeat(60));
  }

  /**
   * Exibe resultado da aplicação do patch de forma bonita
   */
  displayApplyResult(result) {
    console.log('\n' + '='.repeat(60));
    console.log('✅ PATCH APLICADO COM SUCESSO!');
    console.log('='.repeat(60));

    console.log('\n⏱️  Métricas de Tempo:');
    console.log(`   Tempo de Aplicação: ${result.durationFormatted}`);

    console.log('\n📊 Métricas de Tamanho:');
    console.log(`   Arquivo Original: ${result.oldFile.sizeFormatted}`);
    console.log(`   Patch:            ${result.patch.sizeFormatted}`);
    console.log(`   Arquivo Aplicado: ${result.appliedFile.sizeFormatted}`);

    console.log('\n📁 Arquivos:');
    console.log(`   Original: ${result.oldFile.path}`);
    console.log(`   Patch:    ${result.patch.path}`);
    console.log(`   Aplicado: ${result.appliedFile.path}`);

    console.log('\n' + '='.repeat(60));
  }

  /**
   * Cria patches em lote para múltiplos arquivos
   * @param {string} oldDir - Diretório com arquivos antigos
   * @param {string} newDir - Diretório com arquivos novos
   * @param {string} patchesDir - Diretório para salvar os patches
   * @param {Object} options - Opções adicionais
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

        if (await fs.pathExists(oldPath)) {
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

          if (await fs.pathExists(oldPath)) {
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
   */
  async verifyPatch(oldFile, patchFile, newFile) {
    try {
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
    } catch (error) {
      throw new Error(`Erro ao verificar patch: ${error.message}`);
    }
  }
}

export default AdvancedPatchGenerator;
