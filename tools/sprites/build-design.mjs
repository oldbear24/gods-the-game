// Vyrenderuje návrhové varianty Truplika do design/sprites a jeden společný přehledový obrázek.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Canvas, encodePNG } from './px.mjs';
import { VARIANTS, drawTruplik } from './truplik.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const outDir = path.join(root, 'design', 'sprites');
fs.mkdirSync(outDir, { recursive: true });

const keys = Object.keys(VARIANTS);
const scale = 4;
const pad = 24;
const cell = 128 * scale;
const sheet = new Canvas(keys.length * cell + (keys.length + 1) * pad, cell + pad * 2);
sheet.clear('#3f6b3a');

// Stránka s návrhy má obrázky vložené přímo v sobě, aby šla otevřít odkudkoli.
let page = fs.readFileSync(path.join(root, 'tools', 'sprites', 'design-page.template.html'), 'utf8');

keys.forEach((key, i) => {
  const sprite = drawTruplik(key);
  const png = encodePNG(sprite);
  fs.writeFileSync(path.join(outDir, `truplik-${key}.png`), png);
  page = page.replaceAll(`sprites/truplik-${key}.png`, `data:image/png;base64,${png.toString('base64')}`);
  sheet.blit(sprite, pad + i * (cell + pad), pad, scale);
});

fs.writeFileSync(path.join(root, 'design', 'index.html'), page);

fs.writeFileSync(path.join(root, 'design', 'truplik-varianty.png'), encodePNG(sheet));
console.log(`Hotovo: ${keys.length} varianty v ${outDir}`);
