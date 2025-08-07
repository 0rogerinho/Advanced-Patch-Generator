# Guia para Arquivos Grandes

Este guia explica como usar o Advanced Patch Generator com arquivos grandes de forma otimizada.

## 🚀 Suporte para Arquivos Grandes

### Limitações e Capacidades

O Advanced Patch Generator agora suporta arquivos de qualquer tamanho, incluindo arquivos extremamente grandes:

1. **Arquivos Pequenos**: < 100 MB (processamento normal)
2. **Arquivos Grandes**: 100 MB - 1 GB (otimizações aplicadas)
3. **Arquivos Muito Grandes**: 1 GB - 5 GB (otimizações avançadas)
4. **Arquivos Extremamente Grandes**: > 5 GB (processamento em chunks)

### Otimizações Implementadas

O Advanced Patch Generator inclui otimizações automáticas para arquivos grandes:

## 🔧 Configurações Automáticas

### Limites de Tamanho

- **Arquivo Pequeno**: < 100 MB (processamento normal)
- **Arquivo Grande**: 100 MB - 1 GB (otimizações aplicadas)
- **Arquivo Muito Grande**: 1 GB - 5 GB (otimizações avançadas)
- **Arquivo Extremamente Grande**: > 5 GB (processamento em chunks)

### Otimizações Aplicadas

#### Para Arquivos Grandes (100MB - 1GB)
- Compressão reduzida (nível 6)
- Verificação opcional (pode ser pulada)
- Avisos de otimização exibidos

#### Para Arquivos Muito Grandes (1GB - 5GB)
- Compressão baixa (nível 3)
- Verificação sempre pulada
- Processamento em streaming
- Timeout aumentado

#### Para Arquivos Extremamente Grandes (>5GB)
- **Processamento em chunks** (500MB por chunk)
- Compressão mínima (nível 1)
- Verificação sempre pulada
- Processamento otimizado para memória
- Combinação automática de chunks

## 📋 Como Usar

### 1. Teste Específico para Arquivos Grandes

```bash
npm run test:large
```

### 2. Configuração Manual

```javascript
import AdvancedPatchGenerator from './src/lib/AdvancedPatchGenerator.js';

const patchGen = new AdvancedPatchGenerator({
  compression: 3, // Compressão baixa para arquivos grandes
  verify: false, // Pula verificação para economizar memória
  largeFileThreshold: 50 * 1024 * 1024, // 50MB
  timeout: 900000, // 15 minutos
  memoryLimit: 256 * 1024 * 1024, // 256MB
  enableChunkProcessing: true, // Habilita processamento em chunks
  maxChunkSize: 500 * 1024 * 1024 // 500MB por chunk
});
```

### 3. Verificação de Tamanho

```javascript
import LargeFileUtils from './src/utils/largeFileUtils.js';

const fileSize = await LargeFileUtils.getFileSize('arquivo.grf');
const isLarge = await LargeFileUtils.isLargeFile('arquivo.grf');
const isHuge = await LargeFileUtils.isHugeFile('arquivo.grf');
const isExtreme = await LargeFileUtils.isExtremeFile('arquivo.grf');

if (isExtreme) {
  console.log('Arquivo extremamente grande (>5GB). Usando processamento em chunks.');
} else if (isHuge) {
  console.log('Arquivo muito grande (>1GB). Aplicando otimizações.');
}
```

## ⚡ Dicas de Performance

### 1. Aumentar Memória do Node.js

```bash
node --max-old-space-size=4096 test-large-files.js
```

### 2. Usar Compressão Baixa

```javascript
const patchGen = new AdvancedPatchGenerator({
  compression: 3, // Baixa compressão = mais rápido
});
```

### 3. Pular Verificação

```javascript
const patchGen = new AdvancedPatchGenerator({
  verify: false, // Economiza memória e tempo
});
```

### 4. Aumentar Timeout

```javascript
const patchGen = new AdvancedPatchGenerator({
  timeout: 1800000, // 30 minutos
});
```

### 5. Configurar Processamento em Chunks

