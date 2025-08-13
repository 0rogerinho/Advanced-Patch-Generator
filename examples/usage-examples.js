#!/usr/bin/env node

import AdvancedPatchGenerator from '../src/lib/AdvancedPatchGenerator.js';
import fs from 'fs-extra';
import path from 'path';

/**
 * Exemplos de uso do Advanced Patch Generator
 * Demonstra como usar a biblioteca com progresso, eventos e tratamento de erros
 */

// Exemplo 1: Uso básico com callbacks
async function exemploBasico() {
  console.log('🔧 Exemplo 1: Uso básico com callbacks');
  console.log('========================================\n');

  const patchGen = new AdvancedPatchGenerator({
    compression: 6,
    verify: true,
    showProgress: true,
    // Callbacks para progresso, erro e conclusão
    onProgress: (progress) => {
      console.log(`📊 Progresso: ${progress.percentage}% - ${progress.message}`);
    },
    onError: (error) => {
      console.error(`❌ Erro: ${error.message}`);
    },
    onComplete: (result) => {
      console.log(`✅ Concluído! Patch criado: ${result.patchFile.sizeFormatted}`);
    }
  });

  try {
    // Verifica se o Xdelta está disponível
    await patchGen.checkXdelta();
    
    // Cria um patch
    const result = await patchGen.createPatch(
      'files/old/exemplo.txt',
      'files/new/exemplo.txt',
      'files/patches/exemplo.xdelta'
    );

    if (result.success) {
      console.log('\n📦 Patch criado com sucesso!');
      console.log(`   Tamanho original: ${result.oldFile.sizeFormatted}`);
      console.log(`   Tamanho novo: ${result.newFile.sizeFormatted}`);
      console.log(`   Tamanho patch: ${result.patchFile.sizeFormatted}`);
      console.log(`   Duração: ${result.metrics.durationFormatted}`);
    }
  } catch (error) {
    console.error('Erro no exemplo básico:', error.message);
  }
}

// Exemplo 2: Uso com eventos
async function exemploComEventos() {
  console.log('\n🎯 Exemplo 2: Uso com eventos');
  console.log('===============================\n');

  const patchGen = new AdvancedPatchGenerator({
    compression: 9,
    verify: true,
    showProgress: false // Desabilita progresso padrão para usar eventos
  });

  // Escuta eventos de progresso
  patchGen.on('progress', (data) => {
    const bar = '█'.repeat(Math.floor(data.percentage / 5)) + '░'.repeat(20 - Math.floor(data.percentage / 5));
    process.stdout.write(`\r📊 [${bar}] ${data.percentage}% - ${data.message}`);
  });

  // Escuta eventos de erro
  patchGen.on('error', (error) => {
    console.error(`\n❌ Erro: ${error.message}`);
  });

  // Escuta eventos de conclusão
  patchGen.on('complete', (result) => {
    console.log(`\n✅ Operação concluída!`);
    console.log(`   Arquivo: ${path.basename(result.patchFile.path)}`);
    console.log(`   Tamanho: ${result.patchFile.sizeFormatted}`);
  });

  try {
    await patchGen.checkXdelta();
    
    const result = await patchGen.createPatch(
      'files/old/exemplo.txt',
      'files/new/exemplo.txt',
      'files/patches/exemplo_eventos.xdelta'
    );

    if (result.success) {
      console.log('\n🎉 Patch criado com eventos!');
    }
  } catch (error) {
    console.error('Erro no exemplo com eventos:', error.message);
  }
}

// Exemplo 3: Aplicação de patch
async function exemploAplicarPatch() {
  console.log('\n🔧 Exemplo 3: Aplicação de patch');
  console.log('==================================\n');

  const patchGen = new AdvancedPatchGenerator({
    compression: 6,
    verify: true,
    showProgress: true
  });

  try {
    await patchGen.checkXdelta();
    
    // Aplica o patch
    const result = await patchGen.applyPatch(
      'files/old/exemplo.txt',
      'files/patches/exemplo.xdelta',
      'files/applyPatches/exemplo_aplicado.txt'
    );

    if (result.success) {
      console.log('✅ Patch aplicado com sucesso!');
      console.log(`   Arquivo original: ${result.oldFile.sizeFormatted}`);
      console.log(`   Patch: ${result.patchFile.sizeFormatted}`);
      console.log(`   Arquivo aplicado: ${result.newFile.sizeFormatted}`);
    }
  } catch (error) {
    console.error('Erro ao aplicar patch:', error.message);
  }
}

