// Další příšery, boss a dekorace arény.
import { Canvas, shapes, hex } from './px.mjs';

const BAT = { o: '#14101f', s: '#2f2748', b: '#4a3f70', l: '#6c5fa0' };
const BONE = { o: '#2a2620', s: '#b5ad9a', b: '#e6dfcc', l: '#fffbee' };
const GOBLIN = { o: '#12301a', s: '#3f8a3a', b: '#62b54a', l: '#9fe07a' };
const ROBE = { o: '#2a1408', s: '#5a2f18', b: '#804522', l: '#a86432' };
const WOOD = { o: '#35200f', s: '#6c4222', b: '#96622f', l: '#bd8749' };
const KING = { o: '#3a0a14', s: '#8a1c2e', b: '#c8324a', l: '#f07a8a' };
const GOLD = { o: '#3a2608', s: '#a8741c', b: '#d9a32e', l: '#f6d76a' };
const LEAF = { o: '#12301a', s: '#245a2c', b: '#327a38', l: '#4c9c4a' };
const STONE = { o: '#23262b', s: '#5d646e', b: '#858d98', l: '#b4bcc6' };
const ORB = { o: '#17400f', s: '#4fae2a', b: '#8be04a', l: '#e2ffb0' };

const mirror = (pts, w) => pts.map(([x, y]) => [w - x, y]);

// Netopýr 48×48: frame 0 křídla nahoře, frame 1 dole.
export function drawBat(frame) {
  const c = new Canvas(48, 48);
  const S = shapes(48, 48);
  c.fill(S.ellipse(24, 44, 9, 2), hex('#000000', 60));
  const by = frame === 1 ? 23 : 26;
  const wing =
    frame === 1
      ? [[20, by + 1], [8, by + 12], [2, by + 4], [8, by], [13, by - 3]]
      : [[20, by], [7, by - 13], [2, by - 3], [8, by], [13, by + 4]];
  c.paint(S.poly(wing), BAT);
  c.paint(S.poly(mirror(wing, 48)), BAT);
  const ear = [[18, by - 4], [17, by - 12], [23, by - 6]];
  c.paint(S.poly(ear), BAT);
  c.paint(S.poly(mirror(ear, 48)), BAT);
  c.paint(S.circle(24, by, 7), BAT);
  for (const x of [21, 27]) {
    c.px(x, by - 1, '#ff4a3a');
    c.px(x, by, '#ff4a3a');
  }
  c.px(23, by + 4, '#f5f1ea');
  c.px(25, by + 4, '#f5f1ea');
  return c;
}

// Kostlivec 48×48.
export function drawSkeleton(frame) {
  const c = new Canvas(48, 48);
  const S = shapes(48, 48);
  const step = frame === 1 ? 2 : 0;
  c.fill(S.ellipse(24, 45, 10, 2), hex('#000000', 70));
  c.paint(S.capsule([[22, 34], [20 - step, 44]], 1.3), BONE);
  c.paint(S.capsule([[26, 34], [28 + step, 44]], 1.3), BONE);
  c.paint(S.capsule([[17, 24], [12, 33 - step]], 1.2), BONE);
  c.paint(S.capsule([[31, 24], [36, 33 + step]], 1.2), BONE);
  c.paint(S.rect(20, 33, 28, 35), BONE);
  c.paint(S.rect(23, 21, 25, 33), BONE);
  for (const [x0, x1, y] of [[17, 31, 24], [18, 30, 27], [19, 29, 30]]) c.paint(S.rect(x0, y, x1, y + 1), BONE);
  c.paint(S.superellipse(24, 13, 8, 8, 2.6), BONE);
  for (const x of [19, 26]) for (let y = 12; y < 15; y++) for (let dx = 0; dx < 3; dx++) c.px(x + dx, y, '#15110e');
  c.px(24, 16, '#15110e');
  for (let x = 20; x <= 28; x += 2) c.px(x, 19, '#15110e');
  return c;
}

// Goblin šaman 48×48: střílí zelené koule.
export function drawGoblin(frame) {
  const c = new Canvas(48, 48);
  const S = shapes(48, 48);
  const hy = frame === 1 ? 18 : 17;
  c.fill(S.ellipse(24, 45, 12, 2), hex('#000000', 70));
  c.paint(S.capsule([[38, 12], [38, 43]], 1), WOOD);
  c.paint(S.circle(38, 9, 3.2), ORB);
  c.paint(S.poly([[16, 25], [32, 25], [35, 44], [13, 44]]), ROBE);
  c.paint(S.capsule([[32, 28], [37, 30]], 1.6), GOBLIN);
  const ear = [[17, hy - 2], [5, hy - 7], [16, hy + 4]];
  c.paint(S.poly(ear), GOBLIN);
  c.paint(S.poly(mirror(ear, 48)), GOBLIN);
  c.paint(S.ellipse(24, hy, 9, 8), GOBLIN);
  for (const x of [20, 27]) {
    c.px(x, hy - 1, '#ffe14a');
    c.px(x + 1, hy - 1, '#ffe14a');
    c.px(x, hy, '#ffe14a');
    c.px(x + 1, hy, '#1a0a0a');
  }
  c.line(20, hy + 4, 28, hy + 4, GOBLIN.o);
  c.px(22, hy + 5, '#f5f1ea');
  c.px(27, hy + 5, '#f5f1ea');
  return c;
}

export function drawOrb() {
  const c = new Canvas(12, 12);
  c.paint(shapes(12, 12).circle(6, 6, 4), ORB);
  return c;
}

// Boss: Slizový král 96×96.
export function drawSlimeKing(frame) {
  const c = new Canvas(96, 96);
  const S = shapes(96, 96);
  const squash = frame === 1 ? 3 : 0;
  const cy = 58 + squash;
  const rx = 38 + squash;
  const ry = 30 - squash;
  c.fill(S.ellipse(48, 84, rx + 3, 5), hex('#000000', 70));
  c.paint(S.ellipse(48, cy, rx, ry).and(S.rect(0, 0, 95, 82)), KING, { hw: 3, sw: 5 });
  c.fill(S.ellipse(28, cy - ry + 10, 6, 4), KING.l);
  for (const side of [-1, 1]) {
    const ex = 48 + side * 14;
    const ey = cy - 6;
    for (let y = 0; y < 10; y++) for (let x = -4; x <= 3; x++) c.px(ex + x, ey + y, '#f5f1ea');
    for (let y = 4; y < 10; y++) for (let x = -2; x <= 1; x++) c.px(ex + x, ey + y, '#1a0a14');
    for (let t = 0; t < 2; t++) c.line(ex - side * 7, ey - 2 + t, ex + side * 6, ey - 6 + t, KING.o);
  }
  for (let t = 0; t < 2; t++) c.line(38, cy + 14 + t, 58, cy + 14 + t, KING.o);
  for (const x of [41, 47, 53]) {
    c.px(x, cy + 16, '#f5f1ea');
    c.px(x + 1, cy + 16, '#f5f1ea');
    c.px(x, cy + 17, '#f5f1ea');
  }
  // Koruna
  const top = cy - ry;
  c.paint(
    S.poly([[30, top + 6], [32, top - 10], [40, top - 1], [48, top - 14], [56, top - 1], [64, top - 10], [66, top + 6]]),
    GOLD,
    { hw: 2, sw: 2 },
  );
  for (const [x, col] of [[36, '#4fc3f7'], [48, '#e0483a'], [60, '#4fc3f7']]) {
    for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) c.px(x + dx, top + 2 + dy, col);
  }
  return c;
}

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
