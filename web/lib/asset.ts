// GitHub Pages project sites are served from /<repo>, so public assets need
// the same base path that next.config.mjs applies to bundled assets.
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function asset(path: string): string {
  return BASE_PATH + path;
}
