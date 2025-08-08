#!/usr/bin/env node

import AdvancedPatchGenerator from './lib/AdvancedPatchGenerator.js';
import PatchAnalyzer from './lib/PatchAnalyzer.js';
import { MetricsUtils, DisplayUtils } from './utils/index.js';
import { FileValidation } from './validations/index.js';
import { DEFAULT_OPTIONS, MESSAGES } from './constants/index.js';

/**
 * Advanced Patch Generator
 * Main entry point of the library
 */

// Export the main class
export default AdvancedPatchGenerator;

// Export utilities for direct use
export {
  PatchAnalyzer,
  MetricsUtils,
  DisplayUtils,
  FileValidation,
  DEFAULT_OPTIONS,
  MESSAGES,
};

// Export types
export * from './types/index.js';

// Simple CLI if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log('🚀 Advanced Patch Generator');
    console.log('===========================\n');
    console.log('Usage:');
    console.log('  node dist/index.js <command> [options]\n');
    console.log('Commands:');
    console.log('  check     - Check if Xdelta3 is available');
    console.log('  info      - Show file information');
    console.log('  create    - Create a patch');
    console.log('  apply     - Apply a patch');
    console.log('  verify    - Verify patch integrity');
    console.log('  --help    - Show this help\n');
    console.log('Examples:');
    console.log('  node dist/index.js check');
    console.log('  node dist/index.js create old.txt new.txt patch.xdelta');
    console.log('  node dist/index.js apply old.txt patch.xdelta new.txt');
    console.log(
      '  node dist/index.js verify old.txt patch.xdelta expected.txt'
    );
    console.log('\nFor programmatic use, import the library:');
    console.log(
      '  import AdvancedPatchGenerator from "advanced-patch-generator";'
    );
    process.exit(0);
  }

  const command = args[0];

  async function runCLI(): Promise<void> {
    const patchGen = new AdvancedPatchGenerator({
      showProgress: true,
    });

    try {
      switch (command) {
        case 'check':
          console.log('🔍 Checking Xdelta3...');
          const isAvailable = await patchGen.checkXdelta();
          if (isAvailable) {
            console.log('✅ Xdelta3 is available!');
          } else {
            console.log('❌ Xdelta3 not found.');
            console.log('💡 Install Xdelta3 first.');
          }
          break;

        case 'info':
          if (args.length < 2) {
            console.log('❌ Usage: info <file>');
            process.exit(1);
          }
          const filePath = args[1]!;
          const fileInfo = await patchGen.getFileInfo(filePath);
          if (fileInfo.exists) {
            console.log(`📁 File: ${filePath}`);
            console.log(`📏 Size: ${fileInfo.sizeFormatted}`);
            console.log(`📅 Modified: ${fileInfo.modified}`);
          } else {
            console.log(`❌ File not found: ${filePath}`);
          }
          break;

        case 'create':
          if (args.length < 4) {
            console.log(
              '❌ Usage: create <original_file> <new_file> <output_patch>'
            );
            process.exit(1);
          }
          const [oldFile, newFile, patchFile] = args.slice(1);
          console.log('📦 Creating patch...');
          const result = await patchGen.createPatch(
            oldFile!,
            newFile!,
            patchFile!
          );
          if (result.success) {
            console.log('✅ Patch created successfully!');
            console.log(`   Size: ${result.patchFile.sizeFormatted}`);
            console.log(`   Duration: ${result.metrics.durationFormatted}`);
          } else {
            console.log('❌ Error creating patch:', result.error);
            process.exit(1);
          }
          break;

        case 'apply':
          if (args.length < 4) {
            console.log(
              '❌ Usage: apply <original_file> <patch> <output_file>'
            );
            process.exit(1);
          }
          const [oldFileApply, patchFileApply, newFileApply] = args.slice(1);
          console.log('🔧 Applying patch...');
          const applyResult = await patchGen.applyPatch(
            oldFileApply!,
            patchFileApply!,
            newFileApply!
          );
          if (applyResult.success) {
            console.log('✅ Patch applied successfully!');
          } else {
            console.log('❌ Error applying patch:', applyResult.error);
            process.exit(1);
          }
          break;

        case 'verify':
          if (args.length < 4) {
            console.log(
              '❌ Usage: verify <original_file> <patch> <expected_file>'
            );
            process.exit(1);
          }
          const [oldFileVerify, patchFileVerify, expectedFile] = args.slice(1);
          console.log('🔍 Verifying integrity...');
          const verifyResult = await patchGen.verifyPatch(
            oldFileVerify!,
            patchFileVerify!,
            expectedFile!
          );
          if (verifyResult.isValid) {
            console.log('✅ Patch is valid!');
          } else {
            console.log('❌ Patch is invalid!');
            process.exit(1);
          }
          break;

        default:
          console.log(`❌ Unknown command: ${command}`);
          console.log('💡 Use --help to see available commands.');
          process.exit(1);
      }
    } catch (error) {
      console.error('❌ Error:', (error as Error).message);
      process.exit(1);
    }
  }

  runCLI();
}
