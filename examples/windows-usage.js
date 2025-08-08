#!/usr/bin/env node

/**
 * Exemplo de uso da Advanced Patch Generator no Windows
 * Este exemplo demonstra como usar a biblioteca corretamente no Windows
 */

import AdvancedPatchGenerator from '../src/lib/AdvancedPatchGenerator.js';
import fs from 'fs-extra';
import path from 'path';

async function createTestFiles() {
  console.log('📁 Criando arquivos de teste...');
  
  const oldContent = 'Este é o conteúdo original do arquivo.\nLinha 1\nLinha 2\nLinha 3';
  const newContent = 'Este é o conteúdo atualizado do arquivo.\nLinha 1 (atualizada)\nLinha 2\nLinha 3\nLinha 4 (nova)';
  
  await fs.writeFile('old.txt', oldContent);
  await fs.writeFile('new.txt', newContent);
  
  console.log('✅ Arquivos de teste criados!');
}

async function main() {
  console.log('🚀 Advanced Patch Generator - Exemplo para Windows');
  console.log('================================================\n');

  try {
    // Cria arquivos de teste
    await createTestFiles();

    // Configuração específica para Windows
    const patchGen = new AdvancedPatchGenerator({
      // Configurações básicas
      compression: 6,
      verify: true,
      showProgress: true,
      
      // Configurações específicas para Windows
      xdeltaPath: 'xdelta3.exe', // Será detectado automaticamente
      
      // Callbacks para feedback
      onProgress: (progress) => {
        console.log(`📊 ${progress.percentage}% - ${progress.message}`);
      },
      onError: (error) => {
        console.error(`❌ Erro: ${error.message}`);
      },
      onComplete: (result) => {
        console.log(`✅ Operação concluída: ${result.success ? 'Sucesso' : 'Falha'}`);
      }
    });

    // Verifica se o Xdelta3 está disponível
    console.log('\n🔍 Verificando disponibilidade do Xdelta3...');
    const isAvailable = await patchGen.checkXdelta();
    
    if (!isAvailable) {
      console.log('❌ Xdelta3 não encontrado!');
      console.log('💡 Execute: npm run install:xdelta3');
      return;
    }

    console.log('✅ Xdelta3 está disponível!\n');

    // Cria um patch
    console.log('📦 Criando patch...');
    const createResult = await patchGen.createPatch(
      'old.txt',
      'new.txt',
      'patch.xdelta'
    );

    if (createResult.success) {
      console.log('✅ Patch criado com sucesso!');
      console.log(`📏 Tamanho do patch: ${createResult.patchFile.sizeFormatted}`);
      console.log(`⏱️  Duração: ${createResult.metrics.durationFormatted}`);
      console.log(`📊 Compressão: ${createResult.metrics.compressionRatio}%`);
    } else {
      console.log('❌ Erro ao criar patch:', createResult.error);
      return;
    }

    // Aplica o patch
    console.log('\n🔧 Aplicando patch...');
    const applyResult = await patchGen.applyPatch(
      'old.txt',
      'patch.xdelta',
      'applied.txt'
    );

    if (applyResult.success) {
      console.log('✅ Patch aplicado com sucesso!');
      console.log(`📏 Tamanho do arquivo aplicado: ${applyResult.newFile.sizeFormatted}`);
      console.log(`⏱️  Duração: ${applyResult.metrics.durationFormatted}`);
    } else {
      console.log('❌ Erro ao aplicar patch:', applyResult.error);
      return;
    }

    // Verifica a integridade
    console.log('\n🔍 Verificando integridade do patch...');
    const verifyResult = await patchGen.verifyPatch(
      'old.txt',
      'patch.xdelta',
      'new.txt'
    );

    if (verifyResult.isValid) {
      console.log('✅ Patch é válido!');
    } else {
      console.log('❌ Patch é inválido!');
    }

    // Compara os arquivos
    console.log('\n📋 Comparando arquivos...');
    const originalContent = await fs.readFile('new.txt', 'utf8');
    const appliedContent = await fs.readFile('applied.txt', 'utf8');
    
    if (originalContent === appliedContent) {
      console.log('✅ Arquivos são idênticos!');
    } else {
      console.log('❌ Arquivos são diferentes!');
    }

    // Limpa arquivos temporários
    console.log('\n🧹 Limpando arquivos temporários...');
    const filesToClean = ['old.txt', 'new.txt', 'patch.xdelta', 'applied.txt'];
    for (const file of filesToClean) {
      if (await fs.pathExists(file)) {
        await fs.remove(file);
      }
    }
    console.log('✅ Limpeza concluída!');

  } catch (error) {
    console.error('❌ Erro durante a execução:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Executa o exemplo
main().catch(console.error);
