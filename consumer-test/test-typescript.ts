import AdvancedPatchGenerator from 'advanced-patch-generator';
import fs from 'fs-extra';

// Create an instance
const patchGen = new AdvancedPatchGenerator({
  compression: 6,
  verify: true,
  showProgress: true,
});

async function createPatch() {
  console.log('🚀 Iniciando teste TypeScript com callbacks...\n');

  const result = await patchGen.createPatch(
    './additional_old.grf',
    './additional_new.grf',
    './patch_typescript.xdelta',
    {
      onProgress: data => {
        console.log(`📊 [TS] ${data.percentage}% - ${data.message}`);
      },
      onError: error => {
        console.error(`❌ [TS] Error: ${error.message}`);
      },
      onComplete: result => {
        console.log(`✅ [TS] Operation completed!`);
        console.log(`   Patch file: ${result.patchFile.path}`);
        console.log(`   Size: ${result.patchFile.sizeFormatted}`);
      },
    }
  );

  if (result.success) {
    console.log('\n🎉 [TS] Patch created successfully!');
    console.log(`Size: ${result.patchFile.sizeFormatted}`);
  } else {
    console.error('\n💥 [TS] Failed to create patch:', result.error);
  }
}

async function applyPatch() {
  console.log('\n🔧 Aplicando patch TypeScript...\n');

  const result = await patchGen.applyPatch(
    './additional_old.grf',
    './patch_typescript.xdelta',
    './applied_typescript.grf',
    {
      onProgress: data => {
        console.log(`📊 [TS] ${data.percentage}% - ${data.message}`);
      },
      onError: error => {
        console.error(`❌ [TS] Error: ${error.message}`);
      },
      onComplete: result => {
        console.log(`✅ [TS] Patch applied successfully!`);
        console.log(`   New file: ${result.newFile.path}`);
        console.log(`   Size: ${result.newFile.sizeFormatted}`);
      },
    }
  );

  if (result.success) {
    console.log('\n🎉 [TS] Patch applied successfully!');
    console.log(`New file: ${result.newFile.sizeFormatted}`);
  } else {
    console.error('\n💥 [TS] Failed to apply patch:', result.error);
  }
}

async function testWithEvents() {
  console.log('\n🎭 Testando com eventos TypeScript...\n');

  // Configure events
  patchGen.on('progress', data => {
    console.log(`📊 [TS-Events] ${data.percentage}% - ${data.message}`);
  });

  patchGen.on('error', error => {
    console.error(`❌ [TS-Events] Error: ${error.message}`);
  });

  patchGen.on('complete', result => {
    console.log(`✅ [TS-Events] Operation completed!`);
  });

  const result = await patchGen.createPatch(
    './additional_old.grf',
    './additional_new.grf',
    './patch_events.xdelta'
  );

  if (result.success) {
    console.log('\n🎉 [TS-Events] Patch created successfully!');
  }
}

async function main() {
  try {
    // Test with callbacks
    await createPatch();

    // Test with events
    await testWithEvents();

    // Test apply patch
    await applyPatch();
  } catch (error) {
    console.error('💥 Main error:', error);
  }
}

main();
