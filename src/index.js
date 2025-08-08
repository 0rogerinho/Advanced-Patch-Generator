#!/usr/bin/env node

import AdvancedPatchGenerator from './lib/AdvancedPatchGenerator.js';
import PatchAnalyzer from './lib/PatchAnalyzer.js';
import { MetricsUtils, DisplayUtils } from './utils/index.js';
import { FileValidation } from './validations/index.js';
import { DEFAULT_OPTIONS, MESSAGES } from './constants/index.js';

/**
 * Advanced Patch Generator
 * Ponto de entrada principal da biblioteca
 */

// Exporta a classe principal
export default AdvancedPatchGenerator;

// Exporta utilitários para uso direto
export {
  PatchAnalyzer,
  MetricsUtils,
  DisplayUtils,
  FileValidation,
  DEFAULT_OPTIONS,
  MESSAGES
};

// CLI simples se executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log('🚀 Advanced Patch Generator');
    console.log('===========================\n');
    console.log('Uso:');
    console.log('  node src/index.js <comando> [opções]\n');
    console.log('Comandos:');
    console.log('  check     - Verifica se o Xdelta3 está disponível');
    console.log('  info      - Mostra informações sobre arquivos');
    console.log('  create    - Cria um patch');
    console.log('  apply     - Aplica um patch');
    console.log('  verify    - Verifica integridade de um patch');
    console.log('  --help    - Mostra esta ajuda\n');
    console.log('Exemplos:');
    console.log('  node src/index.js check');
    console.log('  node src/index.js create old.txt new.txt patch.xdelta');
    console.log('  node src/index.js apply old.txt patch.xdelta new.txt');
    console.log('  node src/index.js verify old.txt patch.xdelta expected.txt');
    console.log('\nPara uso programático, importe a biblioteca:');
    console.log('  import AdvancedPatchGenerator from "advanced-patch-generator";');
    process.exit(0);
  }

  const command = args[0];
  
  async function runCLI() {
    const patchGen = new AdvancedPatchGenerator({
      showProgress: true
    });

    try {
      switch (command) {
        case 'check':
          console.log('🔍 Verificando Xdelta3...');
          const isAvailable = await patchGen.checkXdelta();
          if (isAvailable) {
            console.log('✅ Xdelta3 está disponível!');
          } else {
            console.log('❌ Xdelta3 não encontrado.');
            console.log('💡 Instale o Xdelta3 primeiro.');
          }
          break;

        case 'info':
          if (args.length < 2) {
            console.log('❌ Uso: info <arquivo>');
            process.exit(1);
          }
          const filePath = args[1];
          const fileInfo = await patchGen.getFileInfo(filePath);
          if (fileInfo.exists) {
            console.log(`📁 Arquivo: ${filePath}`);
            console.log(`📏 Tamanho: ${fileInfo.sizeFormatted}`);
            console.log(`📅 Modificado: ${fileInfo.modified}`);
          } else {
            console.log(`❌ Arquivo não encontrado: ${filePath}`);
          }
          break;

        case 'create':
          if (args.length < 4) {
            console.log('❌ Uso: create <arquivo_original> <arquivo_novo> <patch_saida>');
            process.exit(1);
          }
          const [oldFile, newFile, patchFile] = args.slice(1);
          console.log('📦 Criando patch...');
          const result = await patchGen.createPatch(oldFile, newFile, patchFile);
          if (result.success) {
            console.log('✅ Patch criado com sucesso!');
            console.log(`   Tamanho: ${result.patchFile.sizeFormatted}`);
            console.log(`   Duração: ${result.metrics.durationFormatted}`);
          } else {
            console.log('❌ Erro ao criar patch:', result.error);
            process.exit(1);
          }
          break;

        case 'apply':
          if (args.length < 4) {
            console.log('❌ Uso: apply <arquivo_original> <patch> <arquivo_saida>');
            process.exit(1);
          }
          const [oldFileApply, patchFileApply, newFileApply] = args.slice(1);
          console.log('🔧 Aplicando patch...');
          const applyResult = await patchGen.applyPatch(oldFileApply, patchFileApply, newFileApply);
          if (applyResult.success) {
            console.log('✅ Patch aplicado com sucesso!');
          } else {
            console.log('❌ Erro ao aplicar patch:', applyResult.error);
            process.exit(1);
          }
          break;

        case 'verify':
          if (args.length < 4) {
            console.log('❌ Uso: verify <arquivo_original> <patch> <arquivo_esperado>');
            process.exit(1);
          }
          const [oldFileVerify, patchFileVerify, expectedFile] = args.slice(1);
          console.log('🔍 Verificando integridade...');
          const verifyResult = await patchGen.verifyPatch(oldFileVerify, patchFileVerify, expectedFile);
          if (verifyResult.isValid) {
            console.log('✅ Patch é válido!');
          } else {
            console.log('❌ Patch é inválido!');
            process.exit(1);
          }
          break;

        default:
          console.log(`❌ Comando desconhecido: ${command}`);
          console.log('💡 Use --help para ver os comandos disponíveis.');
          process.exit(1);
      }
    } catch (error) {
      console.error('❌ Erro:', error.message);
      process.exit(1);
    }
  }

  runCLI();
}
