# 🔬 Análise Avançada de Patches

O **PatchAnalyzer** é uma ferramenta poderosa que permite analisar patches com diferentes níveis de compressão para encontrar a configuração ideal para seus arquivos.

## 🚀 Características

- ✅ **Análise completa** com múltiplos níveis de compressão
- ✅ **Teste sem compressão** para comparação
- ✅ **Métricas detalhadas** de tamanho, tempo e eficiência
- ✅ **Interface bonita** com barras de progresso e cores
- ✅ **Recomendações inteligentes** baseadas nos resultados
- ✅ **Comando CLI** fácil de usar
- ✅ **Relatórios detalhados** com tabelas formatadas

## 📋 Pré-requisitos

Certifique-se de ter o **Xdelta3** instalado no seu sistema:

```bash
# Windows
npm run install:xdelta3

# Linux
sudo apt-get install xdelta3

# macOS
brew install xdelta3
```

## 🎯 Uso Rápido

### Comando CLI

```bash
# Análise básica
node scripts/analyze-patches.js arquivo_antigo.txt arquivo_novo.txt

# Análise com níveis específicos
node scripts/analyze-patches.js old.txt new.txt --compression 0,3,9

# Análise sem teste sem compressão
node scripts/analyze-patches.js old.txt new.txt --no-uncompressed

# Análise com diretório personalizado
node scripts/analyze-patches.js old.txt new.txt --output-dir ./meus-patches
```

### Programático

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

## 📊 Opções de Configuração

### PatchAnalyzer Constructor

| Opção | Tipo | Padrão | Descrição |
|-------|------|--------|-----------|
| `showProgress` | boolean | `true` | Mostrar barras de progresso |
| `includeUncompressed` | boolean | `true` | Incluir teste sem compressão |
| `compressionLevels` | Array<number> | `[0,1,3,6,9]` | Níveis de compressão para testar |
| `xdeltaPath` | string | `'xdelta3.exe'` | Caminho para o executável xdelta3 |

### Comando CLI

| Opção | Descrição |
|-------|-----------|
| `--output-dir <dir>` | Diretório de saída (padrão: `./patches/analysis`) |
| `--compression <niveis>` | Níveis de compressão separados por vírgula |
| `--no-uncompressed` | Não incluir teste sem compressão |
| `--no-progress` | Não mostrar barra de progresso |
| `--help` | Mostrar ajuda |

## 📈 Resultados da Análise

### Estrutura do Resultado

```javascript
{
  oldFile: {
    path: 'files/old/exemplo.txt',
    size: 1024,
    sizeFormatted: '1 KB',
    modified: Date,
    exists: true
  },
  newFile: {
    path: 'files/new/exemplo.txt',
    size: 2048,
    sizeFormatted: '2 KB',
    modified: Date,
    exists: true
  },
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

### Métricas Calculadas

- **Taxa de Compressão**: Porcentagem de redução do tamanho
- **Tamanho Economizado**: Bytes economizados com compressão
- **Tempo de Geração**: Tempo para criar cada patch
- **Eficiência**: Relação entre compressão e tempo

## 🎨 Interface Visual

### Exemplo de Saída

```
🔬🔬🔬🔬🔬🔬🔬🔬🔬🔬🔬🔬🔬🔬🔬🔬🔬🔬🔬🔬
🔬 ANÁLISE DE PATCHES COMPLETA 🔬
🔬🔬🔬🔬🔬🔬🔬🔬🔬🔬🔬🔬🔬🔬🔬🔬🔬🔬🔬🔬

📁 ARQUIVOS ANALISADOS:
──────────────────────────────────────────────────
📁 Original: files/old/exemplo.txt
   Tamanho: 1 KB
   Modificado: 07/08/2025, 13:02:58
📁 Novo: files/new/exemplo.txt
   Tamanho: 2 KB
   Modificado: 07/08/2025, 13:02:58