// Exemplo 4: Verificação de patch
async function exemploVerificarPatch() {
  console.log('\n🔍 Exemplo 4: Verificação de patch');
  console.log('====================================\n');

  const patchGen = new AdvancedPatchGenerator({
    compression: 6,
    verify: true,
    showProgress: true
  });

  try {
    await patchGen.checkXdelta();
    
    // Verifica a integridade do patch
    const result = await patchGen.verifyPatch(
      'files/old/exemplo.txt',
      'files/patches/exemplo.xdelta',
      'files/new/exemplo.txt'
    );

    if (result.isValid) {
      console.log('✅ Patch é válido!');
      console.log(`   Tamanho original: ${result.originalSize} bytes`);
      console.log(`   Tamanho após patch: ${result.patchedSize} bytes`);
    } else {
      console.log('❌ Patch é inválido!');
    }
  } catch (error) {
    console.error('Erro ao verificar patch:', error.message);
  }
}

// Exemplo 5: Processamento em lote
async function exemploProcessamentoLote() {
  console.log('\n📦 Exemplo 5: Processamento em lote');
  console.log('=====================================\n');

  const patchGen = new AdvancedPatchGenerator({
    compression: 6,
    verify: true,
    showProgress: true
  });

  try {
    await patchGen.checkXdelta();
    
    // Cria patches em lote
    const results = await patchGen.createBatchPatches(
      'files/old',
      'files/new',
      'files/patches/batch'
    );

    console.log(`✅ Processamento em lote concluído!`);
    console.log(`   Total de arquivos: ${results.length}`);
    
    const successCount = results.filter(r => r.status === 'success').length;
    console.log(`   Sucessos: ${successCount}`);
    console.log(`   Falhas: ${results.length - successCount}`);
  } catch (error) {
    console.error('Erro no processamento em lote:', error.message);
  }
}

// Exemplo 6: Arquivos grandes
async function exemploArquivosGrandes() {
  console.log('\n🐘 Exemplo 6: Arquivos grandes');
  console.log('===============================\n');

  const patchGen = new AdvancedPatchGenerator({
    compression: 3, // Compressão menor para arquivos grandes
    verify: true,
    showProgress: true,
    largeFileThreshold: 100 * 1024 * 1024, // 100MB
    timeout: 600000, // 10 minutos
    memoryLimit: 1000 * 1024 * 1024 // 1GB
  });

  try {
    await patchGen.checkXdelta();
    
    const result = await patchGen.createPatch(
      'files/old/arquivo_grande.bin',
      'files/new/arquivo_grande.bin',
      'files/patches/arquivo_grande.xdelta'
    );

    if (result.success) {
      console.log('✅ Patch para arquivo grande criado!');
      console.log(`   Método: ${result.metrics.isLargeFile ? 'Chunked' : 'Standard'}`);
      console.log(`   Duração: ${result.metrics.durationFormatted}`);
      console.log(`   Compressão: ${result.metrics.compressionRatio}%`);
    }
  } catch (error) {
    console.error('Erro com arquivo grande:', error.message);
  }
}

