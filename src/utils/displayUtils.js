import MetricsUtils from './metrics.js';
import { MESSAGES } from '../constants/index.js';

/**
 * Utilitários para exibição e formatação de resultados
 * @class DisplayUtils
 */
class DisplayUtils {
  /**
   * Exibe resultado da criação do patch de forma bonita
   * @param {Object} result - Resultado da criação do patch
   */
  static displayPatchResult(result) {
    console.log('\n' + '='.repeat(60));
    console.log(MESSAGES.PATCH_CREATED);
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
   * @param {Object} result - Resultado da aplicação do patch
   */
  static displayApplyResult(result) {
    console.log('\n' + '='.repeat(60));
    console.log(MESSAGES.PATCH_APPLIED);
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
   * Exibe informações de arquivo de forma formatada
   * @param {string} label - Rótulo do arquivo
   * @param {string} path - Caminho do arquivo
   * @param {Object} info - Informações do arquivo
   */
  static displayFileInfo(label, path, info) {
    console.log(`📁 ${label}: ${path}`);
    if (info.exists) {
      console.log(`   Tamanho: ${info.sizeFormatted}`);
      console.log(`   Modificado: ${info.modified.toLocaleString()}`);
    } else {
      console.log(`   ❌ Arquivo não encontrado`);
    }
  }

  /**
   * Exibe progresso de uma operação
   * @param {string} message - Mensagem de progresso
   * @param {number} percentage - Porcentagem de progresso (0-100)
   */
  static displayProgress(message, percentage = null) {
    if (percentage !== null) {
      const progressBar = MetricsUtils.createProgressBar(percentage);
      console.log(`🔄 ${message} ${progressBar}`);
    } else {
      console.log(`🔄 ${message}...`);
    }
  }

  /**
   * Exibe erro de forma formatada
   * @param {string} title - Título do erro
   * @param {string} message - Mensagem do erro
   * @param {Object} details - Detalhes adicionais
   */
  static displayError(title, message, details = null) {
    console.log('\n❌ ' + '='.repeat(50));
    console.log(`❌ ${title}`);
    console.log('='.repeat(50));
    console.log(`💬 ${message}`);
    
    if (details) {
      console.log('\n📋 Detalhes:');
      if (typeof details === 'object') {
        Object.entries(details).forEach(([key, value]) => {
          console.log(`   ${key}: ${value}`);
        });
      } else {
        console.log(`   ${details}`);
      }
    }
    
    console.log('='.repeat(50));
  }

  /**
   * Exibe sucesso de forma formatada
   * @param {string} title - Título do sucesso
   * @param {string} message - Mensagem do sucesso
   */
  static displaySuccess(title, message) {
    console.log('\n✅ ' + '='.repeat(50));
    console.log(`✅ ${title}`);
    console.log('='.repeat(50));
    console.log(`💬 ${message}`);
    console.log('='.repeat(50));
  }

  /**
   * Exibe informações do sistema
   * @param {Object} systemInfo - Informações do sistema
   */
  static displaySystemInfo(systemInfo) {
    console.log('\n🖥️  Informações do Sistema:');
    console.log('='.repeat(40));
    console.log(`   Plataforma: ${systemInfo.platform}`);
    console.log(`   Arquitetura: ${systemInfo.arch}`);
    console.log(`   Node.js: ${systemInfo.nodeVersion}`);
    console.log(`   Xdelta: ${systemInfo.xdeltaVersion || 'Não encontrado'}`);
    console.log('='.repeat(40));
  }

  /**
   * Exibe estatísticas de lote
   * @param {Array} results - Resultados do lote
   */
  static displayBatchStats(results) {
    const total = results.length;
    const success = results.filter(r => r.status === 'success').length;
    const errors = results.filter(r => r.status === 'error').length;
    const skipped = results.filter(r => r.status === 'skipped').length;

    console.log('\n📊 Estatísticas do Lote:');
    console.log('='.repeat(40));
    console.log(`   Total: ${total}`);
    console.log(`   ✅ Sucessos: ${success}`);
    console.log(`   ❌ Erros: ${errors}`);
    console.log(`   ⏭️  Pulados: ${skipped}`);
    console.log(`   📈 Taxa de Sucesso: ${((success / total) * 100).toFixed(1)}%`);
    console.log('='.repeat(40));
  }

  /**
   * Exibe instruções de instalação do Xdelta
   */
  static displayXdeltaInstallInstructions() {
    console.log('\n❌ Xdelta3 não encontrado no sistema.');
    console.log(MESSAGES.XDELTA_INSTALL_INSTRUCTIONS);
  }
}

export default DisplayUtils;
