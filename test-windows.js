#!/usr/bin/env node

/**
 * Teste específico para Windows
 * Testa todas as funcionalidades da biblioteca no Windows
 */

import AdvancedPatchGenerator from './src/lib/AdvancedPatchGenerator.js';
import fs from 'fs-extra';
import path from 'path';

async function createTestFiles() {
  console.log('📁 Criando arquivos de teste...');
  
  const oldContent = 'Conteúdo original do arquivo.\nLinha 1\nLinha 2\nLinha 3';
  const newContent = 'Conteúdo atualizado do arquivo.\nLinha 1 (atualizada)\nLinha 2\nLinha 3\nLinha 4 (nova)';
  
  await fs.writeFile('test-old.txt', oldContent);
  await fs.writeFile('test-new.txt', newContent);
  
  console.log('✅ Arquivos de teste criados!');
}

async function testXdeltaDetection() {
  console.log('\n🔍 Testando detecção do Xdelta3...');
  
  const patchGen = new AdvancedPatchGenerator({
    showProgress: false
  });

  try {
    const isAvailable = await patchGen.checkXdelta();
    console.log(`✅ Detecção: ${isAvailable ? 'SUCESSO' : 'FALHA'}`);
    return isAvailable;
  } catch (error) {
    console.log(`❌ Erro na detecção: ${error.message}`);
    return false;
  }
}

async function testPatchCreation() {
  console.log('\n📦 Testando criação de patch...');
  
  const patchGen = new AdvancedPatchGenerator({
    compression: 6,
    verify: true,
    showProgress: false
  });

  try {
    const result = await patchGen.createPatch(
      'test-old.txt',
      'test-new.txt',
      'test-patch.xdelta'
    );

    if (result.success) {
      console.log('✅ Criação de patch: SUCESSO');
      console.log(`📏 Tamanho: ${result.patchFile.sizeFormatted}`);
      console.log(`⏱️  Duração: ${result.metrics.durationFormatted}`);
      return true;
    } else {
      console.log(`❌ Erro na criação: ${result.error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Exceção na criação: ${error.message}`);
    return false;
  }
}

async function testPatchApplication() {
  console.log('\n🔧 Testando aplicação de patch...');
  
  const patchGen = new AdvancedPatchGenerator({
    verify: true,
    showProgress: false
  });

  try {
    const result = await patchGen.applyPatch(
      'test-old.txt',
      'test-patch.xdelta',
      'test-applied.txt'
    );

    if (result.success) {
      console.log('✅ Aplicação de patch: SUCESSO');
      console.log(`📏 Tamanho: ${result.newFile.sizeFormatted}`);
      console.log(`⏱️  Duração: ${result.metrics.durationFormatted}`);
      return true;
    } else {
      console.log(`❌ Erro na aplicação: ${result.error}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Exceção na aplicação: ${error.message}`);
    return false;
  }
}

async function testPatchVerification() {
  console.log('\n🔍 Testando verificação de patch...');
  
  const patchGen = new AdvancedPatchGenerator({
    showProgress: false
  });

  try {
    const result = await patchGen.verifyPatch(
      'test-old.txt',
      'test-patch.xdelta',
      'test-new.txt'
    );

    if (result.isValid) {
      console.log('✅ Verificação de patch: SUCESSO');
      return true;
    } else {
      console.log('❌ Patch inválido');
      return false;
    }
  } catch (error) {
    console.log(`❌ Exceção na verificação: ${error.message}`);
    return false;
  }
}

async function testFileComparison() {
  console.log('\n📋 Testando comparação de arquivos...');
  
  try {
    const originalContent = await fs.readFile('test-new.txt', 'utf8');
    const appliedContent = await fs.readFile('test-applied.txt', 'utf8');
    
    if (originalContent === appliedContent) {
      console.log('✅ Comparação de arquivos: SUCESSO');
      return true;
    } else {
      console.log('❌ Arquivos são diferentes');
      return false;
    }
  } catch (error) {
    console.log(`❌ Erro na comparação: ${error.message}`);
    return false;
  }
}

async function cleanup() {
  console.log('\n🧹 Limpando arquivos de teste...');
  
  const filesToClean = [
    'test-old.txt',
    'test-new.txt', 
    'test-patch.xdelta',
    'test-applied.txt'
  ];
  
  for (const file of filesToClean) {
    if (await fs.pathExists(file)) {
      await fs.remove(file);
    }
  }
  
  console.log('✅ Limpeza concluída!');
}

async function main() {
  console.log('🚀 Teste da Advanced Patch Generator - Windows');
  console.log('=============================================\n');

  const results = {
    detection: false,
    creation: false,
    application: false,
    verification: false,
    comparison: false
  };

  try {
    // Cria arquivos de teste
    await createTestFiles();

    // Testa detecção do Xdelta3
    results.detection = await testXdeltaDetection();

    if (!results.detection) {
      console.log('\n❌ Xdelta3 não encontrado. Teste interrompido.');
      console.log('💡 Execute: npm run install:xdelta3');
      return;
    }

    // Testa criação de patch
    results.creation = await testPatchCreation();

    if (!results.creation) {
      console.log('\n❌ Falha na criação de patch. Teste interrompido.');
      return;
    }

    // Testa aplicação de patch
    results.application = await testPatchApplication();

    if (!results.application) {
      console.log('\n❌ Falha na aplicação de patch. Teste interrompido.');
      return;
    }

    // Testa verificação de patch
    results.verification = await testPatchVerification();

    // Testa comparação de arquivos
    results.comparison = await testFileComparison();

    // Limpa arquivos
    await cleanup();

    // Resumo dos resultados
    console.log('\n📊 Resumo dos Testes:');
    console.log('=====================');
    console.log(`🔍 Detecção Xdelta3: ${results.detection ? '✅ SUCESSO' : '❌ FALHA'}`);
    console.log(`📦 Criação de Patch: ${results.creation ? '✅ SUCESSO' : '❌ FALHA'}`);
    console.log(`🔧 Aplicação de Patch: ${results.application ? '✅ SUCESSO' : '❌ FALHA'}`);
    console.log(`🔍 Verificação de Patch: ${results.verification ? '✅ SUCESSO' : '❌ FALHA'}`);
    console.log(`📋 Comparação de Arquivos: ${results.comparison ? '✅ SUCESSO' : '❌ FALHA'}`);

    const successCount = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;

    console.log(`\n🎯 Resultado Final: ${successCount}/${totalTests} testes passaram`);
    
    if (successCount === totalTests) {
      console.log('🎉 TODOS OS TESTES PASSARAM! A biblioteca está funcionando corretamente no Windows.');
    } else {
      console.log('⚠️  Alguns testes falharam. Verifique os logs acima.');
    }

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    await cleanup();
  }
}

// Executa o teste
main().catch(console.error);
