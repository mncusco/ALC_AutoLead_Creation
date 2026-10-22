// Copertina generata proceduralmente (SVG, deterministica dal titolo).
// Non è una foto — serve come immagine di testata finché non si collega
// un provider di generazione immagini (es. DALL-E, Stability, fal.ai).

const PALETTES = [
  { a: "#19233b", b: "#141c30", accent: "#d9a94c" },
  { a: "#1c2a26", b: "#15201d", accent: "#8fd4a8" },
  { a: "#2a1f1c", b: "#201712", accent: "#d98c4c" },
  { a: "#1a2333", b: "#131a27", accent: "#8fa3c8" },
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function generateCoverArt(seed: string): string {
  const h = hashString(seed);
  const palette = PALETTES[h % PALETTES.length];
  const peak1 = 140 + (h % 60);
  const peak2 = 90 + ((h >> 3) % 70);
  const peak3 = 160 + ((h >> 6) % 50);
  const sunX = 60 + (h % 340);
  const sunY = 40 + ((h >> 4) % 40);

  return `<svg viewBox="0 0 600 240" xmlns="http://www.w3.org/2000/svg">
<rect width="600" height="240" fill="${palette.a}"/>
<circle cx="${sunX}" cy="${sunY}" r="22" fill="${palette.accent}" opacity="0.9"/>
<path d="M0 ${200 - peak1 / 3} L90 ${140 - peak1 / 4} L160 ${190 - peak1 / 5} L240 ${100 - peak1 / 6} L320 ${170} L400 ${120} L480 ${180} L600 ${150} L600 240 L0 240 Z" fill="${palette.b}"/>
<path d="M0 220 Q150 ${220 - peak2 / 4} 300 215 T600 220 L600 240 L0 240 Z" fill="${palette.a}" opacity="0.7"/>
<path d="M20 ${210 - peak3 / 5} Q300 ${160} 580 ${205 - peak3 / 6}" stroke="${palette.accent}" stroke-width="1.5" opacity="0.5" fill="none"/>
</svg>`;
}
