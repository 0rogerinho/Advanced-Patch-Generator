import fs from 'fs-extra';
import path from 'path';
import MetricsUtils from '../utils/metrics.js';
import CommandUtils from '../utils/commandUtils.js';
import DisplayUtils from '../utils/displayUtils.js';
import FileValidation from '../validations/fileValidation.js';
import { DEFAULT_OPTIONS, MESSAGES } from '../constants/index.js';

/**
 * Analisador de Patches Avançado
 * Analisa patches com diferentes níveis de compressão e fornece métricas detalhadas
 * @class PatchAnalyzer
 */
class PatchAnalyzer {
  /**
   * Cria uma nova instância do PatchAnalyzer
   * @param {Object} options - Opções de configuração
   * @param {string} [options.xdeltaPath='xdelta3.exe'] - Caminho para o executável xdelta3
   * @param {boolean} [options.showProgress=true] - Mostrar progresso das operações
   * @param {boolean} [options.includeUncompressed=true] - Incluir análise sem compressão
   * @param {Array<number>} [options.compressionLevels=[0,1,3,6,9]] - Níveis de compressão para testar
   */
  constructor(options = {}) {
    this.xdeltaPath = options.xdeltaPath || DEFAULT_OPTIONS.xdeltaPath;
    this.showProgress = options.showProgress !== false;
    this.includeUncompressed = options.includeUncompressed !== false;
    this.compressionLevels = options.compressionLevels || [0, 1, 3, 6, 9];
  }

  /**
   * Analisa um patch com diferentes níveis de compressão
   * @param {string} oldFile - Caminho do arquivo antigo
   * @param {string} newFile - Caminho do arquivo novo
   * @param {string} outputDir - Diretório de saída para os patches
   * @param {Object} options - Opções adicionais
   * @returns {Promise<Object>} Resultado da análise
   */
  async analyzePatch(oldFile, newFile, outputDir, options = {}) {
    const startTime = Date.now();

    try {
      // Validação dos arquivos de entrada
      const validation = await FileValidation.validatePatchInputs(oldFile, newFile);
      if (!validation.isValid) {
        throw new Error(`Validação falhou: ${validation.errors.join(', ')}`);
      }

      // Cria diretório de saída se não existir
      await fs.ensureDir(outputDir);

      // Obtém informações dos arquivos
      const oldFileInfo = await this.getFileInfo(oldFile);
      const newFileInfo = await this.getFileInfo(newFile);

      if (this.showProgress) {
        DisplayUtils.displayProgress('Iniciando análise de patches', 0);
      }

      const results = {
        oldFile: oldFileInfo,
        newFile: newFileInfo,
        analysis: [],
        summary: {},
        timestamp: new Date(),
        duration: 0
      };

      // Testa diferentes níveis de compressão
      const totalTests = this.compressionLevels.length + (this.includeUncompressed ? 1 : 0);
      let currentTest = 0;

      // Teste sem compressão (se habilitado)
      if (this.includeUncompressed) {
        if (this.showProgress) {
          DisplayUtils.displayProgress('Testando sem compressão', (currentTest / totalTests) * 100);
        }
        
        const uncompressedResult = await this.testCompressionLevel(
          oldFile, newFile, outputDir, 'uncompressed', -1
        );
        results.analysis.push(uncompressedResult);
        currentTest++;
      }

      // Testa cada nível de compressão
      for (const level of this.compressionLevels) {
        if (this.showProgress) {
          DisplayUtils.displayProgress(`Testando compressão nível ${level}`, (currentTest / totalTests) * 100);
        }

        const result = await this.testCompressionLevel(
          oldFile, newFile, outputDir, `compression_${level}`, level
        );
        results.analysis.push(result);
        currentTest++;
      }

      // Calcula resumo
      results.summary = this.calculateSummary(results.analysis, oldFileInfo, newFileInfo);
      results.duration = Date.now() - startTime;
      results.durationFormatted = MetricsUtils.formatTime(results.duration);

      if (this.showProgress) {
        DisplayUtils.displayProgress('Análise concluída', 100);
      }

      return results;

    } catch (error) {
      throw new Error(`Erro na análise: ${error.message}`);
    }
  }