📊 RESUMO GERAL:
──────────────────────────────────────────────────
   ⏱️  Tempo Total: 368ms
   🧪 Testes Realizados: 6
   ✅ Testes Bem-sucedidos: 6
   📈 Taxa de Sucesso: 100.0%
   🗜️  Média de Compressão: 75.50%
   💾 Total Economizado: 6 KB

🏆 MELHOR COMPRESSÃO:
──────────────────────────────────────────────────
   Nível: 9
   Taxa: 85.2%
   Tamanho: 300 Bytes
   Economia: 1.7 KB
   Tempo: 74ms

📋 ANÁLISE DETALHADA:
────────────────────────────────────────────────────────────────────────────────
Nível           Taxa            Tamanho         Economia                Tempo           Status
────────────────────────────────────────────────────────────────────────────────
Sem             50.0%           1 KB             1 KB                    50ms            ✅      
0               60.0%           800 Bytes        1.2 KB                  45ms            ✅      
1               65.0%           700 Bytes        1.3 KB                  48ms            ✅      
3               70.0%           600 Bytes        1.4 KB                  52ms            ✅      
6               80.0%           400 Bytes        1.6 KB                  65ms            ✅      
9               85.2%           300 Bytes        1.7 KB                  74ms            ✅      
────────────────────────────────────────────────────────────────────────────────
```

## 💡 Dicas de Uso

### 1. Escolha dos Níveis de Compressão

- **Nível 0**: Compressão mínima, mais rápido
- **Nível 1-3**: Compressão baixa, bom equilíbrio
- **Nível 6**: Compressão média, recomendado para maioria
- **Nível 9**: Compressão máxima, mais lento

### 2. Quando Usar Cada Nível

- **Arquivos pequenos (< 1MB)**: Níveis 0-3
- **Arquivos médios (1-10MB)**: Níveis 3-6
- **Arquivos grandes (> 10MB)**: Níveis 6-9
- **Tempo crítico**: Níveis 0-1
- **Espaço crítico**: Níveis 6-9

### 3. Interpretação dos Resultados

- **Taxa positiva**: Patch menor que arquivo original
- **Taxa negativa**: Patch maior que arquivo original (normal para arquivos muito diferentes)
- **Melhor resultado**: Maior taxa de compressão
- **Tempo vs Compressão**: Equilibre conforme sua necessidade

## 🔧 Exemplos Práticos

### Exemplo 1: Análise de Arquivo de Texto

```bash
node scripts/analyze-patches.js old.txt new.txt --compression 0,3,6,9
```

### Exemplo 2: Análise de Arquivo Binário

```bash
node scripts/analyze-patches.js old.bin new.bin --compression 1,3,6,9
```

### Exemplo 3: Análise Rápida (Apenas Níveis Baixos)

```bash
node scripts/analyze-patches.js old.txt new.txt --compression 0,1,3 --no-uncompressed
```

### Exemplo 4: Análise Completa com Diretório Personalizado

```bash
node scripts/analyze-patches.js old.txt new.txt --output-dir ./analysis-results --compression 0,1,3,6,9
```

## 🚨 Solução de Problemas

### Erro: "Xdelta3 não encontrado"

```bash
# Instale o Xdelta3
npm run install:xdelta3

# Ou instale manualmente
# Windows: scoop install xdelta3
# Linux: sudo apt-get install xdelta3
# macOS: brew install xdelta3
```

### Erro: "Arquivo não encontrado"

- Verifique se os caminhos dos arquivos estão corretos
- Use caminhos absolutos se necessário
- Certifique-se de que os arquivos existem

### Taxas de Compressão Negativas

- Normal para arquivos muito diferentes
- Indica que o patch é maior que o arquivo original
- Considere usar compressão externa (gzip, bzip2)

## 📚 Referências

- [Xdelta3 Documentation](https://github.com/jmacd/xdelta)
- [Advanced Patch Generator](https://github.com/seuusuario/advanced-patch-generator)
- [Binary Diff Algorithms](https://en.wikipedia.org/wiki/Binary_diff)

---

**Desenvolvido com ❤️ para otimizar a distribuição de patches**
