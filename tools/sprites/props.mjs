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

// ---------- zbraně navíc ----------

const WOOD = { o: '#3a2210', s: '#8a5a2a', b: '#c98a45', l: '#f0c07a' };
const STEEL = { o: '#1c222c', s: '#6c7684', b: '#aeb8c6', l: '#f0f4fa' };
const RED = { o: '#3a0c0c', s: '#8e1f1f', b: '#d0392e', l: '#ff8a70' };

// Bumerang 20×20, střed otáčení uprostřed.
export function drawBoomerang() {
  const c = new Canvas(20, 20);
  const S = shapes(20, 20);
  c.paint(S.capsule([[3, 4], [10, 14], [17, 4]], 2.4), WOOD);
  c.px(3, 4, '#e0483a');
  c.px(17, 4, '#e0483a');
  return c;
}

// Shuriken 16×16.
export function drawShuriken() {
  const c = new Canvas(16, 16);
  const S = shapes(16, 16);
  c.paint(S.poly([[8, 0], [10, 6], [16, 8], [10, 10], [8, 16], [6, 10], [0, 8], [6, 6]]), STEEL);
  c.px(8, 8, '#1c222c');
  c.px(7, 8, '#1c222c');
  c.px(8, 7, '#1c222c');
  c.px(7, 7, '#1c222c');
  return c;
}

// Banhammer 24×30, hlava nahoře.
export function drawHammer() {
  const c = new Canvas(24, 30);
  const S = shapes(24, 30);
  c.paint(S.rect(10, 10, 13, 28), WOOD);
  c.paint(S.rect(2, 2, 21, 12), RED, { hw: 2 });
  c.paint(S.rect(2, 5, 4, 9), STEEL, { outline: false });
  c.paint(S.rect(19, 5, 21, 9), STEEL, { outline: false });
  return c;
}

// Katana 30×8 špičkou doprava (vyvinutý bumerang, ve hře rotuje).
export function drawKatana() {
  const c = new Canvas(30, 8);
  const S = shapes(30, 8);
  c.paint(S.poly([[9, 2], [26, 2], [29, 4], [26, 5], [9, 5]]), STEEL);
  c.paint(S.rect(1, 2, 7, 5), RED);
  c.paint(S.rect(8, 0, 9, 7), { o: '#3a2608', s: '#a8741c', b: '#d9a32e', l: '#f6d76a' });
  return c;
}

// Volební urna 20×20.
export function drawUrn() {
  const c = new Canvas(20, 20);
  const S = shapes(20, 20);
  c.paint(S.rect(2, 6, 17, 18), { o: '#3a3a3e', s: '#b8b8be', b: '#e2e2e6', l: '#ffffff' }, { hw: 1 });
  c.paint(S.rect(1, 4, 18, 7), { o: '#3a3a3e', s: '#8a8a92', b: '#b8b8be', l: '#e2e2e6' });
  c.line(6, 5, 13, 5, '#141418');
  c.fill(S.rect(4, 11, 15, 12), '#2a4a9a');
  c.fill(S.rect(4, 13, 15, 14), '#d42a2a');
  c.paint(S.rect(8, 1, 12, 4), { o: '#6f6a66', s: '#c2bdb7', b: '#ece9e3', l: '#ffffff' }); // lístek
  return c;
}
