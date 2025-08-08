import AdvancedPatchGenerator from '../dist/index.js';
import type { PatchResult, ApplyPatchResult } from '../dist/index.js';

/**
 * TypeScript example for Advanced Patch Generator
 */
async function main() {
  console.log('🚀 Advanced Patch Generator - TypeScript Example');
  console.log('================================================\n');

  // Create an instance with TypeScript types
  const patchGen = new AdvancedPatchGenerator({
    compression: 6,
    verify: true,
    showProgress: true,
    onProgress: progress => {
      console.log(`📊 Progress: ${progress.percentage}% - ${progress.message}`);
    },
    onError: error => {
      console.error(`❌ Error: ${error.message}`);
    },
    onComplete: result => {
      console.log('✅ Operation completed!');
    },
  });

  try {
    // Check if Xdelta3 is available
    console.log('🔍 Checking Xdelta3 availability...');
    const isAvailable = await patchGen.checkXdelta();

    if (!isAvailable) {
      console.log('❌ Xdelta3 not found. Please install it first.');
      return;
    }

    console.log('✅ Xdelta3 is available!\n');

    // Get file information
    console.log('📁 Getting file information...');
    const fileInfo = await patchGen.getFileInfo('example.txt');
    console.log(`File exists: ${fileInfo.exists}`);
    console.log(`File size: ${fileInfo.sizeFormatted}\n`);

    // Create a patch
    console.log('📦 Creating patch...');
    const patchResult: PatchResult = await patchGen.createPatch(
      'old.txt',
      'new.txt',
      'patch.xdelta'
    );

    if (patchResult.success) {
      console.log('✅ Patch created successfully!');
      console.log(`Patch size: ${patchResult.patchFile.sizeFormatted}`);
      console.log(
        `Compression ratio: ${patchResult.metrics.compressionRatio}%`
      );
      console.log(`Duration: ${patchResult.metrics.durationFormatted}\n`);

      // Apply the patch
      console.log('🔧 Applying patch...');
      const applyResult: ApplyPatchResult = await patchGen.applyPatch(
        'old.txt',
        'patch.xdelta',
        'applied.txt'
      );

      if (applyResult.success) {
        console.log('✅ Patch applied successfully!');
        console.log(`New file size: ${applyResult.newFile.sizeFormatted}`);
        console.log(`Duration: ${applyResult.metrics.durationFormatted}\n`);

        // Verify the patch
        console.log('🔍 Verifying patch integrity...');
        const verifyResult = await patchGen.verifyPatch(
          'old.txt',
          'patch.xdelta',
          'new.txt'
        );

        if (verifyResult.isValid) {
          console.log('✅ Patch is valid!');
        } else {
          console.log('❌ Patch is invalid!');
        }
      } else {
        console.log(`❌ Failed to apply patch: ${applyResult.error}`);
      }
    } else {
      console.log(`❌ Failed to create patch: ${patchResult.error}`);
    }
  } catch (error) {
    console.error('❌ Unexpected error:', (error as Error).message);
  }
}

// Run the example
main().catch(console.error);
