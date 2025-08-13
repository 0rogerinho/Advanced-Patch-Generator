# Guia de Progresso - Advanced Patch Generator

## Visão Geral

A biblioteca Advanced Patch Generator agora oferece callbacks de progresso mais detalhados que permitem acompanhar o progresso real da criação e aplicação de patches, incluindo informações sobre bytes processados e porcentagens baseadas no tamanho do arquivo.

## Estrutura do ProgressData

O callback de progresso recebe um objeto `ProgressData` com as seguintes propriedades:

```typescript
interface ProgressData {
  percentage: number;    // Porcentagem de 0 a 100
  message: string;       // Mensagem descritiva da etapa atual
  current?: number;      // Bytes processados atualmente
  total?: number;        // Total de bytes a processar
  speed?: string;        // Velocidade de processamento (futuro)
  eta?: string;         // Tempo estimado restante (futuro)
}
```

## Exemplos de Uso

### 1. Progresso Básico

```javascript
import AdvancedPatchGenerator from 'advanced-patch-generator';

const patchGen = new AdvancedPatchGenerator({ showProgress: true });

const result = await patchGen.createPatch(
  'old.txt',
  'new.txt',
  'patch.xdelta',
  {
    onProgress: (data) => {
      console.log(`${data.percentage}% - ${data.message}`);
    }
  }
);
```

### 2. Progresso com Informações de Tamanho

```javascript
const result = await patchGen.createPatch(
  'old.txt',
  'new.txt',
  'patch.xdelta',
  {
    onProgress: (data) => {
      if (data.current !== undefined && data.total !== undefined) {
        const currentMB = (data.current / (1024 * 1024)).toFixed(2);
        const totalMB = (data.total / (1024 * 1024)).toFixed(2);
        console.log(`${data.percentage}% - ${data.message} (${currentMB}MB / ${totalMB}MB)`);
      } else {
        console.log(`${data.percentage}% - ${data.message}`);
      }
    }
  }
);
```

### 3. Barra de Progresso Visual

```javascript
const result = await patchGen.createPatch(
  'old.txt',
  'new.txt',
  'patch.xdelta',
  {
    onProgress: (data) => {
      const barLength = 30;
      const filledLength = Math.round((data.percentage / 100) * barLength);
      const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
      
      let progressInfo = `${data.percentage.toString().padStart(3)}% [${bar}] ${data.message}`;
      
      if (data.current !== undefined && data.total !== undefined) {
        const currentMB = (data.current / (1024 * 1024)).toFixed(2);
        const totalMB = (data.total / (1024 * 1024)).toFixed(2);
        progressInfo += ` (${currentMB}MB / ${totalMB}MB)`;
      }
      
      process.stdout.write(`\r${progressInfo}`);
      
      if (data.percentage === 100) {
        console.log('\n');
      }
    }
  }
);
```

### 4. Progresso na Aplicação de Patches

```javascript
const result = await patchGen.applyPatch(
  'old.txt',
  'patch.xdelta',
  'new.txt',
  {
    onProgress: (data) => {
      if (data.current !== undefined && data.total !== undefined) {
        const currentMB = (data.current / (1024 * 1024)).toFixed(2);
        const totalMB = (data.total / (1024 * 1024)).toFixed(2);
        console.log(`${data.percentage}% - ${data.message} (${currentMB}MB / ${totalMB}MB)`);
      } else {
        console.log(`${data.percentage}% - ${data.message}`);
      }
    }
  }
);
```

## Etapas do Progresso

### Criação de Patch

1. **0%** - Iniciando criação do patch...
2. **10%** - Verificando Xdelta3...
3. **20%** - Validando arquivos de entrada...
4. **30%** - Processando arquivo/Criando patch...
5. **30-90%** - Progresso durante criação (simulado)
6. **100%** - Patch criado com sucesso!

### Aplicação de Patch

1. **0%** - Iniciando aplicação do patch...
2. **15%** - Verificando Xdelta3...
3. **25%** - Validando arquivos de entrada...
4. **40%** - Aplicando patch...
5. **40-80%** - Progresso durante aplicação (simulado)
6. **85%** - Verificando resultado...
7. **100%** - Patch aplicado com sucesso!

## Observações Importantes

- **Progresso Simulado**: Como o Xdelta3 não fornece progresso em tempo real, o progresso entre 30-90% (criação) e 40-80% (aplicação) é simulado para dar uma experiência mais fluida ao usuário.

- **Campos Opcionais**: Os campos `current` e `total` podem não estar disponíveis em todas as etapas, por isso é importante verificar sua existência antes de usá-los.

- **Performance**: O progresso é atualizado a cada 100-200ms para não impactar a performance do processamento.

- **Arquivos Grandes**: Para arquivos grandes, o progresso é calculado baseado no tamanho real do arquivo sendo processado.

## Melhorias Futuras

- Implementação de progresso real baseado em leitura de arquivo por chunks
- Cálculo de velocidade de processamento
- Estimativa de tempo restante (ETA)
- Progresso mais granular para arquivos muito grandes
