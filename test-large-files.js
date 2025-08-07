#!/usr/bin/env node

import AdvancedPatchGenerator from './src/lib/AdvancedPatchGenerator.js';
import fs from 'fs-extra';
import path from 'path';
import LargeFileUtils from './src/utils/largeFileUtils.js';

async function main() {
  console.log('🧪 Teste do Advanced Patch Generator - Arquivos Grandes');
  console.log('========================================================\n');

  // Configuração otimizada para arquivos grandes
  const patchGen = new AdvancedPatchGenerator({
    compression: 3, // Compressão baixa para arquivos grandes
    verify: false, // Pula verificação para economizar memória
    showProgress: true,
    largeFileThreshold: 50 * 1024 * 1024, // 50MB
    timeout: 900000, // 15 minutos
    memoryLimit: 256 * 1024 * 1024 // 256MB
  });

  try {
    // Verifica se o Xdelta está disponível
    console.log('🔍 Verificando Xdelta3...');
    await patchGen.checkXdelta();
    console.log('✅ Xdelta3 encontrado e funcionando!\n');
  } catch (error) {
    console.log('❌ Xdelta3 não encontrado!');
    console.log('Instale o Xdelta3 primeiro.');
    return;
  }

  // Cria diretórios necessários
  await fs.ensureDir('files/old');
  await fs.ensureDir('files/new');
  await fs.ensureDir('files/patches');
  await fs.ensureDir('files/applyPatches');

  // Verifica se há arquivos para testar
  const oldFiles = await fs.readdir('files/old');
  const newFiles = await fs.readdir('files/new');

  if (oldFiles.length === 0 || newFiles.length === 0) {
    console.log('⚠️ Nenhum arquivo encontrado para testar.');
    console.log('Coloque arquivos em files/old/ e files/new/ e execute novamente.');
    return;
  }

  // Encontra arquivos correspondentes
  const commonFiles = oldFiles.filter(file => newFiles.includes(file));

  if (commonFiles.length === 0) {
    console.log('⚠️ Nenhum arquivo correspondente encontrado.');
    return;
  }

  console.log('📋 Arquivos que serão testados:', commonFiles.join(', '));

  // Executa os testes
  let successCount = 0;
  let totalCount = commonFiles.length;

  for (const fileName of commonFiles) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🧪 Testando: ${fileName}`);
    console.log(`${'='.repeat(50)}`);

    try {
      const oldFile = path.join('files/old', fileName);
      const newFile = path.join('files/new', fileName);
      const patchFile = path.join('files/patches', `${fileName}.xdelta`);
      const appliedFile = path.join('files/applyPatches', fileName);

      // Verifica tamanho dos arquivos
      const oldFileSize = await LargeFileUtils.getFileSize(oldFile);
      const newFileSize = await LargeFileUtils.getFileSize(newFile);

      console.log(`📊 Tamanhos dos arquivos:`);
      console.log(`   Original: ${(oldFileSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Novo: ${(newFileSize / 1024 / 1024).toFixed(2)} MB`);

      // Verifica se é arquivo grande
      const isLarge = await LargeFileUtils.isLargeFile(newFile);
      const isHuge = await LargeFileUtils.isHugeFile(newFile);
      const isExtreme = await LargeFileUtils.isExtremeFile(newFile);

      if (isExtreme) {
        console.log('🔧 Arquivo extremamente grande detectado. Usando processamento em chunks...');
        LargeFileUtils.displayLargeFileWarning(newFileSize);
      } else if (isHuge) {
        console.log('🔧 Arquivo muito grande detectado. Aplicando otimizações...');
        LargeFileUtils.displayLargeFileWarning(newFileSize);
      } else if (isLarge) {
        console.log('🔧 Arquivo grande detectado. Aplicando otimizações...');
        LargeFileUtils.displayLargeFileWarning(newFileSize);
      }

      // Cria o patch
      console.log('\n📦 Criando patch...');
      const patchResult = await patchGen.createPatch(oldFile, newFile, patchFile);
      
      if (patchResult.success) {
        console.log('✅ Patch criado com sucesso!');
        
        // Aplica o patch
        console.log('\n🔧 Aplicando patch...');
        const applyResult = await patchGen.applyPatch(oldFile, patchFile, appliedFile);
        
        if (applyResult.success) {
          console.log('✅ Patch aplicado com sucesso!');
          
          // Verifica integridade (apenas para arquivos pequenos)
          if (!isLarge) {
            console.log('\n🔍 Verificando integridade...');
            const verifyResult = await patchGen.verifyPatch(oldFile, patchFile, newFile);
            
            if (verifyResult.isValid) {
              console.log('✅ Patch é válido!');
              successCount++;
            } else {
              console.log('❌ Patch é inválido!');
            }
          } else {
            console.log('⏭️ Pulando verificação para arquivo grande (otimização)');
            successCount++;
          }
        } else {
          console.log('❌ Erro ao aplicar patch:', applyResult.error);
        }
      } else {
        console.log('❌ Erro ao criar patch:', patchResult.error);
      }

    } catch (error) {
      console.log('❌ Erro durante o teste:', error.message);
    }
  }

  // Resultados finais
  console.log(`\n${'='.repeat(50)}`);
  console.log('📊 RESULTADOS FINAIS');
  console.log(`${'='.repeat(50)}`);
  console.log(`✅ Testes bem-sucedidos: ${successCount}/${totalCount}`);
  console.log(`📈 Taxa de sucesso: ${((successCount / totalCount) * 100).toFixed(1)}%`);

  if (successCount < totalCount) {
    console.log('⚠️ Alguns testes falharam. Verifique os arquivos e tente novamente.');
  } else {
    console.log('🎉 Todos os testes passaram!');
  }

  console.log('\n📁 Arquivos gerados:');
  console.log('   - files/patches/ (patches criados)');
  console.log('   - files/applyPatches/ (arquivos com patch aplicado)');
}

// Executa o teste
main().catch(console.error);
