/**
 * Turns a logo mark image generated in Opal (flat colors on a white background) into a clean, square,
 * transparent PNG: assets/brand/<key>/mark.png. generate-logos.mjs then builds the logo and favicon from it.
 *
 *   npm run logos:prepare -- <input.png> <brand key>
 *
 * White becomes transparent. Anti-aliased edges get partial transparency with the white removed from their
 * color, so the mark sits cleanly on any light background. Solid brand colors stay fully opaque.
 */
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const KEYS = ["lumenwork", "stuchberys", "harborline-mutual", "clearwater-health", "ledgerwood-bank", "tidewater-journeys"];
const OUT_SIZE = 512;
const MARGIN = 0.06; // empty space around the mark, as a share of the side
const TRANSPARENT_BELOW = 0.035; // how far from white a pixel must be to count as part of the mark
const OPAQUE_ABOVE = 0.55; // brand colors are well beyond this, so they stay solid

const [input, key] = process.argv.slice(2);
if (!input || !KEYS.includes(key)) {
  console.error(`Usage: npm run logos:prepare -- <input.png> <${KEYS.join("|")}>`);
  process.exit(2);
}

const smoothstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

const { data, info } = await sharp(input).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const out = Buffer.alloc(info.width * info.height * 4);
for (let i = 0, o = 0; i < data.length; i += 3, o += 4) {
  const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
  // The least opacity that could produce this color over white.
  const a = Math.max(255 - r, 255 - g, 255 - b) / 255;
  if (a < TRANSPARENT_BELOW) continue; // stays fully transparent
  const alpha = smoothstep(TRANSPARENT_BELOW, OPAQUE_ABOVE, a);
  // Remove the white that the edge was blended with, so edges keep the mark's own color.
  const unmix = (c) => (alpha >= 1 ? c : Math.round(Math.min(255, Math.max(0, (c - (1 - a) * 255) / a))));
  out[o] = unmix(r); out[o + 1] = unmix(g); out[o + 2] = unmix(b);
  out[o + 3] = Math.round(alpha * 255);
}

const trimmed = await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
  .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 1 })
  .png()
  .toBuffer({ resolveWithObject: true });
const side = Math.round(Math.max(trimmed.info.width, trimmed.info.height) / (1 - 2 * MARGIN));
const padX = side - trimmed.info.width;
const padY = side - trimmed.info.height;
const dir = join("assets", "brand", key);
mkdirSync(dir, { recursive: true });
// sharp always resizes before it extends within one pipeline, so pad first and resize in a second pass.
const square = await sharp(trimmed.data)
  .extend({ left: Math.floor(padX / 2), right: Math.ceil(padX / 2), top: Math.floor(padY / 2), bottom: Math.ceil(padY / 2), background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();
await sharp(square)
  .resize(OUT_SIZE, OUT_SIZE, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9 })
  .toFile(join(dir, "mark.png"));
console.log(`${key.padEnd(20)} mark.png ${OUT_SIZE}x${OUT_SIZE} (from ${info.width}x${info.height}, trimmed to ${trimmed.info.width}x${trimmed.info.height})`);