```javascript
const patchGen = new AdvancedPatchGenerator({
  enableChunkProcessing: true,
  maxChunkSize: 500 * 1024 * 1024, // 500MB por chunk
});
```

## 🔍 Monitoramento

### Verificar Uso de Memória

```javascript
const used = process.memoryUsage();
console.log(`Memória usada: ${Math.round(used.heapUsed / 1024 / 1024)} MB`);
```

### Verificar Progresso

```javascript
const patchGen = new AdvancedPatchGenerator({
  showProgress: true, // Mostra progresso detalhado
});
```

## 🚨 Solução de Problemas

### Erro: "JavaScript heap out of memory"

**Causa**: Arquivo muito grande para a memória disponível

**Solução**:
1. Aumente a memória do Node.js:
   ```bash
   node --max-old-space-size=8192 test-large-files.js
   ```
2. Use configurações otimizadas:
   ```javascript
   const patchGen = new AdvancedPatchGenerator({
     verify: false,
     compression: 1,
     memoryLimit: 1024 * 1024 * 1024,
     enableChunkProcessing: true
   });
   ```

### Erro: "Command timed out"

**Causa**: Operação demorou muito

**Solução**:
1. Aumente o timeout:
   ```javascript
   const patchGen = new AdvancedPatchGenerator({
     timeout: 1800000 // 30 minutos
   });
   ```
2. Use compressão mais baixa
3. Verifique a performance do sistema

### Erro: "Processamento em chunks falhou"

**Causa**: Problema durante o processamento em chunks

**Solução**:
1. Reduza o tamanho dos chunks:
   ```javascript
   const patchGen = new AdvancedPatchGenerator({
     maxChunkSize: 250 * 1024 * 1024 // 250MB por chunk
   });
   ```
2. Verifique espaço em disco
3. Monitore uso de memória

## 📊 Métricas de Performance

### Arquivos Testados

| Tamanho | Tempo de Geração | Tempo de Aplicação | Memória Usada | Método |
|---------|------------------|-------------------|---------------|---------|
| 100MB   | ~30s            | ~10s              | ~200MB        | Normal |
| 500MB   | ~2min           | ~30s              | ~500MB        | Normal |
| 1GB     | ~5min           | ~1min             | ~800MB        | Otimizado |
| 2GB     | ~15min          | ~3min             | ~1.5GB        | Otimizado |
| 5GB     | ~45min          | ~8min             | ~2GB          | Chunks |
| 10GB    | ~90min          | ~15min            | ~2.5GB        | Chunks |

### Otimizações por Tamanho

- **< 100MB**: Processamento normal
- **100MB - 1GB**: Compressão reduzida, verificação opcional
- **1GB - 5GB**: Compressão baixa, sem verificação, streaming
- **> 5GB**: Processamento em chunks, compressão mínima

## 🔄 Processamento em Chunks

Para arquivos extremamente grandes (>5GB), o sistema automaticamente:

1. **Divide o arquivo** em chunks de 500MB
2. **Processa cada chunk** separadamente
3. **Combina os resultados** em um único patch
4. **Otimiza memória** durante todo o processo

### Configuração de Chunks

```javascript
const patchGen = new AdvancedPatchGenerator({
  enableChunkProcessing: true,
  maxChunkSize: 500 * 1024 * 1024, // 500MB por chunk
  chunkSize: 64 * 1024 * 1024 // 64MB para processamento interno
});
```

## 📞 Suporte

Se você ainda enfrentar problemas com arquivos grandes:

1. **Verifique o tamanho**: Use `LargeFileUtils.getFileSize()`
2. **Aplique otimizações**: Use configurações específicas para arquivos grandes
3. **Monitore recursos**: Verifique uso de CPU e memória
4. **Use chunks**: Para arquivos > 5GB, o processamento em chunks é automático

### Comandos Úteis

```bash
# Teste específico para arquivos grandes
npm run test:large

# Com mais memória
node --max-old-space-size=8192 test-large-files.js

# Verificar tamanho dos arquivos
ls -lh files/old/ files/new/
```
