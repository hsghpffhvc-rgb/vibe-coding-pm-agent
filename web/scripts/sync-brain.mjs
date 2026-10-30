// Keeps web/AGENTS.md in sync with the repo root so the file exists in
// deploy artifacts (Vercel builds from web/ and cannot reach the parent).
import { existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

const source = path.join(process.cwd(), '..', 'AGENTS.md');
const target = path.join(process.cwd(), 'AGENTS.md');

if (!existsSync(source)) {
  if (existsSync(target)) {
    console.log('[sync-brain] repo root AGENTS.md not found, keeping local copy');
  } else {
    console.log('[sync-brain] no AGENTS.md found, engine will use FALLBACK_BRAIN');
  }
} else {
  const incoming = readFileSync(source, 'utf8');
  const current = existsSync(target) ? readFileSync(target, 'utf8') : null;
  if (current !== incoming) {
    writeFileSync(target, incoming);
    console.log('[sync-brain] copied AGENTS.md from repo root');
  } else {
    console.log('[sync-brain] AGENTS.md already up to date');
  }
}
