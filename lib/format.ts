// lib/format.ts
export function fmtMins(ms: number) {
  const m = Math.round(ms / 60000);
  return `${m} min${m === 1 ? "" : "s"}`;
}
export function fmtPct(n: number) {
  return `${Math.round(n * 100)}%`;
}
