// Satirické karikatury českých politiků. Jedna společná figurka, lišící se vlasy, oblekem a rekvizitou.
// Vtip stojí na veřejně známé image (brýle, hůl, kšiltovka a koblihy, dredy, auta).
import { Canvas, shapes, hex } from './px.mjs';

const SKIN = { o: '#5a2e26', s: '#cc8c70', b: '#eab292', l: '#f7d0b4' };
const SUITS = {
  navy: { o: '#0c1020', s: '#1b2440', b: '#2a3760', l: '#3d4f86' },
  charcoal: { o: '#111214', s: '#26282d', b: '#3a3d45', l: '#555962' },
  black: { o: '#08080a', s: '#17171b', b: '#26262c', l: '#3a3a44' },
  grey: { o: '#1c1e22', s: '#474b54', b: '#646a76', l: '#8a909c' },
  green: { o: '#0c2412', s: '#1c5a2a', b: '#2a8040', l: '#4cae62' },
};
const HAIRS = {
  grey: { o: '#3a3a3e', s: '#7c7c82', b: '#a4a4aa', l: '#c8c8ce' },
  white: { o: '#5a5a60', s: '#b8b8be', b: '#e2e2e6', l: '#ffffff' },
  brown: { o: '#24140a', s: '#4a2c16', b: '#6a4222', l: '#8c5c34' },
  black: { o: '#050506', s: '#141418', b: '#24242a', l: '#3c3c46' },
};
const SHIRT = { o: '#6f6a66', s: '#c2bdb7', b: '#ece9e3', l: '#ffffff' };
const WOOD = { o: '#35200f', s: '#6c4222', b: '#96622f', l: '#bd8749' };
const CAP = { o: '#4a0c0c', s: '#a01c1c', b: '#d42a2a', l: '#f25a4a' };
const DONUT = { o: '#3a200c', s: '#a8662a', b: '#d08a3c', l: '#eab060' };

export const POLITICIANS = {
  fiala: { hair: 'side', hairColor: 'grey', glasses: 'clear', suit: 'navy', tie: '#3a6ad0', mouth: 'flat', prop: 'book' },
  rakusan: { hair: 'short', hairColor: 'brown', beard: 'stubble', suit: 'grey', mouth: 'smile', shoes: '#e8e6e1' },
  zeman: { hair: 'thin', hairColor: 'white', suit: 'charcoal', tie: '#b02020', mouth: 'frown', prop: 'cane', wide: 3 },
  okamura: { hair: 'side', hairColor: 'black', suit: 'black', tie: '#7a1418', mouth: 'flat', prop: 'megaphone' },
  babis: { hair: 'cap', hairColor: 'grey', suit: 'navy', mouth: 'smile', prop: 'donut', wide: 2 },
  turek: { hair: 'short', hairColor: 'black', beard: 'full', glasses: 'shades', suit: 'green', mouth: 'flat', prop: 'wheel', wide: 1 },
  bartos: { hair: 'dreads', hairColor: 'brown', beard: 'stubble', suit: 'black', hoodie: true, mouth: 'smile', prop: 'accordion' },
};

