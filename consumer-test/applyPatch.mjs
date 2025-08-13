import AdvancedPatchGenerator from 'advanced-patch-generator';
import { promises as fs } from 'fs';

const oldFile = "additional_old.grf";
const newFile = "applied_file.grf";
const patchFile = "patch.xdelta";

const pg = new AdvancedPatchGenerator({ showProgress: true, xdeltaPath: "xdelta3.exe" });

(async () => {
  // Garante arquivos necessários de teste
  try {
    await fs.access(oldFile);
  } catch {
    await fs.writeFile(oldFile, "Linha A\nLinha B\n");
  }
  try {
    await fs.access(patchFile);
  } catch {
    console.log(" patch.xdelta não encontrado. Execute primeiro: node createPatch.mjs");
    process.exit(1);
  }

  const ok = await pg.checkXdelta();
  if (!ok) {
    console.log(" Xdelta3 não encontrado. Instale via Chocolatey/Scoop/Winget ou configure xdeltaPath.");
    process.exit(1);
  }

  console.log('🔧 Aplicando patch com callbacks...\n');

  const res = await pg.applyPatch(oldFile, patchFile, newFile, {
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
      console.log(`✅ Patch applied successfully!`);
      console.log(`   New file: ${result.newFile.path}`);
      console.log(`   Size: ${result.newFile.sizeFormatted}`);
    },
  });

  if (res.success) {
    console.log('\n🎉 Patch aplicado com sucesso!');
    console.log(`New file: ${res.newFile.sizeFormatted}`);
  } else {
    console.error('\n💥 Falha ao aplicar patch:', res.error);
    process.exit(1);
  }
})();
