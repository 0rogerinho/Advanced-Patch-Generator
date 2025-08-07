#!/usr/bin/env node

/**
 * Script de Teste para Análise de Patches
 * Demonstra o funcionamento do PatchAnalyzer
 */

import { PatchAnalyzer } from './src/index.js';
import fs from 'fs-extra';
import path from 'path';

async function createTestFiles() {
  console.log('📝 Criando arquivos de teste...');
  
  const testDir = path.join(process.cwd(), 'test-analysis');
  await fs.ensureDir(testDir);
  
  // Arquivo antigo (pequeno)
  const oldContent = `Este é um arquivo de teste.
Contém algumas linhas de texto.
Para demonstrar a funcionalidade de patches.
Versão 1.0`;

  // Arquivo novo (maior, com mais conteúdo)
  const newContent = `Este é um arquivo de teste atualizado.
Contém algumas linhas de texto modificadas.
Para demonstrar a funcionalidade de patches avançada.
Versão 2.0
Adicionando mais conteúdo para testar compressão.
Esta linha é nova e não existia no arquivo original.
Outra linha adicional para aumentar o tamanho.
Mais uma linha para garantir diferenças significativas.
Última linha do arquivo atualizado.`;

  const oldFile = path.join(testDir, 'old.txt');
  const newFile = path.join(testDir, 'new.txt');
  const outputDir = path.join(testDir, 'patches');

  await fs.writeFile(oldFile, oldContent);
  await fs.writeFile(newFile, newContent);
  await fs.ensureDir(outputDir);

  console.log('✅ Arquivos de teste criados!');
  console.log(`   📁 Original: ${oldFile}`);
  console.log(`   📁 Novo:     ${newFile}`);
  console.log(`   📁 Saída:    ${outputDir}\n`);

  return { oldFile, newFile, outputDir };
}

async function runAnalysis() {
  try {
    console.log('🔬 INICIANDO ANÁLISE DE PATCHES AVANÇADA');
    console.log('='.repeat(60));

    // Cria arquivos de teste
    const { oldFile, newFile, outputDir } = await createTestFiles();

    // Configura o analisador
    const analyzer = new PatchAnalyzer({
      showProgress: true,
      includeUncompressed: true,
      compressionLevels: [0, 1, 3, 6, 9]
    });

    console.log('⚙️  Configuração do Analisador:');
    console.log('   🗜️  Níveis de compressão: 0, 1, 3, 6, 9');
    console.log('   📊 Incluir sem compressão: Sim');
    console.log('   🔄 Mostrar progresso: Sim\n');

    // Executa a análise
    console.log('🚀 Executando análise...\n');
    const results = await analyzer.analyzePatch(oldFile, newFile, outputDir);

    // Exibe resultados
    PatchAnalyzer.displayAnalysisResults(results);

    // Informações adicionais
    console.log('\n💡 ANÁLISE COMPLETA!');
    console.log('─'.repeat(50));
    console.log('📊 Resumo dos resultados:');
    console.log(`   🧪 Total de testes: ${results.summary.totalTests}`);
    console.log(`   ✅ Testes bem-sucedidos: ${results.summary.successfulTests}`);
    console.log(`   ⏱️  Tempo total: ${results.durationFormatted}`);
    
    if (results.summary.bestCompression) {
      const best = results.summary.bestCompression;
      console.log(`   🏆 Melhor compressão: ${best.compressionRatio}% (Nível ${best.compressionLevel === -1 ? 'Sem' : best.compressionLevel})`);
    }

    console.log('\n📁 Patches gerados em:', outputDir);
    console.log('   Você pode usar qualquer um dos patches para aplicar as mudanças.');

    // Lista os arquivos gerados
    const files = await fs.readdir(outputDir);
    console.log('\n📋 Arquivos gerados:');
    files.forEach(file => {
      console.log(`   📄 ${file}`);
    });

  } catch (error) {
    console.error('\n❌ Erro durante a análise:', error.message);
    process.exit(1);
  }
}

// Executa o teste
runAnalysis();
