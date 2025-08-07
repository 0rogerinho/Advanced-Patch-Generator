# Estrutura do Projeto

Este projeto foi reorganizado para melhor separação de responsabilidades e manutenibilidade.

## 📁 Estrutura de Diretórios

```
src/
├── constants/          # Constantes e configurações
│   └── index.js       # Configurações padrão e mensagens
├── lib/               # Bibliotecas principais
│   ├── index.js       # Exportações das bibliotecas
│   └── AdvancedPatchGenerator.js  # Classe principal
├── utils/             # Utilitários
│   ├── index.js       # Exportações dos utilitários
│   ├── metrics.js     # Utilitários para métricas e formatação
│   ├── commandUtils.js # Utilitários para comandos e processos
│   └── displayUtils.js # Utilitários para exibição e formatação
├── validations/       # Validações
│   ├── index.js       # Exportações das validações
│   └── fileValidation.js # Validações de arquivos e caminhos
└── index.js           # Ponto de entrada principal
```

## 🧩 Módulos

### Constants (`src/constants/`)
Centraliza todas as constantes e configurações do sistema:
- Configurações padrão
- Mensagens de erro e sucesso
- Constantes de compressão
- Configurações de interface

### Lib (`src/lib/`)
Contém as bibliotecas principais:
- **AdvancedPatchGenerator**: Classe principal que gerencia patches

### Utils (`src/utils/`)
Utilitários reutilizáveis:
- **MetricsUtils**: Formatação de bytes, tempo e métricas
- **CommandUtils**: Execução de comandos e processos
- **DisplayUtils**: Formatação e exibição de resultados

### Validations (`src/validations/`)
Validações de entrada e dados:
- **FileValidation**: Validação de arquivos, caminhos e permissões

## 🔄 Como Usar

### Importação Principal
```javascript
import AdvancedPatchGenerator from './src/index.js';
```

### Importação Específica
```javascript
import { AdvancedPatchGenerator } from './src/lib/index.js';
import { MetricsUtils, DisplayUtils } from './src/utils/index.js';
import { FileValidation } from './src/validations/index.js';
import { DEFAULT_OPTIONS } from './src/constants/index.js';
```

### Exemplo de Uso
```javascript
import AdvancedPatchGenerator from './src/index.js';

const patchGen = new AdvancedPatchGenerator({
  compression: 6,
  verify: true,
  showProgress: true
});

// Criar patch
await patchGen.createPatch('old.txt', 'new.txt', 'patch.xdelta');

// Aplicar patch
await patchGen.applyPatch('old.txt', 'patch.xdelta', 'applied.txt');
```

## 🎯 Benefícios da Reorganização

1. **Separação de Responsabilidades**: Cada módulo tem uma função específica
2. **Reutilização**: Utilitários podem ser usados independentemente
3. **Manutenibilidade**: Código mais organizado e fácil de manter
4. **Testabilidade**: Módulos isolados são mais fáceis de testar
5. **Escalabilidade**: Fácil adicionar novos módulos e funcionalidades

## 📝 Convenções

- **Arquivos**: Usar PascalCase para classes, camelCase para funções
- **Diretórios**: Usar camelCase
- **Exportações**: Usar named exports para utilitários, default export para classes principais
- **Documentação**: JSDoc em todas as funções públicas
