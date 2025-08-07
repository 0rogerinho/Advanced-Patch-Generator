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
- ✅ **Análise avançada de patches** com diferentes níveis de compressão
- ✅ **Verificação de integridade** para garantir precisão
- ✅ **Otimizações para arquivos grandes** com processamento inteligente
- ✅ **Interface simples** e intuitiva
- ✅ **Documentação completa** com exemplos práticos

## 📋 Pré-requisitos

### Instalação do Xdelta3

**Método Automático (Recomendado):**
```bash
# Usando o script de instalação
npm run install:xdelta3
```

**Método Manual:**

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

## 🏗️ Estrutura do Projeto

O projeto foi reorganizado para melhor separação de responsabilidades:

```
src/
├── constants/          # Constantes e configurações
├── lib/               # Bibliotecas principais
├── utils/             # Utilitários reutilizáveis
├── validations/       # Validações de entrada
└── index.js           # Ponto de entrada principal
```

### Módulos Disponíveis

- **`AdvancedPatchGenerator`**: Classe principal para gerenciamento de patches
- **`MetricsUtils`**: Utilitários para formatação de métricas e tempo
- **`CommandUtils`**: Utilitários para execução de comandos
- **`DisplayUtils`**: Utilitários para exibição e formatação
- **`FileValidation`**: Validações de arquivos e caminhos
- **Constantes**: Configurações padrão e mensagens

## 🧪 Uso Rápido

### Teste Inicial

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seuusuario/advanced-patch-generator.git
   cd advanced-patch-generator
   npm install
   ```

### Teste para Arquivos Grandes

Para arquivos grandes (>100MB), use o teste específico:

```bash
npm run test:large
```

Este teste aplica otimizações automáticas para arquivos grandes, incluindo:
- Compressão reduzida para melhor performance
- Verificação opcional para economizar memória
- Timeouts aumentados
- Processamento em streaming

2. **Coloque seus arquivos:**
   - Arquivo original em `files/old/`
   - Arquivo atualizado em `files/new/`

3. **Execute o teste:**
   ```bash
   npm test
   ```

4. **Veja os exemplos da nova estrutura:**
   ```bash
   node examples/usage-examples.js
   ```

### Uso Programático

#### Importação Principal
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

#### Importação Específica de Módulos
```javascript
import { AdvancedPatchGenerator } from 'advanced-patch-generator/lib';
import { MetricsUtils, DisplayUtils } from 'advanced-patch-generator/utils';
import { FileValidation } from 'advanced-patch-generator/validations';
import { DEFAULT_OPTIONS } from 'advanced-patch-generator/constants';

// Usar utilitários diretamente
const bytesFormatados = MetricsUtils.formatBytes(1048576); // "1 MB"
const tempoFormatado = MetricsUtils.formatTime(1500); // "1.50s"

// Usar validações
const nivelValido = FileValidation.isValidCompressionLevel(5); // true
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

### Configurações para Arquivos Grandes

Para arquivos grandes (>100MB), use configurações otimizadas:

```javascript
import AdvancedPatchGenerator from './src/lib/AdvancedPatchGenerator.js';

const patchGen = new AdvancedPatchGenerator({
  compression: 3, // Compressão baixa para arquivos grandes
  verify: false, // Pula verificação para economizar memória
  largeFileThreshold: 50 * 1024 * 1024, // 50MB
  timeout: 900000, // 15 minutos
  memoryLimit: 256 * 1024 * 1024 // 256MB
});

// Verificar se é arquivo grande
import LargeFileUtils from './src/utils/largeFileUtils.js';

const fileSize = await LargeFileUtils.getFileSize('arquivo.grf');
const isLarge = await LargeFileUtils.isLargeFile('arquivo.grf');

if (isLarge) {
  console.log('Arquivo grande detectado. Aplicando otimizações...');
}
```

### Análise Avançada de Patches

O `PatchAnalyzer` permite analisar patches com diferentes níveis de compressão para encontrar a melhor configuração para seus arquivos.

#### `analyzePatch(oldFile, newFile, outputDir, options)`

Analisa patches com diferentes níveis de compressão.

```javascript
import { PatchAnalyzer } from 'advanced-patch-generator';

const analyzer = new PatchAnalyzer({
  showProgress: true,
  includeUncompressed: true,
  compressionLevels: [0, 1, 3, 6, 9]
});

const results = await analyzer.analyzePatch(
  'files/old/exemplo.txt',
  'files/new/exemplo.txt',
  'files/patches/analysis'
);

// Exibe resultados de forma bonita
PatchAnalyzer.displayAnalysisResults(results);
```

**Resultado da análise:**
```javascript
{
  oldFile: { path: 'files/old/exemplo.txt', size: 1024, sizeFormatted: '1 KB' },
  newFile: { path: 'files/new/exemplo.txt', size: 2048, sizeFormatted: '2 KB' },
  analysis: [
    {
      testName: 'uncompressed',
      compressionLevel: -1,
      patchFile: 'files/patches/analysis/patch_uncompressed.xdelta',
      patchInfo: { size: 1024, sizeFormatted: '1 KB' },
      duration: 50,
      durationFormatted: '50ms',
      success: true,
      compressionRatio: 50.00,
      sizeSaved: 1024,
      sizeSavedFormatted: '1 KB'
    },
    // ... outros níveis de compressão
  ],
  summary: {
    totalTests: 6,
    successfulTests: 6,
    bestCompression: { /* melhor resultado */ },
    worstCompression: { /* pior resultado */ },
    averageCompressionRatio: '75.50',
    totalSizeSaved: 6144,
    totalSizeSavedFormatted: '6 KB'
  },
  duration: 500,
  durationFormatted: '500ms'
}
```

#### Comando CLI para Análise

```bash
# Análise básica
node scripts/analyze-patches.js files/old/file.txt files/new/file.txt

# Análise com níveis específicos
node scripts/analyze-patches.js old.txt new.txt --compression 0,3,9

# Análise sem teste sem compressão
node scripts/analyze-patches.js old.txt new.txt --no-uncompressed

# Análise com diretório de saída personalizado
node scripts/analyze-patches.js old.txt new.txt --output-dir ./my-patches

# Ver ajuda
node scripts/analyze-patches.js --help
```

### Métodos Principais

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
#   A d v a n c e d - P a t c h - G e n e r a t o r 
 
 