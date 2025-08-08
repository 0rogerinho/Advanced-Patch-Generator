#!/usr/bin/env node

import AdvancedPatchGenerator from '../src/lib/AdvancedPatchGenerator.js';
import fs from 'fs-extra';

/**
 * Exemplo simples de uso do Advanced Patch Generator
 * Demonstra o uso básico da biblioteca
 */

async function exemploSimples() {
  console.log('🚀 Advanced Patch Generator - Exemplo Simples');
  console.log('=============================================\n');

  // Cria uma instância com configurações básicas
  const patchGen = new AdvancedPatchGenerator({
    compression: 6,
    verify: true,
    showProgress: true
  });

  try {
    // Verifica se o Xdelta está disponível
    console.log('🔍 Verificando Xdelta3...');
    await patchGen.checkXdelta();
    console.log('✅ Xdelta3 encontrado!\n');

    // Cria arquivos de exemplo
    await fs.ensureDir('files/old');
    await fs.ensureDir('files/new');
    await fs.ensureDir('files/patches');

    await fs.writeFile('files/old/exemplo.txt', 'Conteúdo original\nLinha 2\nLinha 3');
    await fs.writeFile('files/new/exemplo.txt', 'Conteúdo atualizado\nLinha 2 modificada\nLinha 3\nNova linha 4');

    console.log('📁 Arquivos de exemplo criados');

    // Cria um patch
    console.log('\n📦 Criando patch...');
    const result = await patchGen.createPatch(
      'files/old/exemplo.txt',
      'files/new/exemplo.txt',
      'files/patches/exemplo.xdelta'
    );

    if (result.success) {
      console.log('✅ Patch criado com sucesso!');
      console.log(`   Arquivo original: ${result.oldFile.sizeFormatted}`);
      console.log(`   Arquivo novo: ${result.newFile.sizeFormatted}`);
      console.log(`   Patch: ${result.patchFile.sizeFormatted}`);
      console.log(`   Duração: ${result.metrics.durationFormatted}`);
    } else {
      console.log('❌ Erro ao criar patch:', result.error);
      return;
    }

    // Aplica o patch
    console.log('\n🔧 Aplicando patch...');
    const applyResult = await patchGen.applyPatch(
      'files/old/exemplo.txt',
      'files/patches/exemplo.xdelta',
      'files/patches/exemplo_aplicado.txt'
    );

    if (applyResult.success) {
      console.log('✅ Patch aplicado com sucesso!');
    } else {
      console.log('❌ Erro ao aplicar patch:', applyResult.error);
      return;
    }

    // Verifica a integridade
    console.log('\n🔍 Verificando integridade...');
    const verifyResult = await patchGen.verifyPatch(
      'files/old/exemplo.txt',
      'files/patches/exemplo.xdelta',
      'files/new/exemplo.txt'
    );

    if (verifyResult.isValid) {
      console.log('✅ Patch é válido!');
    } else {
      console.log('❌ Patch é inválido!');
    }

    console.log('\n🎉 Exemplo concluído com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante o exemplo:', error.message);
  }
}

// Executa o exemplo
exemploSimples().catch(console.error);
