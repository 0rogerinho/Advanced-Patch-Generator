#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

/**
 * Script para automatizar a publicação no NPM
 */

async function checkGitStatus() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
      console.log('❌ Existem mudanças não commitadas. Faça commit antes de publicar.');
      process.exit(1);
    }
  } catch (error) {
    console.log('❌ Erro ao verificar status do Git:', error.message);
    process.exit(1);
  }
}

async function runTests() {
  try {
    console.log('🧪 Executando testes...');
    execSync('npm test', { stdio: 'inherit' });
    console.log('✅ Testes passaram!');
  } catch (error) {
    console.log('❌ Testes falharam. Corrija os problemas antes de publicar.');
    process.exit(1);
  }
}

async function runLint() {
  try {
    console.log('🔍 Executando linting...');
    execSync('npm run lint', { stdio: 'inherit' });
    console.log('✅ Linting passou!');
  } catch (error) {
    console.log('❌ Linting falhou. Corrija os problemas antes de publicar.');
    process.exit(1);
  }
}

async function buildDocs() {
  try {
    console.log('📚 Gerando documentação...');
    execSync('npm run docs', { stdio: 'inherit' });
    console.log('✅ Documentação gerada!');
  } catch (error) {
    console.log('❌ Erro ao gerar documentação:', error.message);
    process.exit(1);
  }
}

async function updateVersion(version) {
  try {
    console.log(`📦 Atualizando versão para ${version}...`);
    execSync(`npm version ${version} --no-git-tag-version`, { stdio: 'inherit' });
    console.log('✅ Versão atualizada!');
  } catch (error) {
    console.log('❌ Erro ao atualizar versão:', error.message);
    process.exit(1);
  }
}

async function publish() {
  try {
    console.log('🚀 Publicando no NPM...');
    execSync('npm publish', { stdio: 'inherit' });
    console.log('✅ Publicado com sucesso!');
  } catch (error) {
    console.log('❌ Erro ao publicar:', error.message);
    process.exit(1);
  }
}

async function createGitTag(version) {
  try {
    console.log('🏷️ Criando tag do Git...');
    execSync(`git tag v${version}`, { stdio: 'inherit' });
    execSync('git push --tags', { stdio: 'inherit' });
    console.log('✅ Tag criada e enviada!');
  } catch (error) {
    console.log('❌ Erro ao criar tag:', error.message);
    process.exit(1);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const version = args[0];

  if (!version) {
    console.log('❌ Uso: node scripts/publish.js <version>');
    console.log('Exemplo: node scripts/publish.js 1.0.1');
    process.exit(1);
  }

  console.log('🚀 Iniciando processo de publicação...');
  console.log(`📦 Versão: ${version}`);
  console.log('');

  // Verificações pré-publicação
  await checkGitStatus();
  await runTests();
  await runLint();
  await buildDocs();

  // Atualizar versão
  await updateVersion(version);

  // Publicar
  await publish();

  // Criar tag
  await createGitTag(version);

  console.log('');
  console.log('🎉 Publicação concluída com sucesso!');
  console.log(`📦 Versão ${version} publicada no NPM`);
  console.log('🏷️ Tag do Git criada');
}

main().catch(console.error);
