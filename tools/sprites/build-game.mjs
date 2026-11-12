// Vyrenderuje herní grafiku do public/assets. Spouští se přes `npm run sprites`.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Canvas, encodePNG } from './px.mjs';
import { drawTruplik } from './truplik.mjs';
import { drawJiry, drawArrow } from './jiry.mjs';
import { drawGem, drawGrass } from './props.mjs';
import { drawTree, drawRock, drawBush } from './monsters.mjs';
import { drawPolitician, drawLeaflet, drawDonut, drawPixelShot } from './politicians.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const outDir = path.join(root, 'public', 'assets');
fs.mkdirSync(outDir, { recursive: true });

function sheet(frames) {
  const w = frames[0].w;
  const out = new Canvas(w * frames.length, frames[0].h);
  frames.forEach((f, i) => out.blit(f, i * w, 0));
  return out;
}
const save = (name, canvas) => fs.writeFileSync(path.join(outDir, name), encodePNG(canvas));

// Pořadí snímků Truplika musí odpovídat src/characters.ts:
// 0 stojí, 1 nádech, 2 krok levou, 3 krok pravou, 4 úder
save(
  'truplik.png',
  sheet([
    drawTruplik('c'),
    drawTruplik('c', { bob: 1 }),
    drawTruplik('c', { bob: -1, liftL: 4 }),
    drawTruplik('c', { bob: -1, liftR: 4 }),
    drawTruplik('c', { bob: 1, swing: true }),
  ]),
);

// Jiry má stejné pořadí snímků jako Truplik; 4 = natažený luk.
save(
  'jiry.png',
  sheet([
    drawJiry(),
    drawJiry({ bob: 1 }),
    drawJiry({ bob: -1, liftL: 4 }),
    drawJiry({ bob: -1, liftR: 4 }),
    drawJiry({ draw: true }),
  ]),
);
save('arrow.png', drawArrow());

// Kontrolní obrázek hratelných postav vedle sebe.
{
  const frames = [drawTruplik('c'), drawJiry(), drawJiry({ bob: -1, liftL: 4 }), drawJiry({ draw: true })];
  const out = new Canvas(frames.length * 128 * 3, 128 * 3);
  out.clear('#3f6b3a');
  frames.forEach((f, i) => out.blit(f, i * 384, 0, 3));
  fs.mkdirSync(path.join(root, 'design'), { recursive: true });
  fs.writeFileSync(path.join(root, 'design', 'postavy-prehled.png'), encodePNG(out));
}

// Politici: všichni na mřížce 72×72; bossové se ve hře jen víc zvětší (viz src/enemies.ts).
const regular = ['fiala', 'rakusan', 'zeman', 'okamura'];
const bosses = ['babis', 'turek', 'bartos'];
for (const id of [...regular, ...bosses]) save(`${id}.png`, sheet([drawPolitician(id, 0), drawPolitician(id, 1)]));
save('leaflet.png', drawLeaflet());
save('donut.png', drawDonut());
save('pixel.png', drawPixelShot());

save('tree.png', drawTree());
save('rock.png', drawRock());
save('bush.png', drawBush());
save('gem.png', drawGem());
save('grass.png', drawGrass().scaled(2));

// Kontrolní přehled všech politiků (jen pro oko, hra ho nepoužívá).
const all = [...regular, ...bosses].map((id) => drawPolitician(id, 0));
const overview = new Canvas(all.reduce((w, s) => w + s.w * 3 + 12, 12), 72 * 3 + 24);
overview.clear('#3f6b3a');
let ox = 12;
for (const s of all) {
  overview.blit(s, ox, 12, 3);
  ox += s.w * 3 + 12;
}
fs.mkdirSync(path.join(root, 'design'), { recursive: true });
fs.writeFileSync(path.join(root, 'design', 'politici-prehled.png'), encodePNG(overview));
console.log(`Grafika uložena do ${outDir}`);
