const path = require('path');
const fs = require('fs');
const ts = require('typescript');

// Hook into require for .ts files
require.extensions['.ts'] = function (module, filename) {
  const fileContent = fs.readFileSync(filename, 'utf-8');
  const compiled = ts.transpileModule(fileContent, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
      allowJs: true,
    },
  }).outputText;
  module._compile(compiled, filename);
};

async function main() {
  console.log('🚀 Running CodeForge Phase 1 Acceptance Test Suite...\n');

  try {
    const { runAcceptanceTests } = require('../src/tests/acceptance.ts');
    const results = await runAcceptanceTests();

    console.log('======================================================================');
    console.log('  CODEFORGE PHASE 1 ACCEPTANCE TEST VERIFICATION MATRIX');
    console.log('======================================================================\n');

    let allPass = true;
    for (const res of results) {
      const icon = res.status === 'PASS' ? '✅' : '❌';
      console.log(`${icon} TEST ${res.testId}: [${res.status}] ${res.name}`);
      console.log(`   └─ ${res.details}\n`);
      if (res.status !== 'PASS') allPass = false;
    }

    console.log('======================================================================');
    console.log(`Summary: ${results.filter((r) => r.status === 'PASS').length}/${results.length} PASSED`);
    console.log('======================================================================\n');

    process.exit(allPass ? 0 : 1);
  } catch (err) {
    console.error('Acceptance test execution error:', err);
    process.exit(1);
  }
}

main();
