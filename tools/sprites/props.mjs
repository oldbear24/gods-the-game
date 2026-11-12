// Příšery a drobnosti do arény: sliz, krystal zkušeností, dlaždice trávy.
import { Canvas, shapes, hex } from './px.mjs';

const SLIME = { o: '#2a1038', s: '#5b2a86', b: '#8443bd', l: '#b57be6' };
const GEM = { o: '#0c2a4a', s: '#1f7fc4', b: '#4fc3f7', l: '#d4f4ff' };

// Sliz 48×48, frame 0 natažený, frame 1 přikrčený.
export function drawSlime(frame) {
  const c = new Canvas(48, 48);
  const S = shapes(48, 48);
  const squash = frame === 1 ? 2 : 0;
  const cy = 29 + squash;
  const rx = 17 + squash;
  const ry = 14 - squash;
  c.fill(S.ellipse(24, 41, rx + 2, 3), hex('#000000', 70));
  const body = S.ellipse(24, cy, rx, ry).and(S.rect(0, 0, 47, 40));
  c.paint(body, SLIME, { hw: 2, sw: 3 });
  c.fill(S.ellipse(16, cy - ry + 5, 3, 2), SLIME.l); // odlesk
  for (const side of [-1, 1]) {
    const ex = 24 + side * 7;
    const ey = cy - 2;
    for (let y = 0; y < 5; y++) for (let x = -2; x <= 1; x++) c.px(ex + x, ey + y, '#f5f1ea');
    for (let y = 2; y < 5; y++) for (let x = -1; x <= 0; x++) c.px(ex + x, ey + y, '#1a0a24');
    c.line(ex - side * 3, ey - 1, ex + side * 3, ey - 3, SLIME.o); // zlé obočí
  }
  c.line(20, cy + 7, 28, cy + 7, SLIME.o);
  c.px(19, cy + 8, SLIME.o);
  c.px(29, cy + 8, SLIME.o);
  return c;
}

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
