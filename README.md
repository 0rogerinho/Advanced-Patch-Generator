# Advanced Patch Generator

[![npm version](https://badge.fury.io/js/advanced-patch-generator.svg)](https://badge.fury.io/js/advanced-patch-generator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

> Advanced patch manager using Xdelta for efficient patch creation and application with progress support, events, and error handling.

## 🚀 Features

- ✅ **Patch creation and application** using Xdelta3
- 📊 **Real-time progress** with callbacks and events
- 🛡️ **Robust error handling** with clear messages
- 🐘 **Large file support** with optimized processing
- 📦 **Batch processing** for multiple files
- 🔍 **Integrity verification** of patches
- ⚡ **High performance** with automatic optimizations
- 🎯 **Simple and intuitive API**
- 📝 **Full TypeScript support**

## 📦 Installation

### Package Installation

```bash
npm install advanced-patch-generator
```

### Prerequisites

**No installation required!** 🎉 

Advanced Patch Generator includes **xdelta3-3.1.0.exe** and works out of the box on Windows. The library uses **ONLY** the included executable and will **NOT** use any system-installed version of Xdelta3.

> **Important**: The library is designed to work exclusively with the included `xdelta3-3.1.0.exe` file. It will not attempt to use any xdelta installed on your system.

## 🎯 Quick Start

```typescript
import AdvancedPatchGenerator from 'advanced-patch-generator';

// Create an instance
const patchGen = new AdvancedPatchGenerator({
  compression: 6,
  verify: true,
  showProgress: true
});

// Create a patch
const result = await patchGen.createPatch(
  'original_file.txt',
  'new_file.txt',
  'patch.xdelta'
);

if (result.success) {
  console.log('✅ Patch created successfully!');
  console.log(`Size: ${result.patchFile.sizeFormatted}`);
}
```

## 📚 Complete Documentation

### Configuration

```typescript
const patchGen = new AdvancedPatchGenerator({
  // Basic settings
  compression: 6,                    // Compression level (0-9)
  verify: true,                      // Verify integrity
  showProgress: true,                // Show default progress
  
  // Large file settings
  largeFileThreshold: 100 * 1024 * 1024, // 100MB
  timeout: 600000,                   // 10 minutes
  memoryLimit: 1000 * 1024 * 1024,  // 1GB
  
  // Optional callbacks
  onProgress: (progress) => {
    console.log(`Progress: ${progress.percentage}%`);
  },
  onError: (error) => {
    console.error(`Error: ${error.message}`);
  },
  onComplete: (result) => {
    console.log('Operation completed!');
  }
});
```

### Events

The class extends `EventEmitter`, allowing you to listen to events:

```typescript
// Listen to progress events
patchGen.on('progress', (data) => {
  console.log(`${data.percentage}% - ${data.message}`);
});

// Listen to error events
patchGen.on('error', (error) => {
  console.error(`Error: ${error.message}`);
});

// Listen to completion events
patchGen.on('complete', (result) => {
  console.log('Operation completed!');
});
```

### Main Methods

#### `createPatch(oldFile, newFile, patchFile, options)`

Creates a patch between two files.

```typescript
const result = await patchGen.createPatch(
  'original_file.txt',
  'new_file.txt',
  'patch.xdelta',
  { compression: 9 }
);

if (result.success) {
  console.log(`Patch created: ${result.patchFile.sizeFormatted}`);
  console.log(`Duration: ${result.metrics.durationFormatted}`);
  console.log(`Compression: ${result.metrics.compressionRatio}%`);
}
```

#### `applyPatch(oldFile, patchFile, newFile, options)`

Applies a patch to a file.

```typescript
const result = await patchGen.applyPatch(
  'original_file.txt',
  'patch.xdelta',
  'applied_file.txt'
);

if (result.success) {
  console.log('Patch applied successfully!');
}
```

#### `verifyPatch(oldFile, patchFile, expectedFile)`

Verifies the integrity of a patch.

```typescript
const result = await patchGen.verifyPatch(
  'original_file.txt',
  'patch.xdelta',
  'expected_file.txt'
);

if (result.isValid) {
  console.log('✅ Patch is valid!');
} else {
  console.log('❌ Patch is invalid!');
}
```

#### `createBatchPatches(oldDir, newDir, patchesDir, options)`

Creates patches in batch for multiple files.

```typescript
const results = await patchGen.createBatchPatches(
  'original_folder',
  'new_folder',
  'patches_folder',
  { maxParallel: 4 }
);

console.log(`Processed: ${results.length} files`);
```

#### `applyBatchPatches(oldDir, patchesDir, outputDir, options)`

Applies patches in batch.

```typescript
const results = await patchGen.applyBatchPatches(
  'original_folder',
  'patches_folder',
  'output_folder'
);

const successCount = results.filter(r => r.status === 'success').length;
console.log(`Successfully applied: ${successCount}`);
```

### Error Handling

```typescript
try {
  const result = await patchGen.createPatch(
    'nonexistent_file.txt',
    'new_file.txt',
    'patch.xdelta'
  );
  
  if (!result.success) {
    console.error(`Error: ${result.error}`);
    console.log(`Duration: ${result.durationFormatted}`);
  }
} catch (error) {
  console.error('Caught exception:', (error as Error).message);
}
```

## 🎨 Practical Examples

### Example 1: Basic Usage with Callbacks

```typescript
const patchGen = new AdvancedPatchGenerator({
  compression: 6,
  verify: true,
  showProgress: true,
  onProgress: (progress) => {
    console.log(`📊 ${progress.percentage}% - ${progress.message}`);
  },
  onError: (error) => {
    console.error(`❌ ${error.message}`);
  },
  onComplete: (result) => {
    console.log(`✅ Patch created: ${result.patchFile.sizeFormatted}`);
  }
});

const result = await patchGen.createPatch(
  'original_file.txt',
  'new_file.txt',
  'patch.xdelta'
);
```

### Example 2: Usage with Events

```typescript
const patchGen = new AdvancedPatchGenerator({
  compression: 9,
  showProgress: false
});

// Custom progress bar
patchGen.on('progress', (data) => {
  const bar = '█'.repeat(Math.floor(data.percentage / 5)) + 
              '░'.repeat(20 - Math.floor(data.percentage / 5));
  process.stdout.write(`\r📊 [${bar}] ${data.percentage}%`);
});

patchGen.on('complete', (result) => {
  console.log(`\n✅ Completed! ${result.patchFile.sizeFormatted}`);
});

await patchGen.createPatch('old.txt', 'new.txt', 'patch.xdelta');
```

### Example 3: Large Files

```typescript
const patchGen = new AdvancedPatchGenerator({
  compression: 3, // Lower compression for large files
  largeFileThreshold: 100 * 1024 * 1024, // 100MB
  timeout: 600000, // 10 minutes
  memoryLimit: 1000 * 1024 * 1024 // 1GB
});

const result = await patchGen.createPatch(
  'large_original_file.bin',
  'large_new_file.bin',
  'large_patch.xdelta'
);

if (result.success) {
  console.log(`Method used: ${result.metrics.isLargeFile ? 'Chunked' : 'Standard'}`);
}
```

### Example 4: Batch Processing

```typescript
const patchGen = new AdvancedPatchGenerator({
  compression: 6,
  verify: true
});

// Create patches in batch
const createResults = await patchGen.createBatchPatches(
  'original_folder',
  'new_folder',
  'patches_folder',
  { maxParallel: 4 }
);

console.log(`Patches created: ${createResults.length}`);

// Apply patches in batch
const applyResults = await patchGen.applyBatchPatches(
  'original_folder',
  'patches_folder',
  'output_folder'
);

const successCount = applyResults.filter(r => r.status === 'success').length;
console.log(`Successfully applied: ${successCount}/${applyResults.length}`);
```

## 🔧 Advanced Configuration

### Compression Options

```typescript
const patchGen = new AdvancedPatchGenerator({
  compression: 9, // Maximum compression (slower)
  // compression: 0, // No compression (faster)
  // compression: 6, // Balanced compression (default)
});
```

### Large File Settings

```typescript
const patchGen = new AdvancedPatchGenerator({
  largeFileThreshold: 500 * 1024 * 1024, // 500MB
  timeout: 1800000, // 30 minutes
  memoryLimit: 2000 * 1024 * 1024, // 2GB
});
```

### Batch Processing Settings

```typescript
const results = await patchGen.createBatchPatches(
  'old_dir',
  'new_dir',
  'patches_dir',
  {
    maxParallel: 4, // Maximum 4 simultaneous operations
    compression: 6,
    verify: true
  }
);
```

## 📚 Additional Documentation

### For Developers and Contributors

- 📖 **[DEVELOPMENT.md](DEVELOPMENT.md)** - Complete developer guide
- 🧪 **[TESTING.md](TESTING.md)** - Tests and efficiency metrics
- 🤝 **[CONTRIBUTING.md](CONTRIBUTING.md)** - How to contribute to the project
- 📋 **[CHANGELOG.md](CHANGELOG.md)** - Change history

### Platform-Specific Guides

- 🪟 **[WINDOWS_GUIDE.md](WINDOWS_GUIDE.md)** - Complete Windows setup and usage guide

## 🔧 Troubleshooting

### Common Issues

#### Xdelta3 not found
The library includes `xdelta3-3.1.0.exe` and should work without installation. If you encounter this error:

1. **Verify the executable exists**: Check if `xdelta3-3.1.0.exe` is present in the project root
2. **Check file permissions**: Ensure the executable has proper permissions to run
3. **Use custom path**: If needed, you can specify a custom path:
   ```typescript
   const patchGen = new AdvancedPatchGenerator({
     xdeltaPath: "C:\\path\\to\\xdelta3.exe"
   });
   ```

#### Windows-specific Issues

**Problema**: "Xdelta3 executable not found" 
```bash
# Solução 1: Verificar se o arquivo existe
dir xdelta3-3.1.0.exe

# Solução 2: Verificar permissões
# Clique com botão direito no arquivo > Propriedades > Desbloquear

# Solução 3: Usar caminho personalizado
const patchGen = new AdvancedPatchGenerator({
  xdeltaPath: "C:\\caminho\\para\\xdelta3.exe"
});
```

**Problema**: Espaços nos caminhos dos arquivos
```javascript
// A biblioteca agora trata automaticamente espaços nos caminhos
// Mas se ainda houver problemas, use caminhos sem espaços
const result = await patchGen.createPatch(
  'C:\\My Files\\old.txt',  // ✅ Funciona
  'C:\\My Files\\new.txt',  // ✅ Funciona
  'C:\\My Files\\patch.xdelta'  // ✅ Funciona
);
```

#### Large file processing issues
- Increase timeout: `timeout: 1800000` (30 minutes)
- Increase memory limit: `memoryLimit: 2000 * 1024 * 1024` (2GB)
- Use lower compression: `compression: 3`

#### Permission errors
- Ensure write permissions to output directories
- Run with appropriate user privileges
- Check file system permissions

### Performance Tips

1. **For large files (>100MB):**
   - Use compression level 3-6
   - Set appropriate timeout and memory limits
   - Consider chunked processing

2. **For batch operations:**
   - Use `maxParallel: 4` for optimal performance
   - Monitor system resources
   - Implement proper error handling

3. **For production use:**
   - Always verify patches after creation
   - Implement proper logging
   - Use appropriate error handling strategies

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@advanced-patch-generator.com
- 🐛 Issues: [GitHub Issues](https://github.com/advanced-patch-generator/advanced-patch-generator/issues)
- 📖 Documentation: [GitHub Wiki](https://github.com/advanced-patch-generator/advanced-patch-generator/wiki)

## 🙏 Acknowledgments

- [Xdelta](https://github.com/jmacd/xdelta) - Delta encoding library
- [fs-extra](https://github.com/jprichardson/node-fs-extra) - File system utilities
- Node.js community for support and feedback

---

**⭐ If this project was useful to you, consider giving it a star on GitHub!**