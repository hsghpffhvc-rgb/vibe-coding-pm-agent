// Static build for GitHub Pages.
// Route handlers cannot be exported, so app/api is parked during the build and
// the client falls back to running the engine in the browser.
import { execSync } from 'child_process';
import { existsSync, renameSync } from 'fs';
import path from 'path';

const apiDir = path.join(process.cwd(), 'app', 'api');
const parked = path.join(process.cwd(), '.api-parked');

function restore() {
  if (existsSync(parked)) renameSync(parked, apiDir);
}

execSync('node scripts/sync-brain.mjs', { stdio: 'inherit' });

if (existsSync(apiDir)) renameSync(apiDir, parked);
process.on('exit', restore);
process.on('SIGINT', () => { restore(); process.exit(1); });

try {
  execSync('next build', { stdio: 'inherit', env: { ...process.env, STATIC_EXPORT: '1' } });
} finally {
  restore();
}

console.log('[build-static] output written to out/');
