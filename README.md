# Advanced Patch Generator

[![npm version](https://badge.fury.io/js/advanced-patch-generator.svg)](https://badge.fury.io/js/advanced-patch-generator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js CI](https://github.com/seuusuario/advanced-patch-generator/workflows/Node.js%20CI/badge.svg)](https://github.com/seuusuario/advanced-patch-generator/actions)

Gerenciador de patch avançado usando Xdelta para criar e aplicar patches de forma eficiente. Ideal para distribuição de atualizações de software, controle de versão de arquivos binários e otimização de transferência de dados.

## 🚀 Características

- ✅ **Criação de patches** usando Xdelta3 com alta compressão
- ✅ **Aplicação de patches** com verificação automática de integridade
- ✅ **Suporte multiplataforma** (Windows, Linux, macOS)
- ✅ **Processamento em lote** para múltiplos arquivos
- ✅ **Métricas detalhadas** de compressão e performance
- ✅ **Verificação de integridade** para garantir precisão
- ✅ **Interface simples** e intuitiva
- ✅ **Documentação completa** com exemplos práticos

## 📋 Pré-requisitos

### Instalação do Xdelta3

**Windows:**
```bash
# Usando Scoop
scoop install xdelta3

# Usando Chocolatey
choco install xdelta3

# Usando Winget
winget install xdelta3

# Ou download manual
# 1. Acesse: https://github.com/jmacd/xdelta/releases
# 2. Baixe a versão mais recente para Windows
# 3. Extraia o arquivo xdelta3.exe
# 4. Coloque em uma pasta no PATH (ex: C:\Windows\System32\)
```

**Linux:**
```bash
sudo apt-get install xdelta3
# ou
sudo yum install xdelta3
```

**macOS:**
```bash
brew install xdelta3
```

## 📦 Instalação

```bash
npm install advanced-patch-generator
```

## 🧪 Uso Rápido

### Teste Inicial

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seuusuario/advanced-patch-generator.git
   cd advanced-patch-generator
   npm install
   ```

2. **Coloque seus arquivos:**
   - Arquivo original em `files/old/`
   - Arquivo atualizado em `files/new/`

3. **Execute o teste:**
   ```bash
   npm test
   ```

### Uso Programático

```javascript
import AdvancedPatchGenerator from 'advanced-patch-generator';

// Inicializar com configurações personalizadas
const patchGen = new AdvancedPatchGenerator({
  compression: 6,
  verify: true,
  showProgress: true
});

// Criar patch
const result = await patchGen.createPatch(
  'arquivo_antigo.txt',
  'arquivo_novo.txt',
  'patch.xdelta'
);

console.log(`Patch criado: ${result.patch.sizeFormatted}`);
console.log(`Taxa de compressão: ${result.compression.ratio}%`);

// Aplicar patch
await patchGen.applyPatch(
  'arquivo_antigo.txt',
  'patch.xdelta',
  'arquivo_aplicado.txt'
);

// Verificar integridade
const verification = await patchGen.verifyPatch(
  'arquivo_antigo.txt',
  'patch.xdelta',
  'arquivo_novo.txt'
);

console.log(`Patch válido: ${verification.isValid}`);
```

## 📚 API Completa

### Construtor

```javascript
new AdvancedPatchGenerator(options)
```

**Opções:**
- `xdeltaPath` (string): Caminho para o executável xdelta3
- `compression` (number): Nível de compressão (0-9, padrão: 9)
- `verify` (boolean): Verificar integridade (padrão: true)
- `showProgress` (boolean): Mostrar progresso (padrão: true)

### Métodos Principais

#### `createPatch(oldFile, newFile, patchFile, options)`

Cria um patch entre dois arquivos.

```javascript
const result = await patchGen.createPatch(
  'old/file.txt',
  'new/file.txt',
  'patch.xdelta',
  { compression: 6 }
);

// Resultado:
{
  success: true,
  patchFile: 'patch.xdelta',
  duration: 150,
  durationFormatted: '150ms',
  oldFile: { path: 'old/file.txt', size: 1024, sizeFormatted: '1 KB' },
  newFile: { path: 'new/file.txt', size: 2048, sizeFormatted: '2 KB' },
  patch: { path: 'patch.xdelta', size: 512, sizeFormatted: '512 Bytes' },
  compression: {
    ratio: '75.00',
    level: 6,
    originalSize: 2048,
    compressedSize: 512
  }
}
```

#### `applyPatch(oldFile, patchFile, newFile, options)`

Aplica um patch a um arquivo.

```javascript
const result = await patchGen.applyPatch(
  'old/file.txt',
  'patch.xdelta',
  'applied/file.txt'
);

// Resultado:
{
  success: true,
  newFile: 'applied/file.txt',
  duration: 100,
  durationFormatted: '100ms',
  oldFile: { path: 'old/file.txt', size: 1024, sizeFormatted: '1 KB' },
  patch: { path: 'patch.xdelta', size: 512, sizeFormatted: '512 Bytes' },
  appliedFile: { path: 'applied/file.txt', size: 2048, sizeFormatted: '2 KB' }
}
```

#### `verifyPatch(oldFile, patchFile, newFile)`

Verifica a integridade de um patch.

```javascript
const verification = await patchGen.verifyPatch(
  'old/file.txt',
  'patch.xdelta',
  'new/file.txt'
);

// Resultado:
{
  isValid: true,
  originalSize: 2048,
  patchedSize: 2048
}
```

#### `createBatchPatches(oldDir, newDir, patchesDir, options)`

Cria patches em lote para múltiplos arquivos.

```javascript
const patches = await patchGen.createBatchPatches(
  'files/old/',
  'files/new/',
  'files/patches/'
);

// Resultado:
[
  { file: 'file1.txt', patchPath: 'files/patches/file1.txt.xdelta', status: 'success' },
  { file: 'file2.txt', patchPath: 'files/patches/file2.txt.xdelta', status: 'success' }
]
```

#### `applyBatchPatches(oldDir, patchesDir, outputDir, options)`

Aplica patches em lote.

```javascript
const results = await patchGen.applyBatchPatches(
  'files/old/',
  'files/patches/',
  'files/applied/'
);

// Resultado:
[
  { file: 'file1.txt', status: 'success' },
  { file: 'file2.txt', status: 'success' }
]
```

#### `checkXdelta()`

Verifica se o Xdelta3 está disponível no sistema.

```javascript
try {
  await patchGen.checkXdelta();
  console.log('✅ Xdelta3 encontrado!');
} catch (error) {
  console.log('❌ Xdelta3 não encontrado:', error.message);
}
```

## 📁 Estrutura do Projeto

```
advanced-patch-generator/
├── src/
│   └── index.js          # Biblioteca principal
├── files/
│   ├── old/              # Arquivos originais
│   ├── new/              # Arquivos atualizados
│   ├── patches/          # Patches gerados
│   └── applyPatches/     # Arquivos com patch aplicado
├── test.js               # Arquivo de teste
├── package.json
├── .eslintrc.json        # Configuração ESLint
└── README.md
```

## 🔧 Configuração Avançada

### Opções de Compressão

```javascript
const patchGen = new AdvancedPatchGenerator({
  compression: 9,        // Máxima compressão (0-9)
  verify: true,          // Verificar integridade
  showProgress: true,    // Mostrar progresso
  xdeltaPath: '/usr/bin/xdelta3'  // Caminho personalizado
});
```

### Processamento em Lote

```javascript
// Criar patches para todos os arquivos
const patches = await patchGen.createBatchPatches(
  'files/old/',
  'files/new/',
  'files/patches/',
  { compression: 6 }
);

// Aplicar todos os patches
const results = await patchGen.applyBatchPatches(
  'files/old/',
  'files/patches/',
  'files/applied/'
);
```

## 📊 Métricas e Performance

O sistema fornece métricas detalhadas:

- **Tamanho dos arquivos** (original, novo, patch)
- **Taxa de compressão** (%)
- **Tempo de processamento**
- **Verificação de integridade**
- **Progresso em tempo real**

## 🛠️ Comandos Disponíveis

```bash
npm test          # Executar teste
npm start         # Executar biblioteca
npm run lint      # Verificar código
npm run lint:fix  # Corrigir problemas de linting
npm run docs      # Gerar documentação
```

## 📝 Exemplo de Saída

```
🧪 Teste do Advanced Patch Generator
=====================================

🔍 Verificando Xdelta3...
✅ Xdelta3 encontrado e funcionando!

📁 Diretórios criados:
   - files/old/ (arquivos originais)
   - files/new/ (arquivos atualizados)
   - files/patches/ (patches gerados)
   - files/applyPatches/ (arquivos com patch aplicado)

🔄 Arquivos que serão testados: exemplo.txt

==================================================
🧪 Testando: exemplo.txt
==================================================

📦 Criando patch...
✅ Patch criado com sucesso!

🔧 Aplicando patch...
✅ Patch aplicado com sucesso!

🔍 Verificando integridade...
✅ Patch é válido!

==================================================
📊 RESULTADOS FINAIS
==================================================
✅ Testes bem-sucedidos: 1/1
📈 Taxa de sucesso: 100.0%

🎉 Todos os testes passaram! O sistema está funcionando perfeitamente.
```

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, leia as diretrizes antes de contribuir.

### Como Contribuir

1. **Fork o projeto**
2. **Crie uma branch para sua feature**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit suas mudanças**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push para a branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Abra um Pull Request**

### Diretrizes de Contribuição

- Mantenha o código limpo e bem documentado
- Adicione testes para novas funcionalidades
- Siga as convenções de código existentes
- Atualize a documentação quando necessário

## 🐛 Reportando Bugs

Se você encontrar um bug, por favor:

1. Verifique se o bug já foi reportado
2. Crie uma issue com informações detalhadas
3. Inclua passos para reproduzir o problema
4. Adicione informações do sistema (OS, Node.js version, etc.)

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🙏 Agradecimentos

- [Xdelta](https://github.com/jmacd/xdelta) - Biblioteca de delta encoding
- [fs-extra](https://github.com/jprichardson/node-fs-extra) - Utilitários de sistema de arquivos

## 📞 Suporte

- 📧 Email: seu.email@exemplo.com
- 🐛 Issues: [GitHub Issues](https://github.com/seuusuario/advanced-patch-generator/issues)
- 📖 Documentação: [GitHub Wiki](https://github.com/seuusuario/advanced-patch-generator/wiki)
#   A d v a n c e d - P a t c h - G e n e r a t o r  
 