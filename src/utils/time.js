import { NOW } from "../data/Tasks";

/**
 * Format an ISO timestamp as a human-readable relative time.
 * @param {string} iso
 * @param {string} [nowIso]
 * @returns {string}
 */
export function relativeTime(iso, nowIso = NOW) {
  const t = new Date(iso).getTime();
  const n = new Date(nowIso).getTime();
  const diffMin = Math.round((n - t) / 60000);
  if (diffMin < 0) {
    const f = -diffMin;
    if (f < 60) return `in ${f}m`;
    if (f < 60 * 24) return `in ${Math.round(f / 60)}h`;
    return `in ${Math.round(f / (60 * 24))}d`;
  }
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `${diffH}h ago`;
  const diffD = Math.round(diffH / 24);
  if (diffD === 1) return "yesterday";
  return `${diffD}d ago`;
}
