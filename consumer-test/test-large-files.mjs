import AdvancedPatchGenerator from 'advanced-patch-generator';

const oldFile = "large_test_old.txt";
const newFile = "large_test_new.txt";
const patchFile = "large_test_patch.xdelta";

const pg = new AdvancedPatchGenerator({ 
  showProgress: true, 
  xdeltaPath: "xdelta3.exe",
  compression: 6
});

(async () => {
  console.log('🚀 Testando progresso com arquivos maiores...\n');
  console.log(`📁 Arquivo antigo: ${oldFile}`);
  console.log(`📁 Arquivo novo: ${newFile}`);
  console.log(`🎯 Arquivo de patch: ${patchFile}\n`);

  // Verificar Xdelta3
  const ok = await pg.checkXdelta();
  if (!ok) {
    console.log("❌ Xdelta3 não encontrado. Instale via Chocolatey/Scoop/Winget ou configure xdeltaPath.");
    process.exit(1);
  }

  console.log('🔧 Criando patch com progresso detalhado...\n');

  const result = await pg.createPatch(oldFile, newFile, patchFile, {
    onProgress: (data) => {
      // Mostra progresso detalhado com current/total
      if (data.current !== undefined && data.total !== undefined) {
        const currentKB = (data.current / 1024).toFixed(1);
        const totalKB = (data.total / 1024).toFixed(1);
        const percentage = data.percentage.toString().padStart(3);
        console.log(`📊 ${percentage}% - ${data.message} (${currentKB}KB / ${totalKB}KB)`);
      } else {
        const percentage = data.percentage.toString().padStart(3);
        console.log(`📊 ${percentage}% - ${data.message}`);
      }
    },
    onError: (error) => {
      console.error(`❌ Erro: ${error.message}`);
    },
    onComplete: (result) => {
      console.log(`\n✅ Patch criado com sucesso!`);
      console.log(`   Arquivo: ${result.patchFile.path}`);
      console.log(`   Tamanho: ${result.patchFile.sizeFormatted}`);
      console.log(`   Duração: ${result.metrics.durationFormatted}`);
      console.log(`   Razão de compressão: ${result.metrics.compressionRatio.toFixed(2)}x`);
    },
  });

  if (result.success) {
    console.log('\n🎉 Patch criado com sucesso!');
    console.log(`Tamanho do patch: ${result.patchFile.sizeFormatted}`);
    
    // Agora vamos aplicar o patch para demonstrar o progresso de aplicação
    console.log('\n🔧 Aplicando patch com progresso detalhado...\n');
    
    const applyResult = await pg.applyPatch(oldFile, patchFile, 'large_test_applied.txt', {
      onProgress: (data) => {
        // Mostra progresso detalhado com current/total
        if (data.current !== undefined && data.total !== undefined) {
          const currentKB = (data.current / 1024).toFixed(1);
          const totalKB = (data.total / 1024).toFixed(1);
          const percentage = data.percentage.toString().padStart(3);
          console.log(`📊 ${percentage}% - ${data.message} (${currentKB}KB / ${totalKB}KB)`);
        } else {
          const percentage = data.percentage.toString().padStart(3);
          console.log(`📊 ${percentage}% - ${data.message}`);
        }
      },
      onError: (error) => {
        console.error(`❌ Erro: ${error.message}`);
      },
      onComplete: (result) => {
        console.log(`\n✅ Patch aplicado com sucesso!`);
        console.log(`   Arquivo: ${result.newFile.path}`);
        console.log(`   Tamanho: ${result.newFile.sizeFormatted}`);
        console.log(`   Duração: ${result.metrics.durationFormatted}`);
      },
    });

    if (applyResult.success) {
      console.log('\n🎉 Patch aplicado com sucesso!');
      console.log(`Arquivo resultante: ${applyResult.newFile.sizeFormatted}`);
    } else {
      console.error('\n💥 Falha ao aplicar patch:', applyResult.error);
    }
  } else {
    console.error('\n💥 Falha ao criar patch:', result.error);
    process.exit(1);
  }
})();
