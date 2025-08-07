#!/usr/bin/env node

/**
 * Script CLI para Análise de Patches
 * Comando: node scripts/analyze-patches.js <arquivo_antigo> <arquivo_novo> [opções]
 */

import { PatchAnalyzer } from '../src/index.js';
import path from 'path';
import fs from 'fs-extra';

// Cores para o terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function printBanner() {
  console.log('\n' + colors.cyan + '='.repeat(60));
  console.log('🔬 ANALISADOR DE PATCHES AVANÇADO 🔬');
  console.log('='.repeat(60) + colors.reset);
  console.log('📊 Analisa patches com diferentes níveis de compressão');
  console.log('🎯 Fornece métricas detalhadas e recomendações');
  console.log('⚡ Interface bonita e informativa\n');
}

function printUsage() {
  console.log(colors.yellow + '📖 USO:' + colors.reset);
  console.log('  node scripts/analyze-patches.js <arquivo_antigo> <arquivo_novo> [opções]\n');
  
  console.log(colors.yellow + '📋 PARÂMETROS:' + colors.reset);
  console.log('  arquivo_antigo    Caminho para o arquivo original');
  console.log('  arquivo_novo      Caminho para o arquivo novo\n');
  
  console.log(colors.yellow + '🔧 OPÇÕES:' + colors.reset);
  console.log('  --output-dir <dir>     Diretório de saída (padrão: ./patches/analysis)');
  console.log('  --compression <niveis> Níveis de compressão (padrão: 0,1,3,6,9)');
  console.log('  --no-uncompressed     Não incluir teste sem compressão');
  console.log('  --no-progress         Não mostrar barra de progresso');
  console.log('  --help                Mostrar esta ajuda\n');
  
  console.log(colors.yellow + '💡 EXEMPLOS:' + colors.reset);
  console.log('  node scripts/analyze-patches.js files/old/file.txt files/new/file.txt');
  console.log('  node scripts/analyze-patches.js old.txt new.txt --compression 0,3,9');
  console.log('  node scripts/analyze-patches.js old.txt new.txt --output-dir ./my-patches\n');
}

function parseArguments() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(0);
  }
  
  if (args.length < 2) {
    console.error(colors.red + '❌ Erro: Arquivos de entrada são obrigatórios!' + colors.reset);
    printUsage();
    process.exit(1);
  }
  
  const oldFile = args[0];
  const newFile = args[1];
  
  // Parse opções
  const options = {
    outputDir: './patches/analysis',
    compressionLevels: [0, 1, 3, 6, 9],
    includeUncompressed: true,
    showProgress: true
  };
  
  for (let i = 2; i < args.length; i++) {
    switch (args[i]) {
      case '--output-dir':
        options.outputDir = args[++i];
        break;
      case '--compression':
        const levels = args[++i].split(',').map(l => parseInt(l.trim()));
        if (levels.some(isNaN)) {
          console.error(colors.red + '❌ Erro: Níveis de compressão devem ser números!' + colors.reset);
          process.exit(1);
        }
        options.compressionLevels = levels;
        break;
      case '--no-uncompressed':
        options.includeUncompressed = false;
        break;
      case '--no-progress':
        options.showProgress = false;
        break;
      default:
        console.error(colors.red + `❌ Erro: Opção desconhecida: ${args[i]}` + colors.reset);
        printUsage();
        process.exit(1);
    }
  }
  
  return { oldFile, newFile, options };
}

async function validateFiles(oldFile, newFile) {
  console.log(colors.blue + '🔍 Validando arquivos...' + colors.reset);
  
  const oldExists = await fs.pathExists(oldFile);
  const newExists = await fs.pathExists(newFile);
  
  if (!oldExists) {
    console.error(colors.red + `❌ Arquivo antigo não encontrado: ${oldFile}` + colors.reset);
    return false;
  }
  
  if (!newExists) {
    console.error(colors.red + `❌ Arquivo novo não encontrado: ${newFile}` + colors.reset);
    return false;
  }
  
  const oldStats = await fs.stat(oldFile);
  const newStats = await fs.stat(newFile);
  
  console.log(colors.green + '✅ Arquivos válidos!' + colors.reset);
  console.log(`   📁 Original: ${oldFile} (${formatBytes(oldStats.size)})`);
  console.log(`   📁 Novo:     ${newFile} (${formatBytes(newStats.size)})\n`);
  
  return true;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function main() {
  try {
    printBanner();
    
    // Parse argumentos
    const { oldFile, newFile, options } = parseArguments();
    
    // Valida arquivos
    const filesValid = await validateFiles(oldFile, newFile);
    if (!filesValid) {
      process.exit(1);
    }
    
    // Cria diretório de saída
    await fs.ensureDir(options.outputDir);
    
    console.log(colors.blue + '⚙️  Configuração:' + colors.reset);
    console.log(`   📂 Diretório de saída: ${options.outputDir}`);
    console.log(`   🗜️  Níveis de compressão: ${options.compressionLevels.join(', ')}`);
    console.log(`   📊 Incluir sem compressão: ${options.includeUncompressed ? 'Sim' : 'Não'}`);
    console.log(`   🔄 Mostrar progresso: ${options.showProgress ? 'Sim' : 'Não'}\n`);
    
    // Cria analisador
    const analyzer = new PatchAnalyzer({
      showProgress: options.showProgress,
      includeUncompressed: options.includeUncompressed,
      compressionLevels: options.compressionLevels
    });
    
    console.log(colors.blue + '🚀 Iniciando análise...' + colors.reset);
    console.log('─'.repeat(50));
    
    // Executa análise
    const results = await analyzer.analyzePatch(oldFile, newFile, options.outputDir);
    
    // Exibe resultados
    PatchAnalyzer.displayAnalysisResults(results);
    
    // Recomendações finais
    console.log(colors.green + '\n🎯 RECOMENDAÇÃO FINAL:' + colors.reset);
    console.log('─'.repeat(50));
    
    if (results.summary.bestCompression) {
      const best = results.summary.bestCompression;
      const level = best.compressionLevel === -1 ? 'Sem compressão' : `Nível ${best.compressionLevel}`;
      console.log(`   🏆 Use: ${level}`);
      console.log(`   📊 Taxa de compressão: ${best.compressionRatio}%`);
      console.log(`   📁 Arquivo: ${best.patchFile}`);
      console.log(`   ⚡ Tempo de geração: ${best.durationFormatted}`);
    }
    
    console.log('\n' + colors.cyan + '='.repeat(60));
    console.log('✅ Análise concluída com sucesso!');
    console.log('='.repeat(60) + colors.reset);
    
  } catch (error) {
    console.error(colors.red + '\n❌ Erro durante a análise:' + colors.reset);
    console.error(colors.red + `   ${error.message}` + colors.reset);
    process.exit(1);
  }
}

// Executa o script
main();
