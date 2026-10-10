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

// Safely load environment configuration from .env if present
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx > 0) {
        const k = trimmed.substring(0, idx).trim();
        const v = trimmed.substring(idx + 1).trim();
        if (!process.env[k]) {
          process.env[k] = v;
        }
      }
    }
  }
}

async function main() {
  console.log('🚀 Running CodeForge Master Acceptance Test Suite (23 Tests)...\n');

  try {
    const { runAcceptanceTests } = require('../src/tests/acceptance.ts');
    const results = await runAcceptanceTests();

    console.log('======================================================================');
    console.log('  CODEFORGE MASTER ACCEPTANCE TEST VERIFICATION MATRIX');
    console.log('======================================================================\n');

    let allPass = true;
    for (const res of results) {
      const icon = res.status === 'PASS' ? '✅' : res.status === 'BLOCKED' ? '⏸️' : '❌';
      console.log(`${icon} TEST ${res.testId}: [${res.status}] ${res.name}`);
      console.log(`   └─ ${res.details}\n`);
      if (res.status === 'FAIL') allPass = false;
    }

    const passedCount = results.filter((r) => r.status === 'PASS').length;
    const blockedCount = results.filter((r) => r.status === 'BLOCKED').length;
    const failedCount = results.filter((r) => r.status === 'FAIL').length;

    console.log('======================================================================');
    console.log(`Summary: ${passedCount} PASSED, ${blockedCount} BLOCKED, ${failedCount} FAILED (${results.length} total)`);
    console.log('======================================================================\n');

    process.exit(allPass ? 0 : 1);
  } catch (err) {
    console.error('Acceptance test execution error:', err);
    process.exit(1);
  }
}

main();
