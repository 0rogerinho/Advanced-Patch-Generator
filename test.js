#!/usr/bin/env node

import AdvancedPatchGenerator from './src/index.js';
import fs from 'fs-extra';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('🧪 Teste do Advanced Patch Generator');
  console.log('=====================================\n');

  const patchGen = new AdvancedPatchGenerator({
    compression: 6,
    verify: true,
    showProgress: true
  });

  try {
    // Verifica se o Xdelta está disponível
    console.log('🔍 Verificando Xdelta3...');
    await patchGen.checkXdelta();
    console.log('✅ Xdelta3 encontrado e funcionando!\n');
  } catch (error) {
    console.log('❌ Xdelta3 não encontrado!');
    console.log('\n📋 Para instalar o Xdelta3 no Windows:');
    console.log('1. Acesse: https://github.com/jmacd/xdelta/releases');
    console.log('2. Baixe a versão mais recente para Windows');
    console.log('3. Extraia o arquivo xdelta3.exe');
    console.log('4. Coloque o xdelta3.exe em uma pasta no PATH');
    console.log('   (ex: C:\\Windows\\System32\\ ou adicione ao PATH do sistema)');
    console.log('\n💡 Alternativas:');
    console.log('   - Use o Scoop: scoop install xdelta3');
    console.log('   - Use o Chocolatey: choco install xdelta3');
    console.log('   - Use o Winget: winget install xdelta3');
    rl.close();
    return;
  }

  // Cria diretórios necessários
  await fs.ensureDir('files/old');
  await fs.ensureDir('files/new');
  await fs.ensureDir('files/patches');
  await fs.ensureDir('files/applyPatches');

  console.log('📁 Diretórios criados:');
  console.log('   - files/old/ (arquivos originais)');
  console.log('   - files/new/ (arquivos atualizados)');
  console.log('   - files/patches/ (patches gerados)');
  console.log('   - files/applyPatches/ (arquivos com patch aplicado)');

  console.log('\n📝 Para testar:');
  console.log('1. Coloque um arquivo em files/old/');
  console.log('2. Coloque a versão atualizada em files/new/');
  console.log('3. Execute este teste novamente');

  // Verifica se há arquivos para testar
  const oldFiles = await fs.readdir('files/old');
  const newFiles = await fs.readdir('files/new');

  if (oldFiles.length === 0 || newFiles.length === 0) {
    console.log('\n⚠️ Nenhum arquivo encontrado para testar.');
    console.log('Coloque arquivos em files/old/ e files/new/ e execute novamente.');
    rl.close();
    return;
  }

  console.log('\n📋 Arquivos encontrados:');
  console.log('Arquivos em files/old/:', oldFiles.join(', '));
  console.log('Arquivos em files/new/:', newFiles.join(', '));

  // Encontra arquivos correspondentes
  const commonFiles = oldFiles.filter(file => newFiles.includes(file));

  if (commonFiles.length === 0) {
    console.log('\n⚠️ Nenhum arquivo correspondente encontrado.');
    console.log('Certifique-se de que os nomes dos arquivos sejam iguais em ambas as pastas.');
    rl.close();
    return;
  }

  console.log('\n🔄 Arquivos que serão testados:', commonFiles.join(', '));

  // Executa os testes
  let successCount = 0;
  let totalCount = commonFiles.length;

  for (const fileName of commonFiles) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🧪 Testando: ${fileName}`);
    console.log(`${'='.repeat(50)}`);

    const oldFile = path.join('files/old', fileName);
    const newFile = path.join('files/new', fileName);
    const patchFile = path.join('files/patches', `${fileName}.xdelta`);
    const appliedFile = path.join('files/applyPatches', fileName);

    try {
      // Teste 1: Criar patch
      console.log('\n📦 Criando patch...');
      const patchResult = await patchGen.createPatch(oldFile, newFile, patchFile);
      
      if (patchResult.success) {
        console.log('✅ Patch criado com sucesso!');
        
        // Teste 2: Aplicar patch
        console.log('\n🔧 Aplicando patch...');
        const applyResult = await patchGen.applyPatch(oldFile, patchFile, appliedFile);
        
        if (applyResult.success) {
          console.log('✅ Patch aplicado com sucesso!');
          
          // Teste 3: Verificar integridade
          console.log('\n🔍 Verificando integridade...');
          const verification = await patchGen.verifyPatch(oldFile, patchFile, newFile);
          
          if (verification.isValid) {
            console.log('✅ Patch é válido!');
            successCount++;
          } else {
            console.log('❌ Patch é inválido!');
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

  if (successCount === totalCount) {
    console.log('\n🎉 Todos os testes passaram! O sistema está funcionando perfeitamente.');
  } else if (successCount > 0) {
    console.log('\n⚠️ Alguns testes falharam. Verifique os arquivos e tente novamente.');
  } else {
    console.log('\n❌ Todos os testes falharam. Verifique a instalação do Xdelta3.');
  }

  console.log('\n📁 Arquivos gerados:');
  console.log('   - files/patches/ (patches criados)');
  console.log('   - files/applyPatches/ (arquivos com patch aplicado)');

  rl.close();
}

main().catch(console.error);