// k = 1 dává snímek 48×48 (běžný nepřítel), k = 2 dává 96×96 (boss).
export function drawPolitician(id, frame, k = 1) {
  const spec = POLITICIANS[id];
  const W = 48 * k;
  const c = new Canvas(W, W);
  const S = shapes(W, W);
  const s = (v) => v * k;
  const dot = (x, y, col) => {
    for (let dy = 0; dy < k; dy++) for (let dx = 0; dx < k; dx++) c.px(Math.round(s(x)) + dx, Math.round(s(y)) + dy, col);
  };
  const ln = (x0, y0, x1, y1, col) => {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1) * 2;
    for (let i = 0; i <= n; i++) dot(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n, col);
  };
  const wide = spec.wide ?? 0;
  const suit = SUITS[spec.suit];
  const hair = HAIRS[spec.hairColor];
  const bob = frame === 1 ? 1 : 0;
  const hy = 14 + bob;
  const opts = { hw: k, sw: 2 * k };

  c.fill(S.ellipse(s(24), s(45), s(12 + wide), s(2)), hex('#000000', 70));

  // Hůl je za tělem
  const handR = [35 + wide, 34 + bob];
  if (spec.prop === 'cane') {
    c.paint(S.capsule([[s(handR[0] + 1), s(30)], [s(handR[0] + 1), s(44)]], s(0.8)), WOOD);
    c.paint(S.capsule([[s(handR[0] + 1), s(30)], [s(handR[0] - 1.5), s(30)]], s(0.8)), WOOD);
  }

  // Nohy a boty
  for (const side of [-1, 1]) {
    const x0 = side < 0 ? 18 : 26;
    const lift = frame === 1 && side < 0 ? 1.5 : frame === 0 && side > 0 ? 0 : 0;
    c.paint(S.rect(s(x0), s(34), s(x0 + 4) - 1, s(41 - lift)), suit, opts);
    const shoe = spec.shoes ? { o: '#3a3a3e', s: spec.shoes, b: spec.shoes, l: '#ffffff' } : SUITS.black;
    c.paint(S.rect(s(x0 - (side < 0 ? 1 : 0)), s(42 - lift), s(x0 + 4 + (side > 0 ? 1 : 0)) - 1, s(44 - lift) - 1), shoe, opts);
  }

  // Trup
  const top = 23 + bob;
  const torso = S.poly([
    [s(15 - wide), s(top + 1)], [s(18 - wide), s(top)], [s(30 + wide), s(top)], [s(33 + wide), s(top + 1)],
    [s(33 + wide), s(36)], [s(15 - wide), s(36)],
  ]);
  c.paint(torso, suit, opts);
  if (spec.hoodie) {
    ln(22, top + 3, 22, top + 8, '#d6cfc6');
    ln(26, top + 3, 26, top + 8, '#d6cfc6');
  } else {
    c.paint(S.poly([[s(20.5), s(top)], [s(28), s(top)], [s(24.2), s(top + 8)]]).and(torso), SHIRT, { hw: k, sw: k });
    if (spec.tie) for (let y = top + 1; y < top + 8; y++) dot(24, y, spec.tie);
    ln(19, top + 1, 23, top + 9, suit.o);
    ln(29, top + 1, 25, top + 9, suit.o);
  }

  // Ruce
  for (const side of [-1, 1]) {
    const sh = [24 + side * (9 + wide), top + 3];
    const hand = side > 0 ? handR : [13 - wide, 34 + bob];
    c.paint(S.capsule([[s(sh[0]), s(sh[1])], [s(hand[0]), s(hand[1] - 2)]], s(2.1)), suit, opts);
    c.paint(S.circle(s(hand[0]), s(hand[1]), s(1.9)), SKIN, { hw: k, sw: k });
  }

  // Rekvizita v ruce
  const [px, py] = handR;
  if (spec.prop === 'book') {
    c.paint(S.rect(s(px - 1), s(py - 5), s(px + 4), s(py + 1)), { o: '#2a0c0c', s: '#6e1c1c', b: '#963020', l: '#b84a30' }, opts);
    ln(px + 4, py - 4, px + 4, py, '#ece9e3');
  } else if (spec.prop === 'megaphone') {
    c.paint(S.poly([[s(px), s(py - 3)], [s(px + 7), s(py - 7)], [s(px + 7), s(py + 2)], [s(px), s(py - 1)]]), SHIRT, { hw: k, sw: k });
    ln(px + 7, py - 7, px + 7, py + 2, '#d42a2a');
  } else if (spec.prop === 'donut') {
    c.paint(S.circle(s(px + 2), s(py - 3), s(3.6)), DONUT, opts);
    c.fill(S.circle(s(px + 2), s(py - 3), s(3.6)).filter((x, y) => y < s(py - 3)), '#f09ab8');
    c.fill(S.circle(s(px + 2), s(py - 3), s(1.1)), DONUT.o);
  } else if (spec.prop === 'wheel') {
    const ring = S.circle(s(px + 1), s(py - 3), s(4.2)).sub(S.circle(s(px + 1), s(py - 3), s(2.6)));
    c.paint(ring, SUITS.black, { hw: k, sw: k });
    ln(px - 2, py - 3, px + 4, py - 3, SUITS.black.b);
  } else if (spec.prop === 'accordion') {
    c.paint(S.rect(s(px - 3), s(py - 6), s(px + 4), s(py + 1)), CAP, opts);
    for (let x = px - 2; x <= px + 3; x += 2) ln(x, py - 5, x, py, '#ece9e3');
  }

  // Hlava
  for (const side of [-1, 1]) c.paint(S.ellipse(s(24 + side * 9), s(hy + 1), s(1.6), s(2.4)), SKIN, { hw: k, sw: k });
  const head = S.superellipse(s(24), s(hy), s(9), s(9.5), 2.4);
  c.paint(head, SKIN, { shade: (x, y) => (((x - s(24)) / s(9)) * 0.5 + ((y - s(hy)) / s(9.5)) * 0.62 > 0.6 ? -1 : 0) });

  // Vousy
  if (spec.beard) {
    const col = spec.beard === 'full' ? hair.b : spec.hairColor === 'brown' ? '#b08060' : '#9a8a84';
    head.each((x, y) => {
      if (y < s(hy + 3.5)) return;
      if (spec.beard === 'stubble' && (Math.floor(x / k) + Math.floor(y / k)) % 2) return;
      c.px(x, y, col);
    });
  }

  // Obličej
  for (const ex of [20.5, 27]) {
    dot(ex, hy - 0.5, '#1a1410');
    dot(ex, hy + 0.5, '#1a1410');
    ln(ex - 1, hy - 3, ex + 1, hy - 3 + (ex < 24 ? 0.5 : -0.5), hair.o);
  }
  dot(24, hy + 2.5, SKIN.s);
  const my = hy + 5.5;
  ln(21.5, my, 26.5, my, '#78382e');
  if (spec.mouth === 'smile') {
    dot(21, my - 1, '#78382e');
    dot(27, my - 1, '#78382e');
  } else if (spec.mouth === 'frown') {
    dot(21, my + 1, '#78382e');
    dot(27, my + 1, '#78382e');
  }
  if (spec.glasses) {
    const frame = spec.glasses === 'shades' ? '#0a0a0c' : '#2a2620';
    for (const ex of [20.5, 27]) {
      if (spec.glasses === 'shades') for (let y = hy - 1.5; y <= hy + 1.5; y++) ln(ex - 1.5, y, ex + 1.5, y, frame);
      ln(ex - 2, hy - 2, ex + 2, hy - 2, frame);
      ln(ex - 2, hy + 2, ex + 2, hy + 2, frame);
      ln(ex - 2, hy - 2, ex - 2, hy + 2, frame);
      ln(ex + 2, hy - 2, ex + 2, hy + 2, frame);
    }
    ln(22.5, hy - 1, 25, hy - 1, frame);
  }

  // Vlasy
  const U = (x) => (x - s(24)) / s(9);
  const V = (y) => (y - s(hy)) / s(9.5);
  const dome = S.superellipse(s(24), s(hy), s(9.8), s(10.3), 2.4);
  const style = spec.hair;
  let hairMask = null;
  if (style === 'side') hairMask = dome.filter((x, y) => V(y) < -0.5 + 0.22 * U(x) + 0.5 * Math.abs(U(x)) ** 3);
  if (style === 'short') hairMask = dome.filter((x, y) => V(y) < -0.6 + 0.55 * Math.abs(U(x)) ** 3);
  if (style === 'thin') hairMask = dome.filter((x, y) => V(y) < -0.78 + 0.75 * Math.abs(U(x)) ** 2.5);
  if (style === 'cap') hairMask = dome.filter((x, y) => Math.abs(U(x)) > 0.8 && V(y) < 0.1 && V(y) > -0.5);
  if (style === 'dreads') {
    hairMask = dome.filter((x, y) => V(y) < -0.45 + 0.5 * Math.abs(U(x)) ** 3);
    for (const [x, len] of [[13.5, 31], [16, 33], [32, 33], [34.5, 31]])
      hairMask = hairMask.or(S.capsule([[s(x), s(hy - 4)], [s(x + (x < 24 ? -1 : 1)), s(len + bob)]], s(1.4)));
  }
  if (hairMask) c.paint(hairMask, hair, opts);
  if (style === 'dreads')
    hairMask.each((x, y) => {
      if (y > s(hy + 2) && Math.floor(y / k) % 3 === 0) c.px(x, y, hair.s); // články dredů
    });
  if (style === 'cap') {
    const crown = dome.filter((x, y) => V(y) < -0.42);
    c.paint(crown, CAP, opts);
    c.paint(S.rect(s(14), s(hy - 4.4), s(36), s(hy - 3.2)), CAP, { hw: k, sw: k });
  }
  return c;
}

