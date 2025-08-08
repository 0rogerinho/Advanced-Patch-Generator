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
   * Formata duração em unidades legíveis (alias para formatTime)
   * @param {number} ms - Milissegundos
   * @returns {string} String formatada com unidade
   * @example
   * MetricsUtils.formatDuration(500) // "500ms"
   * MetricsUtils.formatDuration(1500) // "1.50s"
   */
  static formatDuration(ms) {
    return this.formatTime(ms);
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

export default MetricsUtils;
