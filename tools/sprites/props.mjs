// Drobnosti do arény: krystal zkušeností, dlaždice trávy.
import { Canvas, shapes, hex } from './px.mjs';

const GEM = { o: '#0c2a4a', s: '#1f7fc4', b: '#4fc3f7', l: '#d4f4ff' };

export function drawGem() {
  const c = new Canvas(16, 16);
  const S = shapes(16, 16);
  c.paint(S.poly([[8, 1], [14, 8], [8, 15], [2, 8]]), GEM, { hw: 2, sw: 2 });
  return c;
}

// Dlaždice trávy 64×64, navazuje sama na sebe.
export function drawGrass() {
  const c = new Canvas(64, 64);
  c.clear('#3f6b3a');
  let seed = 1337;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  for (let i = 0; i < 260; i++) {
    const x = Math.floor(rnd() * 64);
    const y = Math.floor(rnd() * 64);
    const color = rnd() < 0.5 ? '#38623a' : rnd() < 0.7 ? '#477640' : '#34593a';
    c.px(x, y, color);
    if (rnd() < 0.45) c.px(x, (y + 63) % 64, color); // stéblo
  }
  for (let i = 0; i < 5; i++) {
    const x = 4 + Math.floor(rnd() * 56);
    const y = 4 + Math.floor(rnd() * 56);
    c.px(x, y, '#e8d86a'); // kytička
    c.px(x, y + 1, '#2f5233');
  }
  return c;
}