// ---------- střely ----------

export function drawLeaflet() {
  const c = new Canvas(12, 12);
  c.paint(shapes(12, 12).rect(2, 1, 9, 10), SHIRT, { hw: 1, sw: 1 });
  for (const y of [3, 5, 7]) c.line(4, y, 7, y, '#8a8680');
  c.line(4, 9, 6, 9, '#d42a2a');
  return c;
}

export function drawDonut() {
  const c = new Canvas(16, 16);
  const S = shapes(16, 16);
  const ring = S.circle(8, 8, 6);
  c.paint(ring, DONUT, { hw: 1, sw: 2 });
  c.fill(ring.filter((x, y) => y < 8 && (x - 8) ** 2 + (y - 8) ** 2 < 30), '#f09ab8');
  c.paint(S.circle(8, 8, 1.6), { o: DONUT.o, s: '#3f6b3a', b: '#3f6b3a', l: '#3f6b3a' });
  for (const [x, y] of [[5, 5], [9, 4], [11, 6], [7, 3]]) c.px(x, y, '#ffffff');
  return c;
}

export function drawPixelShot() {
  const c = new Canvas(12, 12);
  c.paint(shapes(12, 12).rect(3, 3, 8, 8), { o: '#1c0c3a', s: '#5a2ab0', b: '#8a4af0', l: '#d0b0ff' });
  return c;
}
