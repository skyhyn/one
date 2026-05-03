const TIERS = [
  { v: 1e12, s: 'T' },
  { v: 1e9,  s: 'B' },
  { v: 1e6,  s: 'M' },
  { v: 1e3,  s: 'K' },
];

export function fmt(n) {
  n = Math.floor(n);
  for (const { v, s } of TIERS) {
    if (n >= v) return (n / v).toFixed(1).replace(/\.0$/, '') + s;
  }
  return String(n);
}