// Exemplo 7: Tratamento de erros avançado
async function exemploTratamentoErros() {
  console.log('\n🛡️ Exemplo 7: Tratamento de erros avançado');
  console.log('============================================\n');

  const patchGen = new AdvancedPatchGenerator({
    compression: 6,
    verify: true,
    showProgress: true,
    onError: (error) => {
      console.error(`❌ Erro capturado: ${error.message}`);
      
      // Tratamento específico por tipo de erro
      if (error.message.includes('Xdelta3')) {
        console.log('💡 Dica: Instale o Xdelta3 primeiro');
      } else if (error.message.includes('não encontrado')) {
        console.log('💡 Dica: Verifique se os arquivos existem');
      } else if (error.message.includes('timeout')) {
        console.log('💡 Dica: Aumente o timeout para arquivos grandes');
      }
    }
  });

  try {
    // Tenta criar patch com arquivo inexistente
    const result = await patchGen.createPatch(
      'arquivo_inexistente.txt',
      'files/new/exemplo.txt',
      'files/patches/erro.xdelta'
    );

    if (!result.success) {
      console.log('✅ Erro tratado corretamente!');
    }
  } catch (error) {
    console.log('✅ Exceção capturada:', error.message);
  }
}

// Exemplo de barra de progresso visual
async function createPatchWithProgressBar() {
  console.log('\n🎯 Criando patch com barra de progresso visual...\n');
  
  const patchGen = new AdvancedPatchGenerator({
    compression: 6,
    verify: true,
    showProgress: true,
    onProgress: (data) => {
      // Cria uma barra de progresso visual
      const barLength = 30;
      const filledLength = Math.round((data.percentage / 100) * barLength);
      const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
      
      // Mostra informações detalhadas
      let progressInfo = `${data.percentage.toString().padStart(3)}% [${bar}] ${data.message}`;
      
      if (data.current !== undefined && data.total !== undefined) {
        const currentMB = (data.current / (1024 * 1024)).toFixed(2);
        const totalMB = (data.total / (1024 * 1024)).toFixed(2);
        progressInfo += ` (${currentMB}MB / ${totalMB}MB)`;
      }
      
      // Limpa a linha anterior e mostra o novo progresso
      process.stdout.write(`\r${progressInfo}`);
      
      if (data.percentage === 100) {
        console.log('\n'); // Nova linha quando completar
      }
    },
    onComplete: (result) => {
      console.log(`\n✅ Patch criado com sucesso!`);
      console.log(`   Arquivo: ${result.patchFile.path}`);
      console.log(`   Tamanho: ${result.patchFile.sizeFormatted}`);
      console.log(`   Duração: ${result.metrics.durationFormatted}`);
    }
  });

  try {
    await patchGen.checkXdelta();
    const result = await createPatchWithProgressBar();
    return result;
  } catch (error) {
    console.error('Erro no exemplo de barra de progresso:', error.message);
    return null;
  }
}

// Função principal
async function main() {
  console.log('🚀 Advanced Patch Generator - Exemplos de Uso');
  console.log('==============================================\n');

  // Cria diretórios necessários
  await fs.ensureDir('files/old');
  await fs.ensureDir('files/new');
  await fs.ensureDir('files/patches');
  await fs.ensureDir('files/applyPatches');

  // Cria arquivos de exemplo se não existirem
  if (!await fs.pathExists('files/old/exemplo.txt')) {
    await fs.writeFile('files/old/exemplo.txt', 'Conteúdo original do arquivo\nLinha 2\nLinha 3');
  }
  
  if (!await fs.pathExists('files/new/exemplo.txt')) {
    await fs.writeFile('files/new/exemplo.txt', 'Conteúdo atualizado do arquivo\nLinha 2 modificada\nLinha 3\nNova linha 4');
  }

  // Executa exemplos
  await exemploBasico();
  await exemploComEventos();
  await exemploAplicarPatch();
  await exemploVerificarPatch();
  await exemploProcessamentoLote();
  await exemploArquivosGrandes();
  await exemploTratamentoErros();
  await createPatchWithProgressBar(); // Adicionado o novo exemplo

  console.log('\n🎉 Todos os exemplos concluídos!');
  console.log('📚 Consulte a documentação para mais informações.');
}

// Executa se for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export {
  exemploBasico,
  exemploComEventos,
  exemploAplicarPatch,
  exemploVerificarPatch,
  exemploProcessamentoLote,
  exemploArquivosGrandes,
  exemploTratamentoErros
};
