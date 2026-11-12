// Dekorace arény: strom, kámen, keř.
import { Canvas, shapes, hex } from './px.mjs';

const WOOD = { o: '#35200f', s: '#6c4222', b: '#96622f', l: '#bd8749' };
const LEAF = { o: '#12301a', s: '#245a2c', b: '#327a38', l: '#4c9c4a' };
const STONE = { o: '#23262b', s: '#5d646e', b: '#858d98', l: '#b4bcc6' };
// ---------- dekorace ----------

export function drawTree() {
  const c = new Canvas(64, 96);
  const S = shapes(64, 96);
  c.fill(S.ellipse(32, 90, 20, 4), hex('#000000', 70));
  c.paint(S.rect(28, 58, 35, 89), WOOD);
  const canopy = S.ellipse(32, 34, 24, 26).or(S.ellipse(17, 48, 13, 13)).or(S.ellipse(47, 48, 13, 13));
  c.paint(canopy, LEAF, { hw: 3, sw: 5 });
  let seed = 77;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  for (let i = 0; i < 90; i++) {
    const x = Math.floor(rnd() * 64);
    const y = Math.floor(rnd() * 64);
    if (canopy.get(x, y) && canopy.get(x + 3, y + 3) && canopy.get(x - 3, y - 3)) {
      const col = rnd() < 0.5 ? LEAF.l : LEAF.s;
      c.px(x, y, col);
      c.px(x + 1, y, col);
    }
  }
  return c;
}

export function drawRock() {
  const c = new Canvas(32, 24);
  const S = shapes(32, 24);
  c.fill(S.ellipse(16, 21, 14, 2), hex('#000000', 70));
  c.paint(S.ellipse(16, 14, 13, 10).and(S.rect(0, 0, 31, 20)), STONE, { hw: 2, sw: 3 });
  c.line(12, 9, 15, 14, STONE.s);
  return c;
}

export function drawBush() {
  const c = new Canvas(32, 28);
  const S = shapes(32, 28);
  c.fill(S.ellipse(16, 25, 13, 2), hex('#000000', 70));
  const bush = S.ellipse(10, 17, 8, 7).or(S.ellipse(21, 17, 9, 7)).or(S.ellipse(16, 11, 8, 7));
  c.paint(bush.and(S.rect(0, 0, 31, 24)), LEAF, { hw: 2, sw: 3 });
  for (const [x, y] of [[9, 15], [20, 12], [24, 19], [14, 20]]) {
    c.px(x, y, '#e0483a');
    c.px(x + 1, y, '#e0483a');
    c.px(x, y + 1, '#a02a22');
    c.px(x + 1, y + 1, '#a02a22');
  }
  return c;
}
