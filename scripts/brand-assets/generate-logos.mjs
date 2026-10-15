/**
 * Builds each brand's logo and favicon (assets/brand/<key>/logo.svg and favicon.svg).
 *
 * - The mark is assets/brand/<key>/mark.png: a symbol designed in Optimizely Opal (the logo-studio
 *   agent, see docs/brand-kits.md) and cleaned up by prepare-mark.mjs. A small copy is embedded.
 * - The wordmark is the brand name converted to vector paths in the brand's heading font, so it stays
 *   crisp at any size (an SVG shown in an <img> cannot load web fonts). Fonts come from Google Fonts
 *   (SIL Open Font License) and are cached in .local/fonts.
 * - The favicon is the mark on a small rounded tile in the brand's background color, so it stays
 *   visible on dark browser tabs.
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import opentype from "opentype.js";

const sharp = createRequire(import.meta.url)("sharp");

const FONT_DIR = join(".local", "fonts");
const OUT_DIR = join("assets", "brand");

// key: folder and asset IDs (never changes). text: wordmark color. tile: favicon background.
const BRANDS = [
  { key: "lumenwork", name: "StoutWare", font: "Space Grotesk", weight: 700, text: "#171A3A", tile: "#F6F6FA", letterSpacing: -0.6 },
  { key: "stuchberys", name: "Stuchbery Acres", font: "Libre Caslon Text", weight: 700, text: "#2C3A2A", tile: "#F3EDE1", letterSpacing: 0.4 },
  { key: "harborline-mutual", name: "DeFeo Mutual", font: "DM Serif Display", weight: 400, text: "#152A4E", tile: "#FBF7F1", letterSpacing: 0 },
  { key: "clearwater-health", name: "St. Isaac\u2019s Health", font: "Merriweather Sans", weight: 700, text: "#0E4651", tile: "#F8FAF8", letterSpacing: -0.2 },
  { key: "ledgerwood-bank", name: "Ledgerwood Bank", font: "Manrope", weight: 800, text: "#0E3B2E", tile: "#FBFAF5", letterSpacing: -0.4 },
  { key: "tidewater-journeys", name: "Tidewater Journeys", font: "Playfair Display", weight: 700, text: "#0F3443", tile: "#F6F1E9", letterSpacing: 0 },
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

/** The mark as an embeddable PNG data URI at the given pixel size (palette-compressed to stay small). */
async function markDataUri(key, px) {
  const file = join(OUT_DIR, key, "mark.png");
  if (!existsSync(file)) throw new Error(`${file} is missing. Generate a mark in Opal and run prepare-mark.mjs first.`);
  const png = await sharp(file).resize(px, px).png({ palette: true, quality: 90, compressionLevel: 9 }).toBuffer();
  return `data:image/png;base64,${png.toString("base64")}`;
}

const xmlText = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

async function main() {
  for (const brand of BRANDS) {
    const font = await loadFont(brand.font, brand.weight);
    const markSize = 52;
    const gap = 14;
    const { d, box } = wordmarkPath(font, brand.name, 34, brand.letterSpacing);
    const textWidth = box.x2 - box.x1;
    const textHeight = box.y2 - box.y1;
    const height = Math.max(markSize, textHeight) + 4;
    const width = markSize + gap + textWidth + 4;
    const textX = markSize + gap - box.x1;
    const textY = (height - textHeight) / 2 - box.y1;
    const label = xmlText(brand.name);
    const logo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${round(width)} ${round(height)}" role="img" aria-label="${label}">
  <title>${label}</title>
  <image href="${await markDataUri(brand.key, 160)}" x="0" y="${round((height - markSize) / 2)}" width="${markSize}" height="${markSize}"/>
  <path transform="translate(${round(textX)} ${round(textY)})" d="${d}" fill="${brand.text}"/>
</svg>
`;
    const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="${label}">
  <title>${label}</title>
  <rect width="64" height="64" rx="14" fill="${brand.tile}"/>
  <rect x="0.5" y="0.5" width="63" height="63" rx="13.5" fill="none" stroke="${brand.text}" stroke-opacity="0.12"/>
  <image href="${await markDataUri(brand.key, 192)}" x="5" y="5" width="54" height="54"/>
</svg>
`;
    const dir = join(OUT_DIR, brand.key);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "logo.svg"), logo);
    writeFileSync(join(dir, "favicon.svg"), favicon);
    console.log(`${brand.key.padEnd(20)} logo ${round(width)}x${round(height)} (${Math.round(logo.length / 1024)} KB), favicon 64x64 (${Math.round(favicon.length / 1024)} KB)`);
  }
}

main().catch((error) => {
  console.error(`Logo generation stopped: ${error instanceof Error ? error.message : "unknown error"}`);
  process.exitCode = 1;
});
