#!/usr/bin/env node

/**
 * Exemplo de Análise de Patches
 * Demonstra como usar o PatchAnalyzer para analisar patches com diferentes níveis de compressão
 */

import { PatchAnalyzer } from '../src/index.js';
import path from 'path';

async function runPatchAnalysis() {
  try {
    console.log('🔬 Iniciando Análise de Patches Avançada...\n');

    // Configuração do analisador
    const analyzer = new PatchAnalyzer({
      showProgress: true,
      includeUncompressed: true,
      compressionLevels: [0, 1, 3, 6, 9] // Testa diferentes níveis
    });

    // Caminhos dos arquivos (usando os arquivos de exemplo do projeto)
    const oldFile = path.join(process.cwd(), 'files/old/exemplo.txt');
    const newFile = path.join(process.cwd(), 'files/new/exemplo.txt');
    const outputDir = path.join(process.cwd(), 'files/patches/analysis');

    console.log('📁 Arquivos para análise:');
    console.log(`   Original: ${oldFile}`);
    console.log(`   Novo:     ${newFile}`);
    console.log(`   Saída:    ${outputDir}\n`);

    // Executa a análise
    const results = await analyzer.analyzePatch(oldFile, newFile, outputDir);

    // Exibe os resultados de forma bonita
    PatchAnalyzer.displayAnalysisResults(results);

    // Informações adicionais
    console.log('\n💡 RECOMENDAÇÕES:');
    console.log('─'.repeat(50));
    
    if (results.summary.bestCompression) {
      const best = results.summary.bestCompression;
      console.log(`   🎯 Melhor opção: Nível ${best.compressionLevel === -1 ? 'Sem compressão' : best.compressionLevel}`);
      console.log(`   📊 Taxa de compressão: ${best.compressionRatio}%`);
      console.log(`   ⚡ Tempo de geração: ${best.durationFormatted}`);
    }

    if (results.summary.worstCompression && results.summary.worstCompression !== results.summary.bestCompression) {
      const worst = results.summary.worstCompression;
      console.log(`   ⚠️  Evitar: Nível ${worst.compressionLevel === -1 ? 'Sem compressão' : worst.compressionLevel}`);
      console.log(`   📊 Taxa de compressão: ${worst.compressionRatio}%`);
    }

    console.log('\n📁 Patches gerados em:', outputDir);
    console.log('   Você pode usar qualquer um dos patches gerados para aplicar as mudanças.');

  } catch (error) {
    console.error('\n❌ Erro durante a análise:', error.message);
    process.exit(1);
  }
}

// Executa o exemplo se este arquivo for executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  runPatchAnalysis();
}

export default runPatchAnalysis;
