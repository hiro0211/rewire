/**
 * rgba(r,g,b,a) or rgb(r,g,b) string to { hex, alpha }.
 * Returns null for invalid input.
 */
export function parseRgba(rgba: string): { hex: string; alpha: number } | null {
  const m = rgba.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/);
  if (!m) return null;

  const r = parseInt(m[1], 10);
  const g = parseInt(m[2], 10);
  const b = parseInt(m[3], 10);
  const a = m[4] !== undefined ? parseFloat(m[4]) : 1;

  const hex =
    '#' +
    r.toString(16).toUpperCase().padStart(2, '0') +
    g.toString(16).toUpperCase().padStart(2, '0') +
    b.toString(16).toUpperCase().padStart(2, '0');

  return { hex, alpha: a };
}
