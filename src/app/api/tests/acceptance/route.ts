import { NextResponse } from 'next/server';
import { runAcceptanceTests } from '../../../../tests/acceptance';

export async function GET() {
  try {
    const results = await runAcceptanceTests();
    const allPassed = results.every((r) => r.status === 'PASS');

    return NextResponse.json({
      allPassed,
      results,
      summary: {
        total: results.length,
        passed: results.filter((r) => r.status === 'PASS').length,
        failed: results.filter((r) => r.status === 'FAIL').length,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Acceptance test runner failed' }, { status: 500 });
  }
}
