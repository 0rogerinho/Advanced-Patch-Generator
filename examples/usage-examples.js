#!/usr/bin/env node

/**
 * Exemplos de uso da nova estrutura organizada
 * 
 * Este arquivo demonstra como usar os diferentes módulos
 * do Advanced Patch Generator de forma organizada.
 */

import AdvancedPatchGenerator from '../src/index.js';
import { MetricsUtils, DisplayUtils } from '../src/utils/index.js';
import { FileValidation } from '../src/validations/index.js';
import { DEFAULT_OPTIONS, COMPRESSION_LEVELS } from '../src/constants/index.js';

console.log('🧪 Exemplos de Uso - Estrutura Organizada');
console.log('==========================================\n');

// Exemplo 1: Uso básico da classe principal
async function exemploBasico() {
  console.log('📝 Exemplo 1: Uso Básico');
  console.log('-'.repeat(40));
  
  const patchGen = new AdvancedPatchGenerator({
    compression: 6,
    verify: true,
    showProgress: false // Desabilita progresso para este exemplo
  });
  
  console.log('✅ Instância criada com sucesso!');
  console.log(`📊 Configurações:`, patchGen.defaultOptions);
  console.log('');
}

// Exemplo 2: Uso dos utilitários de métricas
function exemploMetricas() {
  console.log('📊 Exemplo 2: Utilitários de Métricas');
  console.log('-'.repeat(40));
  
  const bytes = 1048576; // 1MB
  const tempo = 1500; // 1.5 segundos
  
  console.log(`📏 Bytes formatados: ${MetricsUtils.formatBytes(bytes)}`);
  console.log(`⏱️  Tempo formatado: ${MetricsUtils.formatTime(tempo)}`);
  console.log(`📈 Taxa de compressão: ${MetricsUtils.calculateCompressionRatio(1000, 500)}%`);
  console.log(`📊 Barra de progresso: ${MetricsUtils.createProgressBar(75)}`);
  console.log('');
}

// Exemplo 3: Uso das validações
async function exemploValidacoes() {
  console.log('🔍 Exemplo 3: Validações');
  console.log('-'.repeat(40));
  
  // Validação de nível de compressão
  const nivelValido = FileValidation.isValidCompressionLevel(5);
  const nivelInvalido = FileValidation.isValidCompressionLevel(15);
  
  console.log(`✅ Nível 5 válido: ${nivelValido}`);
  console.log(`❌ Nível 15 válido: ${nivelInvalido}`);
  
  // Validação de caminho do Xdelta
  const caminhoValido = FileValidation.isValidXdeltaPath('xdelta3.exe');
  const caminhoInvalido = FileValidation.isValidXdeltaPath('');
  
  console.log(`✅ Caminho válido: ${caminhoValido}`);
  console.log(`❌ Caminho inválido: ${caminhoInvalido}`);
  console.log('');
}

// Exemplo 4: Uso das constantes
function exemploConstantes() {
  console.log('⚙️  Exemplo 4: Constantes');
  console.log('-'.repeat(40));
  
  console.log('📋 Configurações padrão:', DEFAULT_OPTIONS);
  console.log('📊 Níveis de compressão:', COMPRESSION_LEVELS);
  console.log('');
}

// Exemplo 5: Uso dos utilitários de exibição
function exemploExibicao() {
  console.log('🎨 Exemplo 5: Utilitários de Exibição');
  console.log('-'.repeat(40));
  
  // Simula informações de arquivo
  const fileInfo = {
    exists: true,
    sizeFormatted: '1.5 MB',
    modified: new Date()
  };
  
  DisplayUtils.displayFileInfo('Arquivo de Teste', '/path/to/file.txt', fileInfo);
  
  // Simula progresso
  DisplayUtils.displayProgress('Processando arquivos', 50);
  
  // Simula erro
  DisplayUtils.displayError('Erro de Teste', 'Este é um erro de exemplo', {
    arquivo: 'test.txt',
    linha: 42
  });
  
  // Simula sucesso
  DisplayUtils.displaySuccess('Operação Concluída', 'Todas as operações foram executadas com sucesso!');
  console.log('');
}

// Exemplo 6: Importação específica de módulos
function exemploImportacaoEspecifica() {
  console.log('📦 Exemplo 6: Importação Específica');
  console.log('-'.repeat(40));
  
  console.log('✅ Importação da classe principal: AdvancedPatchGenerator');
  console.log('✅ Importação de utilitários: MetricsUtils, DisplayUtils');
  console.log('✅ Importação de validações: FileValidation');
  console.log('✅ Importação de constantes: DEFAULT_OPTIONS, COMPRESSION_LEVELS');
  console.log('');
}

// Função principal
async function main() {
  try {
    await exemploBasico();
    exemploMetricas();
    await exemploValidacoes();
    exemploConstantes();
    exemploExibicao();
    exemploImportacaoEspecifica();
    
    console.log('🎉 Todos os exemplos executados com sucesso!');
    console.log('\n💡 Benefícios da nova estrutura:');
    console.log('   ✅ Código mais organizado e modular');
    console.log('   ✅ Fácil manutenção e extensão');
    console.log('   ✅ Reutilização de componentes');
    console.log('   ✅ Melhor testabilidade');
    console.log('   ✅ Separação clara de responsabilidades');
    
  } catch (error) {
    console.error('❌ Erro durante execução dos exemplos:', error.message);
  }
}

// Executa os exemplos
main();