  /**
   * Testa um nível específico de compressão
   * @param {string} oldFile - Arquivo antigo
   * @param {string} newFile - Arquivo novo
   * @param {string} outputDir - Diretório de saída
   * @param {string} testName - Nome do teste
   * @param {number} compressionLevel - Nível de compressão (-1 para sem compressão)
   * @returns {Promise<Object>} Resultado do teste
   */
  async testCompressionLevel(oldFile, newFile, outputDir, testName, compressionLevel) {
    const testStartTime = Date.now();
    const patchFile = path.join(outputDir, `patch_${testName}.xdelta`);

    try {
      // Comando xdelta3
      const args = ['-f', '-e'];
      
      if (compressionLevel >= 0) {
        args.push(`-${compressionLevel}`);
      }
      
      args.push('-s', oldFile, newFile, patchFile);

      const result = await CommandUtils.spawnCommand(this.xdeltaPath, args);
      
      if (!result.success) {
        throw new Error(`Falha na criação do patch: ${result.error}`);
      }

      // Obtém informações do patch criado
      const patchInfo = await this.getFileInfo(patchFile);
      const duration = Date.now() - testStartTime;

      return {
        testName,
        compressionLevel,
        patchFile,
        patchInfo,
        duration,
        durationFormatted: MetricsUtils.formatTime(duration),
        success: true
      };

    } catch (error) {
      return {
        testName,
        compressionLevel,
        patchFile,
        duration: Date.now() - testStartTime,
        durationFormatted: MetricsUtils.formatTime(Date.now() - testStartTime),
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Calcula resumo da análise
   * @param {Array} analysis - Resultados da análise
   * @param {Object} oldFileInfo - Informações do arquivo antigo
   * @param {Object} newFileInfo - Informações do arquivo novo
   * @returns {Object} Resumo da análise
   */
  calculateSummary(analysis, oldFileInfo, newFileInfo) {
    const successfulTests = analysis.filter(test => test.success);
    
    if (successfulTests.length === 0) {
      return {
        totalTests: analysis.length,
        successfulTests: 0,
        bestCompression: null,
        worstCompression: null,
        averageCompressionRatio: 0,
        totalSizeSaved: 0
      };
    }

    // Calcula métricas para cada teste bem-sucedido
    const testsWithMetrics = successfulTests.map(test => {
      const originalSize = newFileInfo.size;
      const compressedSize = test.patchInfo.size;
      
      // Calcula a taxa de compressão baseada no tamanho do arquivo novo vs patch
      const compressionRatio = parseFloat(MetricsUtils.calculateCompressionRatio(originalSize, compressedSize));
      const sizeSaved = originalSize - compressedSize;

      return {
        ...test,
        originalSize,
        compressedSize,
        compressionRatio,
        sizeSaved,
        sizeSavedFormatted: MetricsUtils.formatBytes(Math.abs(sizeSaved))
      };
    });

    // Encontra melhor e pior compressão
    const bestCompression = testsWithMetrics.reduce((best, current) => 
      current.compressionRatio > best.compressionRatio ? current : best
    );

    const worstCompression = testsWithMetrics.reduce((worst, current) => 
      current.compressionRatio < worst.compressionRatio ? current : worst
    );

    // Calcula médias
    const averageCompressionRatio = testsWithMetrics.reduce((sum, test) => 
      sum + test.compressionRatio, 0
    ) / testsWithMetrics.length;

    const totalSizeSaved = testsWithMetrics.reduce((sum, test) => 
      sum + test.sizeSaved, 0
    );

    return {
      totalTests: analysis.length,
      successfulTests: successfulTests.length,
      bestCompression,
      worstCompression,
      averageCompressionRatio: averageCompressionRatio.toFixed(2),
      totalSizeSaved,
      totalSizeSavedFormatted: MetricsUtils.formatBytes(totalSizeSaved),
      testsWithMetrics
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
        path: filePath
      };
    } catch (error) {
      return { exists: false, error: error.message, path: filePath };
    }
  }

  /**
   * Exibe resultados da análise de forma bonita
   * @param {Object} results - Resultados da análise
   */
  static displayAnalysisResults(results) {
    console.log('\n' + '🔬'.repeat(20));
    console.log('🔬 ANÁLISE DE PATCHES COMPLETA 🔬');
    console.log('🔬'.repeat(20));

    // Informações dos arquivos
    console.log('\n📁 ARQUIVOS ANALISADOS:');
    console.log('─'.repeat(50));
    DisplayUtils.displayFileInfo('Original', results.oldFile.path, results.oldFile);
    DisplayUtils.displayFileInfo('Novo', results.newFile.path, results.newFile);

    // Resumo geral
    console.log('\n📊 RESUMO GERAL:');
    console.log('─'.repeat(50));
    console.log(`   ⏱️  Tempo Total: ${results.durationFormatted}`);
    console.log(`   🧪 Testes Realizados: ${results.summary.totalTests}`);
    console.log(`   ✅ Testes Bem-sucedidos: ${results.summary.successfulTests}`);
    console.log(`   📈 Taxa de Sucesso: ${((results.summary.successfulTests / results.summary.totalTests) * 100).toFixed(1)}%`);

    if (results.summary.successfulTests > 0) {
      console.log(`   🗜️  Média de Compressão: ${results.summary.averageCompressionRatio}%`);
      console.log(`   💾 Total Economizado: ${results.summary.totalSizeSavedFormatted}`);
    }

    // Melhor e pior compressão
    if (results.summary.bestCompression) {
      console.log('\n🏆 MELHOR COMPRESSÃO:');
      console.log('─'.repeat(50));
      console.log(`   Nível: ${results.summary.bestCompression.compressionLevel === -1 ? 'Sem compressão' : results.summary.bestCompression.compressionLevel}`);
      const bestRatio = results.summary.bestCompression.compressionRatio >= 0 
        ? `${results.summary.bestCompression.compressionRatio}%` 
        : `${Math.abs(results.summary.bestCompression.compressionRatio)}% (aumento)`;
      console.log(`   Taxa: ${bestRatio}`);
      console.log(`   Tamanho: ${results.summary.bestCompression.patchInfo.sizeFormatted}`);
      const bestEconomy = results.summary.bestCompression.sizeSaved >= 0 
        ? results.summary.bestCompression.sizeSavedFormatted 
        : `${results.summary.bestCompression.sizeSavedFormatted} (aumento)`;
      console.log(`   Economia: ${bestEconomy}`);
      console.log(`   Tempo: ${results.summary.bestCompression.durationFormatted}`);
    }

    if (results.summary.worstCompression && results.summary.worstCompression !== results.summary.bestCompression) {
      console.log('\n📉 PIOR COMPRESSÃO:');
      console.log('─'.repeat(50));
      console.log(`   Nível: ${results.summary.worstCompression.compressionLevel === -1 ? 'Sem compressão' : results.summary.worstCompression.compressionLevel}`);
      const worstRatio = results.summary.worstCompression.compressionRatio >= 0 
        ? `${results.summary.worstCompression.compressionRatio}%` 
        : `${Math.abs(results.summary.worstCompression.compressionRatio)}% (aumento)`;
      console.log(`   Taxa: ${worstRatio}`);
      console.log(`   Tamanho: ${results.summary.worstCompression.patchInfo.sizeFormatted}`);
      const worstEconomy = results.summary.worstCompression.sizeSaved >= 0 
        ? results.summary.worstCompression.sizeSavedFormatted 
        : `${results.summary.worstCompression.sizeSavedFormatted} (aumento)`;
      console.log(`   Economia: ${worstEconomy}`);
      console.log(`   Tempo: ${results.summary.worstCompression.durationFormatted}`);
    }

    // Tabela detalhada
    console.log('\n📋 ANÁLISE DETALHADA:');
    console.log('─'.repeat(80));
    console.log('Nível\t\tTaxa\t\tTamanho\t\tEconomia\t\tTempo\t\tStatus');
    console.log('─'.repeat(80));

    results.summary.testsWithMetrics.forEach(test => {
      const level = test.compressionLevel === -1 ? 'Sem' : test.compressionLevel;
      const status = test.success ? '✅' : '❌';
      const ratio = test.compressionRatio >= 0 ? `${test.compressionRatio}%` : `${Math.abs(test.compressionRatio)}% (aumento)`;
      const economy = test.sizeSaved >= 0 ? test.sizeSavedFormatted : `${test.sizeSavedFormatted} (aumento)`;
      console.log(`${level}\t\t${ratio}\t\t${test.patchInfo.sizeFormatted}\t\t${economy}\t\t${test.durationFormatted}\t\t${status}`);
    });

    console.log('─'.repeat(80));
    console.log('🔬'.repeat(20));
  }
}

export default PatchAnalyzer;
