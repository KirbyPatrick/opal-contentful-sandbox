/**
 * Phase 5: generates original SVG wordmark logos and favicons for each brand.
 *
 * The wordmark text is converted to vector paths using the brand's heading
 * font, so the logo renders the same everywhere (an SVG shown in an <img>
 * cannot load web fonts). Fonts come from Google Fonts (SIL Open Font
 * License) and are cached in .local/fonts. Output: assets/brand/<slug>/.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import opentype from "opentype.js";

const FONT_DIR = join(".local", "fonts");
const OUT_DIR = join("assets", "brand");

const BRANDS = [
  {
    slug: "lumenwork", name: "StoutWare", font: "Space Grotesk", weight: 700, text: "#1F2A44", letterSpacing: -0.5,
    // Amber disc with three navy steps: work moving forward in the light.
    symbol: (s) => `<circle cx="${s / 2}" cy="${s / 2}" r="${s / 2}" fill="#F2A33A"/>
      <rect x="${s * 0.24}" y="${s * 0.58}" width="${s * 0.16}" height="${s * 0.16}" rx="${s * 0.02}" fill="#1F2A44"/>
      <rect x="${s * 0.42}" y="${s * 0.44}" width="${s * 0.16}" height="${s * 0.3}" rx="${s * 0.02}" fill="#1F2A44"/>
      <rect x="${s * 0.6}" y="${s * 0.3}" width="${s * 0.16}" height="${s * 0.44}" rx="${s * 0.02}" fill="#1F2A44"/>`,
  },
  {
    slug: "stuchberys", name: "Stuchbery Acres", font: "Libre Caslon Text", weight: 700, text: "#2F4A3A", letterSpacing: 0.5,
    // A fieldstone: a soft, irregular forest green stone with a cream "S" monogram.
    monogram: { letter: "S", fill: "#F5EFE3" },
    symbol: (s) => `<path d="M${s * 0.18} ${s * 0.22} Q${s * 0.34} ${s * 0.04} ${s * 0.6} ${s * 0.06} Q${s * 0.92} ${s * 0.1} ${s * 0.95} ${s * 0.44} Q${s * 0.98} ${s * 0.84} ${s * 0.6} ${s * 0.94} Q${s * 0.18} ${s * 1.0} ${s * 0.06} ${s * 0.68} Q${s * 0.0} ${s * 0.4} ${s * 0.18} ${s * 0.22} Z" fill="#2F4A3A"/>`,
  },
  {
    slug: "harborline-mutual", name: "DeFeo Mutual", font: "DM Serif Display", weight: 400, text: "#12355B", letterSpacing: 0,
    // A harbor at dusk: navy circle, sea-glass waves, coral horizon.
    symbol: (s) => `<circle cx="${s / 2}" cy="${s / 2}" r="${s / 2}" fill="#12355B"/>
      <rect x="${s * 0.2}" y="${s * 0.36}" width="${s * 0.6}" height="${s * 0.07}" rx="${s * 0.035}" fill="#C9472F"/>
      <path d="M${s * 0.18} ${s * 0.58} q${s * 0.08} ${-s * 0.06} ${s * 0.16} 0 t${s * 0.16} 0 t${s * 0.16} 0 t${s * 0.16} 0" stroke="#7FB7BE" stroke-width="${s * 0.06}" fill="none" stroke-linecap="round"/>
      <path d="M${s * 0.26} ${s * 0.72} q${s * 0.06} ${-s * 0.05} ${s * 0.12} 0 t${s * 0.12} 0 t${s * 0.12} 0 t${s * 0.12} 0" stroke="#7FB7BE" stroke-width="${s * 0.05}" fill="none" stroke-linecap="round"/>`,
  },
  {
    slug: "clearwater-health", name: "St. Isaac's Health", font: "Merriweather Sans", weight: 700, text: "#163E5C", letterSpacing: 0,
    // A clear drop with a gentle cross inside.
    symbol: (s) => `<path d="M${s / 2} ${s * 0.04} C${s * 0.72} ${s * 0.32} ${s * 0.88} ${s * 0.5} ${s * 0.88} ${s * 0.64} A${s * 0.38} ${s * 0.36} 0 0 1 ${s * 0.12} ${s * 0.64} C${s * 0.12} ${s * 0.5} ${s * 0.28} ${s * 0.32} ${s / 2} ${s * 0.04} Z" fill="#0F7C8C"/>
      <rect x="${s * 0.44}" y="${s * 0.46}" width="${s * 0.12}" height="${s * 0.34}" rx="${s * 0.03}" fill="#FFFFFF"/>
      <rect x="${s * 0.33}" y="${s * 0.57}" width="${s * 0.34}" height="${s * 0.12}" rx="${s * 0.03}" fill="#FFFFFF"/>`,
  },
  {
    slug: "ledgerwood-bank", name: "Ledgerwood Bank", font: "Manrope", weight: 800, text: "#114B3F", letterSpacing: -0.3,
    // Ledger lines stacked into an evergreen tree.
    symbol: (s) => `<rect width="${s}" height="${s}" rx="${s * 0.18}" fill="#114B3F"/>
      <rect x="${s * 0.4}" y="${s * 0.2}" width="${s * 0.2}" height="${s * 0.08}" rx="${s * 0.04}" fill="#C8A24B"/>
      <rect x="${s * 0.3}" y="${s * 0.36}" width="${s * 0.4}" height="${s * 0.08}" rx="${s * 0.04}" fill="#C8A24B"/>
      <rect x="${s * 0.2}" y="${s * 0.52}" width="${s * 0.6}" height="${s * 0.08}" rx="${s * 0.04}" fill="#C8A24B"/>
      <rect x="${s * 0.45}" y="${s * 0.66}" width="${s * 0.1}" height="${s * 0.16}" rx="${s * 0.02}" fill="#C8A24B"/>`,
  },
  {
    slug: "tidewater-journeys", name: "Tidewater Journeys", font: "Playfair Display", weight: 700, text: "#0B3B4F", letterSpacing: 0,
    // A terracotta sun setting over two tide lines.
    symbol: (s) => `<circle cx="${s / 2}" cy="${s / 2}" r="${s / 2}" fill="#0B3B4F"/>
      <path d="M${s * 0.26} ${s * 0.56} A${s * 0.24} ${s * 0.24} 0 0 1 ${s * 0.74} ${s * 0.56} Z" fill="#B85A33"/>
      <rect x="${s * 0.18}" y="${s * 0.62}" width="${s * 0.64}" height="${s * 0.05}" rx="${s * 0.025}" fill="#C9B79C"/>
      <rect x="${s * 0.28}" y="${s * 0.72}" width="${s * 0.44}" height="${s * 0.05}" rx="${s * 0.025}" fill="#C9B79C"/>`,
  },
];

/** Downloads a static TTF for one family and weight from Google Fonts (cached). */
async function loadFont(family, weight) {
  const file = join(FONT_DIR, `${family.replace(/\s+/g, "-")}-${weight}.ttf`);
  if (!existsSync(file)) {
    const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}`;
    // A plain user agent makes Google Fonts serve TTF instead of WOFF2.
    const css = await (await fetch(cssUrl, { headers: { "User-Agent": "curl/8" } })).text();
    const match = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.ttf)\)/);
    if (!match) throw new Error(`No TTF found for ${family} ${weight}.`);
    const response = await fetch(match[1]);
    if (!response.ok) throw new Error(`Font download failed for ${family} (HTTP ${response.status}).`);
    mkdirSync(FONT_DIR, { recursive: true });
    writeFileSync(file, Buffer.from(await response.arrayBuffer()));
  }
  const buffer = readFileSync(file);
  return opentype.parse(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
}

/**
 * Lays glyphs out one by one with pair kerning. (opentype.js full shaping
 * produced invalid path data for some letter pairs, so it is not used.)
 */
function wordmarkPath(font, text, size, letterSpacing) {
  const scale = size / font.unitsPerEm;
  const glyphs = Array.from(text, (char) => font.charToGlyph(char));
  const box = { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity };
  const parts = [];
  let x = 0;
  glyphs.forEach((glyph, index) => {
    // Round the pen position: opentype.js can emit NaN when formatting coordinates with float noise.
    const path = glyph.getPath(Math.round(x * 100) / 100, 0, size);
    const glyphBox = path.getBoundingBox();
    if (Number.isFinite(glyphBox.x1) && glyphBox.x2 > glyphBox.x1) {
      box.x1 = Math.min(box.x1, glyphBox.x1);
      box.y1 = Math.min(box.y1, glyphBox.y1);
      box.x2 = Math.max(box.x2, glyphBox.x2);
      box.y2 = Math.max(box.y2, glyphBox.y2);
    }
    const data = path.toPathData(2);
    if (data.includes("NaN")) throw new Error(`Invalid path data for "${text}" at character ${index} (x=${x}).`);
    parts.push(data);
    const next = glyphs[index + 1];
    const pairKerning = next ? font.getKerningValue(glyph, next) : 0;
    const kerning = Number.isFinite(pairKerning) ? pairKerning : 0;
    x += (glyph.advanceWidth + kerning) * scale + letterSpacing;
  });
  const d = parts.join("");
  if (d.includes("NaN")) throw new Error(`Invalid path data for "${text}".`);
  return { d, box };
}

const round = (n) => Math.round(n * 100) / 100;

/** Symbol markup, plus an optional centered letter drawn from the brand font. */
function symbolMarkup(brand, font, size) {
  if (!brand.monogram) return brand.symbol(size);
  const { d, box } = wordmarkPath(font, brand.monogram.letter, size * 0.62, 0);
  const dx = size / 2 - (box.x1 + box.x2) / 2;
  const dy = size / 2 - (box.y1 + box.y2) / 2;
  return `${brand.symbol(size)}<path transform="translate(${round(dx)} ${round(dy)})" d="${d}" fill="${brand.monogram.fill}"/>`;
}

async function main() {
  for (const brand of BRANDS) {
    const font = await loadFont(brand.font, brand.weight);
    const symbolSize = 48;
    const gap = 14;
    const { d, box } = wordmarkPath(font, brand.name, 34, brand.letterSpacing);
    const textWidth = box.x2 - box.x1;
    const textHeight = box.y2 - box.y1;
    const height = Math.max(symbolSize, textHeight) + 8;
    const width = symbolSize + gap + textWidth + 4;
    const textX = symbolSize + gap - box.x1;
    const textY = (height - textHeight) / 2 - box.y1;
    const logo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${round(width)} ${round(height)}" role="img" aria-label="${brand.name}">
  <title>${brand.name}</title>
  <g transform="translate(0 ${round((height - symbolSize) / 2)})">${symbolMarkup(brand, font, symbolSize)}</g>
  <path transform="translate(${round(textX)} ${round(textY)})" d="${d}" fill="${brand.text}"/>
</svg>
`;
    const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="${brand.name}">
  <title>${brand.name}</title>
  <g transform="translate(4 4)">${symbolMarkup(brand, font, 56)}</g>
</svg>
`;
    const dir = join(OUT_DIR, brand.slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "logo.svg"), logo.replace(/\n\s+</g, "\n  <"));
    writeFileSync(join(dir, "favicon.svg"), favicon.replace(/\n\s+</g, "\n  <"));
    console.log(`${brand.slug.padEnd(20)} logo ${round(width)}x${round(height)}, favicon 64x64`);
  }
}

main().catch((error) => {
  console.error(`Logo generation stopped: ${error instanceof Error ? error.message : "unknown error"}`);
  process.exitCode = 1;
});
