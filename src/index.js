/**
 * Advanced Patch Generator
 * Gerenciador de patch avançado usando Xdelta para criar e aplicar patches de forma eficiente
 * 
 * @module AdvancedPatchGenerator
 */

// Exporta a classe principal
export { default as AdvancedPatchGenerator } from './lib/AdvancedPatchGenerator.js';

// Exporta o analisador de patches
export { default as PatchAnalyzer } from './lib/PatchAnalyzer.js';

// Exporta utilitários para uso direto
export { default as MetricsUtils } from './utils/metrics.js';
export { default as CommandUtils } from './utils/commandUtils.js';
export { default as DisplayUtils } from './utils/displayUtils.js';
export { default as FileValidation } from './validations/fileValidation.js';

// Exporta constantes
export * from './constants/index.js';

// Exporta a classe principal como default
import AdvancedPatchGenerator from './lib/AdvancedPatchGenerator.js';
export default AdvancedPatchGenerator;
