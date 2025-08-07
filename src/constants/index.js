/**
 * Constantes do sistema
 */

export const DEFAULT_OPTIONS = {
  xdeltaPath: 'xdelta3.exe',
  compression: 9,
  verify: true,
  showProgress: true,
  // Novas opções para arquivos grandes
  largeFileThreshold: 100 * 1024 * 1024, // 100MB
  hugeFileThreshold: 1024 * 1024 * 1024, // 1GB
  extremeFileThreshold: 5 * 1024 * 1024 * 1024, // 5GB
  chunkSize: 64 * 1024 * 1024, // 64MB para processamento em chunks
  memoryLimit: 512 * 1024 * 1024, // 512MB limite de memória
  timeout: 300000, // 5 minutos
  // Novas opções para arquivos extremamente grandes
  enableChunkProcessing: true,
  maxChunkSize: 500 * 1024 * 1024, // 500MB por chunk
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
1. Acesse: https://github.com/jmacd/xdelta/releases
2. Baixe a versão mais recente para Windows
3. Extraia o arquivo xdelta3.exe
4. Coloque o xdelta3.exe em uma pasta no PATH
   (ex: C:\\Windows\\System32\\ ou adicione ao PATH do sistema)

💡 Alternativas:
   - Use o Scoop: scoop install xdelta3
   - Use o Chocolatey: choco install xdelta3

🔧 Ou configure o caminho manualmente:
   const patchGen = new AdvancedPatchGenerator({
     xdeltaPath: "C:\\caminho\\para\\xdelta3.exe"
   });
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
  // Limites para arquivos grandes (removida limitação de 2GB)
  LARGE_FILE_THRESHOLD: 100 * 1024 * 1024, // 100MB
  HUGE_FILE_THRESHOLD: 1024 * 1024 * 1024, // 1GB
  EXTREME_FILE_THRESHOLD: 5 * 1024 * 1024 * 1024, // 5GB
  // Removido MAX_FILE_SIZE para permitir arquivos maiores que 2GB
};
