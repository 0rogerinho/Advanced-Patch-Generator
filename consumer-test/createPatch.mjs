import AdvancedPatchGenerator from 'advanced-patch-generator';

// Create an instance
export const patchGen = new AdvancedPatchGenerator({
  compression: 6,
  verify: true,
  showProgress: true,
});

async function createPatch() {
  console.log('🚀 Iniciando criação de patch com callbacks...\n');

  const result = await patchGen.createPatch(
    './additional_old.grf',
    './additional_new.grf',
    './patch.xdelta',
    {
      onProgress: (data) => {
        // Mostra progresso detalhado com current/total
        if (data.current !== undefined && data.total !== undefined) {
          const currentMB = (data.current / (1024 * 1024)).toFixed(2);
          const totalMB = (data.total / (1024 * 1024)).toFixed(2);
          console.log(`📊 ${data.percentage}% - ${data.message} (${currentMB}MB / ${totalMB}MB)`);
        } else {
          console.log(`📊 ${data.percentage}% - ${data.message}`);
        }
      },
      onError: (error) => {
        console.error(`❌ Error: ${error.message}`);
      },
      onComplete: (result) => {
        console.log(`✅ Operation completed!`);
        console.log(`   Patch file: ${result.patchFile.path}`);
        console.log(`   Size: ${result.patchFile.sizeFormatted}`);
      },
    },
  );
  
  if (result.success) {
    console.log('\n🎉 Patch created successfully!');
    console.log(`Size: ${result.patchFile.sizeFormatted}`);
  } else {
    console.error('\n💥 Failed to create patch:', result.error);
  }
}

createPatch();
