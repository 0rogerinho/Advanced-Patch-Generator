#!/usr/bin/env node

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs-extra';
import path from 'path';

const execAsync = promisify(exec);

/**
 * Script para instalar o Xdelta3 no Windows
 */
async function installXdelta3() {
  console.log('🔧 Instalador do Xdelta3 para Windows');
  console.log('=====================================\n');

  // Verifica se já está instalado
  console.log('🔍 Verificando se o Xdelta3 já está instalado...');
  
  try {
    const result = await execAsync('xdelta3.exe -h');
    console.log('✅ Xdelta3 já está instalado e funcionando!');
    console.log('Versão:', result.stdout.split('\n')[0]);
    return;
  } catch (error) {
    console.log('❌ Xdelta3 não encontrado. Prosseguindo com a instalação...\n');
  }

  console.log('📋 Métodos de instalação disponíveis:');
  console.log('1. Chocolatey (recomendado)');
  console.log('2. Scoop');
  console.log('3. Winget');
  console.log('4. Download manual');
  console.log('5. Sair\n');

  const readline = await import('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt) => {
    return new Promise((resolve) => {
      rl.question(prompt, resolve);
    });
  };

  const choice = await question('Escolha um método (1-5): ');

  try {
    switch (choice.trim()) {
      case '1':
        await installWithChocolatey();
        break;
      case '2':
        await installWithScoop();
        break;
      case '3':
        await installWithWinget();
        break;
      case '4':
        await downloadManual();
        break;
      case '5':
        console.log('👋 Saindo...');
        break;
      default:
        console.log('❌ Opção inválida!');
        break;
    }
  } catch (error) {
    console.log('❌ Erro durante a instalação:', error.message);
  } finally {
    rl.close();
  }
}

async function installWithChocolatey() {
  console.log('\n🍫 Instalando com Chocolatey...');
  
  // Verifica se o Chocolatey está instalado
  try {
    await execAsync('choco --version');
  } catch (error) {
    console.log('❌ Chocolatey não está instalado.');
    console.log('📋 Para instalar o Chocolatey, execute no PowerShell como administrador:');
    console.log('Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString("https://community.chocolatey.org/install.ps1"))');
    return;
  }

  try {
    console.log('📦 Instalando xdelta3...');
    await execAsync('choco install xdelta3 -y');
    console.log('✅ Xdelta3 instalado com sucesso via Chocolatey!');
  } catch (error) {
    console.log('❌ Erro ao instalar via Chocolatey:', error.message);
  }
}

async function installWithScoop() {
  console.log('\n🥄 Instalando com Scoop...');
  
  // Verifica se o Scoop está instalado
  try {
    await execAsync('scoop --version');
  } catch (error) {
    console.log('❌ Scoop não está instalado.');
    console.log('📋 Para instalar o Scoop, execute no PowerShell:');
    console.log('Set-ExecutionPolicy RemoteSigned -Scope CurrentUser');
    console.log('irm get.scoop.sh | iex');
    return;
  }

  try {
    console.log('📦 Instalando xdelta3...');
    await execAsync('scoop install xdelta3');
    console.log('✅ Xdelta3 instalado com sucesso via Scoop!');
  } catch (error) {
    console.log('❌ Erro ao instalar via Scoop:', error.message);
  }
}

async function installWithWinget() {
  console.log('\n🪶 Instalando com Winget...');
  
  try {
    console.log('📦 Instalando xdelta3...');
    await execAsync('winget install xdelta3');
    console.log('✅ Xdelta3 instalado com sucesso via Winget!');
  } catch (error) {
    console.log('❌ Erro ao instalar via Winget:', error.message);
  }
}

async function downloadManual() {
  console.log('\n📥 Download manual do Xdelta3...');
  console.log('📋 Instruções:');
  console.log('1. Acesse: https://github.com/jmacd/xdelta/releases');
  console.log('2. Baixe a versão mais recente para Windows (xdelta3-xxx-win64.zip)');
  console.log('3. Extraia o arquivo xdelta3.exe');
  console.log('4. Coloque o xdelta3.exe em uma pasta no PATH');
  console.log('   (ex: C:\\Windows\\System32\\ ou adicione ao PATH do sistema)');
  console.log('\n💡 Para adicionar ao PATH:');
  console.log('1. Abra as Configurações do Sistema');
  console.log('2. Variáveis de Ambiente');
  console.log('3. Edite a variável PATH');
  console.log('4. Adicione o caminho da pasta onde está o xdelta3.exe');
}

// Executa o script
installXdelta3().catch(console.error);
