/**
 * Resolves static asset URLs considering the Vite base path.
 * Handles both absolute URLs, data URIs, and configured paths like '/assets/...'.
 */
export function resolveAssetUrl(path) {
  if (!path || typeof path !== 'string') return '';
  if (/^(https?:|data:|\/\/|blob:)/.test(path)) return path;

  const base = import.meta.env.BASE_URL || './';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  return `${cleanBase}${cleanPath}`;
}
