/**
 * Constantes do sistema
 */

export const DEFAULT_OPTIONS = {
  xdeltaPath: 'xdelta3.exe',
  compression: 9,
  verify: true,
  showProgress: true,
  // Novas opções para arquivos grandes
  largeFileThreshold: 10 * 1024 * 1024, // 10MB - ativa otimizações muito cedo
  hugeFileThreshold: 500 * 1024 * 1024, // 500MB - threshold muito menor  
  extremeFileThreshold: 1000 * 1024 * 1024, // 1gb - ativa modo extremo para arquivos de 500MB+
  chunkSize: 64 * 1024 * 1024, // 64MB para processamento em chunks
  memoryLimit: 512 * 1024 * 1024, // 512MB limite de memória
  timeout: 300000, // 5 minutos
  // Novas opções para arquivos extremamente grandes
  enableChunkProcessing: true,
  maxChunkSize: 128 * 1024 * 1024, // 128MB por chunk - otimizado para máxima velocidade
  enableStreaming: true,
};

export const COMPRESSION_LEVELS = {
  MIN: 0,
  MAX: 9,
  DEFAULT: 9,
  // Níveis otimizados para arquivos grandes
  LARGE_FILE: 6,
  HUGE_FILE: 3,
  EXTREME_FILE: 1, // Compressão mínima para arquivos extremamente grandes
};

export const FILE_EXTENSIONS = {
  PATCH: '.xdelta',
  TEMP: '.temp',
  CHUNK: '.chunk',
};

export const LARGE_FILE_OPTIONS = {
  // Opções específicas para arquivos grandes
  USE_CHUNKS: true,
  SKIP_VERIFICATION: true,
  LOWER_COMPRESSION: true,
  STREAM_PROCESSING: true,
  // Novas opções para arquivos extremamente grandes
  ENABLE_CHUNK_PROCESSING: true,
  ENABLE_STREAMING: true,
  ENABLE_MEMORY_OPTIMIZATION: true,
};

export const MESSAGES = {
  XDELTA_NOT_FOUND: 'Xdelta3 não encontrado no sistema.',
  XDELTA_INSTALL_INSTRUCTIONS: `
📋 Para instalar o Xdelta3 no Windows:

🔧 Métodos de Instalação:

1. Chocolatey (Recomendado):
   choco install xdelta3

2. Scoop:
   scoop install xdelta3

3. Winget:
   winget install xdelta3

4. Download Manual:
   - Acesse: https://github.com/jmacd/xdelta/releases
   - Baixe a versão mais recente para Windows
   - Extraia o arquivo xdelta3.exe
   - Coloque em uma pasta no PATH

🔧 Configuração Manual:
   const patchGen = new AdvancedPatchGenerator({
     xdeltaPath: "C:\\ProgramData\\chocolatey\\bin\\xdelta3.exe"
   });

💡 Dicas:
   - Após instalar, reinicie o terminal
   - Verifique se está no PATH: where xdelta3
   - Teste manualmente: xdelta3 -h
`,
  PATCH_CREATED: '🎉 PATCH CRIADO COM SUCESSO!',
  PATCH_APPLIED: '✅ PATCH APLICADO COM SUCESSO!',
  ERROR_CREATE_PATCH: 'Erro ao criar patch:',
  ERROR_APPLY_PATCH: 'Erro ao aplicar patch:',
  ERROR_VERIFY_PATCH: 'Erro ao verificar patch:',
  // Novas mensagens para arquivos grandes
  FILE_TOO_LARGE: 'Arquivo muito grande. Usando processamento otimizado.',
  MEMORY_WARNING: 'Arquivo grande detectado. Otimizando para baixo consumo de memória.',
  CHUNK_PROCESSING: 'Processando arquivo grande em chunks para otimizar memória.',
  SKIPPING_VERIFICATION: 'Pulando verificação para arquivo grande (otimização de memória).',
  EXTREME_FILE_WARNING: 'Arquivo extremamente grande detectado. Usando processamento em chunks.',
  CHUNK_PROCESSING_START: 'Iniciando processamento em chunks...',
  CHUNK_PROCESSING_COMPLETE: 'Processamento em chunks concluído!',
};

export const PROGRESS_BAR = {
  DEFAULT_WIDTH: 30,
  FILLED_CHAR: '█',
  EMPTY_CHAR: '░',
};

export const METRICS = {
  BYTES_CONVERSION: 1024,
  TIME_UNITS: {
    MILLISECOND: 1000,
    MINUTE: 60000,
  },
  // Limites otimizados para máxima velocidade
  LARGE_FILE_THRESHOLD: 10 * 1024 * 1024, // 10MB
  HUGE_FILE_THRESHOLD: 500 * 1024 * 1024, // 500MB  
  EXTREME_FILE_THRESHOLD: 1000 * 1024 * 1024, // 1gb
  // Removido MAX_FILE_SIZE para permitir arquivos maiores que 2GB
};
