// Vyrenderuje herní grafiku do public/assets. Spouští se přes `npm run sprites`.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Canvas, encodePNG } from './px.mjs';
import { drawTruplik } from './truplik.mjs';
import { drawSlime, drawGem, drawGrass } from './props.mjs';
import * as M from './monsters.mjs';

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
save('slime.png', sheet([drawSlime(0), drawSlime(1)]));
save('bat.png', sheet([M.drawBat(0), M.drawBat(1)]));
save('skeleton.png', sheet([M.drawSkeleton(0), M.drawSkeleton(1)]));
save('goblin.png', sheet([M.drawGoblin(0), M.drawGoblin(1)]));
save('king.png', sheet([M.drawSlimeKing(0), M.drawSlimeKing(1)]));
save('orb.png', M.drawOrb());
save('tree.png', M.drawTree());
save('rock.png', M.drawRock());
save('bush.png', M.drawBush());
save('gem.png', drawGem());

// Kontrolní přehled všech příšer a dekorací (jen pro oko, hra ho nepoužívá).
const all = [M.drawBat(0), M.drawBat(1), M.drawSkeleton(0), M.drawGoblin(0), M.drawOrb(), M.drawSlimeKing(0), M.drawTree(), M.drawRock(), M.drawBush()];
const overview = new Canvas(all.reduce((w, s) => w + s.w * 3 + 12, 12), 96 * 3 + 24);
overview.clear('#3f6b3a');
let ox = 12;
for (const s of all) {
  overview.blit(s, ox, 12, 3);
  ox += s.w * 3 + 12;
}
fs.mkdirSync(path.join(root, 'design'), { recursive: true });
fs.writeFileSync(path.join(root, 'design', 'prisery-prehled.png'), encodePNG(overview));
save('grass.png', drawGrass().scaled(2));
console.log(`Grafika uložena do ${outDir}`);
