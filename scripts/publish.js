#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

/**
 * Script de publicação automatizada para NPM
 * Suporta patch, minor e major versioning
 */

const VERSION_TYPES = {
  patch: 'patch',
  minor: 'minor', 
  major: 'major'
};

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : '📦';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function runCommand(command, options = {}) {
  try {
    const result = execSync(command, { 
      encoding: 'utf8', 
      stdio: 'pipe',
      ...options 
    });
    return { success: true, output: result };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      output: error.stdout?.toString() || '',
      stderr: error.stderr?.toString() || ''
    };
  }
}

function validatePrerequisites() {
  log('Verificando pré-requisitos...');
  
  // Verifica se está no diretório correto
  if (!fs.existsSync('package.json')) {
    log('❌ package.json não encontrado. Execute este script na raiz do projeto.', 'error');
    process.exit(1);
  }
  
  // Verifica se o git está disponível
  const gitResult = runCommand('git --version');
  if (!gitResult.success) {
    log('❌ Git não encontrado. Instale o Git primeiro.', 'error');
    process.exit(1);
  }
  
  // Verifica se o npm está disponível
  const npmResult = runCommand('npm --version');
  if (!npmResult.success) {
    log('❌ NPM não encontrado. Instale o Node.js primeiro.', 'error');
    process.exit(1);
  }
  
  log('✅ Pré-requisitos verificados');
}

function checkGitStatus() {
  log('Verificando status do Git...');
  
  // Verifica se há mudanças não commitadas
  const statusResult = runCommand('git status --porcelain');
  if (statusResult.success && statusResult.output.trim()) {
    log('⚠️  Há mudanças não commitadas. Deseja continuar? (y/N)', 'warning');
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question('', (answer) => {
      rl.close();
      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        log('Publicação cancelada.', 'error');
        process.exit(0);
      }
      proceedWithPublish();
    });
  } else {
    proceedWithPublish();
  }
}

function proceedWithPublish() {
  const versionType = process.argv[2];
  
  if (!versionType || !VERSION_TYPES[versionType]) {
    log('❌ Tipo de versão inválido. Use: patch, minor ou major', 'error');
    log('Exemplo: node scripts/publish.js patch', 'info');
    process.exit(1);
  }
  
  log(`Iniciando publicação com versão ${versionType}...`);
  
  try {
    // Executa testes
    log('Executando testes...');
    const testResult = runCommand('npm test');
    if (!testResult.success) {
      log('❌ Testes falharam. Corrija os problemas antes de publicar.', 'error');
      console.log(testResult.stderr);
      process.exit(1);
    }
    log('✅ Testes passaram');
    
    // Executa lint
    log('Executando lint...');
    const lintResult = runCommand('npm run lint');
    if (!lintResult.success) {
      log('❌ Lint falhou. Corrija os problemas antes de publicar.', 'error');
      console.log(lintResult.stderr);
      process.exit(1);
    }
    log('✅ Lint passou');
    
    // Atualiza versão
    log(`Atualizando versão (${versionType})...`);
    const versionResult = runCommand(`npm version ${versionType} --no-git-tag-version`);
    if (!versionResult.success) {
      log('❌ Falha ao atualizar versão.', 'error');
      console.log(versionResult.stderr);
      process.exit(1);
    }
    
    // Extrai nova versão do output
    const versionMatch = versionResult.output.match(/v(\d+\.\d+\.\d+)/);
    const newVersion = versionMatch ? versionMatch[1] : 'unknown';
    log(`✅ Versão atualizada para ${newVersion}`);
    
    // Commit das mudanças
    log('Fazendo commit das mudanças...');
    const commitResult = runCommand(`git add . && git commit -m "chore: bump version to ${newVersion}"`);
    if (!commitResult.success) {
      log('❌ Falha ao fazer commit.', 'error');
      console.log(commitResult.stderr);
      process.exit(1);
    }
    log('✅ Commit realizado');
    
    // Cria tag
    log('Criando tag...');
    const tagResult = runCommand(`git tag v${newVersion}`);
    if (!tagResult.success) {
      log('❌ Falha ao criar tag.', 'error');
      console.log(tagResult.stderr);
      process.exit(1);
    }
    log('✅ Tag criada');
    
    // Publica no NPM
    log('Publicando no NPM...');
    const publishResult = runCommand('npm publish');
    if (!publishResult.success) {
      log('❌ Falha ao publicar no NPM.', 'error');
      console.log(publishResult.stderr);
      process.exit(1);
    }
    log('✅ Publicado no NPM');
    
    // Push para o repositório
    log('Fazendo push para o repositório...');
    const pushResult = runCommand('git push && git push --tags');
    if (!pushResult.success) {
      log('❌ Falha ao fazer push.', 'error');
      console.log(pushResult.stderr);
      process.exit(1);
    }
    log('✅ Push realizado');
    
    // Sucesso!
    log(`🎉 Publicação concluída com sucesso!`, 'success');
    log(`📦 Versão: ${newVersion}`, 'success');
    log(`🌐 NPM: https://www.npmjs.com/package/advanced-patch-generator`, 'success');
    log(`🏷️  Tag: v${newVersion}`, 'success');
    
    // Mostra informações úteis
    console.log('\n📋 Próximos passos:');
    console.log('   - Verifique a publicação em: https://www.npmjs.com/package/advanced-patch-generator');
    console.log('   - Atualize a documentação se necessário');
    console.log('   - Crie um release no GitHub');
    console.log('   - Anuncie a nova versão para a comunidade');
    
  } catch (error) {
    log(`❌ Erro durante a publicação: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Função principal
function main() {
  console.log('🚀 Advanced Patch Generator - Script de Publicação');
  console.log('==================================================\n');
  
  validatePrerequisites();
  checkGitStatus();
}

// Executa se for chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as publish };
