import AdvancedPatchGenerator from 'advanced-patch-generator';
import fs from 'fs-extra';

// Create an instance with correct xdelta path
const patchGen = new AdvancedPatchGenerator({
  compression: 6,
  verify: true,
  showProgress: true,
  xdeltaPath: 'xdelta3.exe'
});

async function createPatch() {
  console.log('🚀 Iniciando teste JavaScript com callbacks...\n');

  const result = await patchGen.createPatch(
    './additional_old.grf',
    './additional_new.grf',
    './patch_javascript.xdelta',
    {
      onProgress: (data) => {
        console.log(`📊 [JS] ${data.percentage}% - ${data.message}`);
      },
      onError: (error) => {
        console.error(`❌ [JS] Error: ${error.message}`);
      },
      onComplete: (result) => {
        console.log(`✅ [JS] Operation completed!`);
        console.log(`   Patch file: ${result.patchFile.path}`);
        console.log(`   Size: ${result.patchFile.sizeFormatted}`);
      },
    },
  );
  
  if (result.success) {
    console.log('\n🎉 [JS] Patch created successfully!');
    console.log(`Size: ${result.patchFile.sizeFormatted}`);
  } else {
    console.error('\n💥 [JS] Failed to create patch:', result.error);
  }
}

async function applyPatch() {
  console.log('\n🔧 Aplicando patch JavaScript...\n');

  const result = await patchGen.applyPatch(
    './additional_old.grf',
    './patch_javascript.xdelta',
    './applied_javascript.grf',
    {
      onProgress: (data) => {
        console.log(`📊 [JS] ${data.percentage}% - ${data.message}`);
      },
      onError: (error) => {
        console.error(`❌ [JS] Error: ${error.message}`);
      },
      onComplete: (result) => {
        console.log(`✅ [JS] Patch applied successfully!`);
        console.log(`   New file: ${result.newFile.path}`);
        console.log(`   Size: ${result.newFile.sizeFormatted}`);
      },
    },
  );
  
  if (result.success) {
    console.log('\n🎉 [JS] Patch applied successfully!');
    console.log(`New file: ${result.newFile.sizeFormatted}`);
  } else {
    console.error('\n💥 [JS] Failed to apply patch:', result.error);
  }
}

async function testWithEvents() {
  console.log('\n🎭 Testando com eventos JavaScript...\n');

  // Configure events
  patchGen.on('progress', (data) => {
    console.log(`📊 [JS-Events] ${data.percentage}% - ${data.message}`);
  });

  patchGen.on('error', (error) => {
    console.error(`❌ [JS-Events] Error: ${error.message}`);
  });

  patchGen.on('complete', (result) => {
    console.log(`✅ [JS-Events] Operation completed!`);
  });

  const result = await patchGen.createPatch(
    './additional_old.grf',
    './additional_new.grf',
    './patch_events_js.xdelta'
  );
  
  if (result.success) {
    console.log('\n🎉 [JS-Events] Patch created successfully!');
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
