// Satirické karikatury českých politiků na mřížce 72×72: velká hlava, malé tělo.
// Každý má vlastní tvar hlavy, účes, obočí, nos, vrásky a rekvizitu. Vtip stojí na veřejně známé image.
import { Canvas, shapes, hex } from './px.mjs';

const W = 72;
const SKIN = { o: '#5a2e26', s: '#cc8c70', b: '#eab292', l: '#f7d0b4' };
const SKIN_RUDDY = { o: '#5a2620', s: '#c87a66', b: '#e8a48c', l: '#f6c4b0' };
const SKIN_TAN = { o: '#52301e', s: '#b88058', b: '#dba67c', l: '#eec49c' };
const SUITS = {
  navy: { o: '#0c1020', s: '#1b2440', b: '#2a3760', l: '#3d4f86' },
  charcoal: { o: '#111214', s: '#26282d', b: '#3a3d45', l: '#555962' },
  black: { o: '#08080a', s: '#17171b', b: '#26262c', l: '#3a3a44' },
  grey: { o: '#1c1e22', s: '#474b54', b: '#646a76', l: '#8a909c' },
  green: { o: '#0c2412', s: '#1c5a2a', b: '#2a8040', l: '#4cae62' },
  red: { o: '#3a0c0c', s: '#8e1f1f', b: '#c0322a', l: '#e06050' },
  purple: { o: '#240c30', s: '#5a2070', b: '#8030a0', l: '#a858c8' },
  olive: { o: '#161a0c', s: '#3a4420', b: '#566430', l: '#788a48' },
  brown: { o: '#20140a', s: '#4e3420', b: '#6e4c30', l: '#927048' },
  sky: { o: '#14283a', s: '#3a6e96', b: '#5a96c0', l: '#8cc0e2' },
};
const HAIRS = {
  grey: { o: '#3a3a3e', s: '#7c7c82', b: '#a4a4aa', l: '#c8c8ce' },
  white: { o: '#6a6a70', s: '#b8b8be', b: '#e2e2e6', l: '#ffffff' },
  brown: { o: '#24140a', s: '#4a2c16', b: '#6a4222', l: '#8c5c34' },
  black: { o: '#050506', s: '#141418', b: '#26262c', l: '#40404a' },
  blonde: { o: '#5a4010', s: '#b08a30', b: '#dcb850', l: '#f6e08a' },
};
const SHIRT = { o: '#6f6a66', s: '#c2bdb7', b: '#ece9e3', l: '#ffffff' };
const WOOD = { o: '#35200f', s: '#6c4222', b: '#96622f', l: '#bd8749' };
const CAP = { o: '#4a0c0c', s: '#a01c1c', b: '#d42a2a', l: '#f25a4a' };
const DONUT = { o: '#3a200c', s: '#a8662a', b: '#d08a3c', l: '#eab060' };
const MOUTH_BASE = '#78382e';
const GOLD = { o: '#3a2608', s: '#a8741c', b: '#d9a32e', l: '#f6d76a' };
const STEEL = '#c8ccd4';

// rx, ry = rozměr hlavy; jaw = hranatost (2 kulatá, 3 hranatá); ears, nose = velikost;
// brow = [tloušťka, sklon k nosu]; lines = vrásky kolem úst; bags = váčky pod očima.
export const POLITICIANS = {
  fiala: {
    rx: 13, ry: 16, jaw: 2.3, ears: 1, nose: 2, brow: [1, 0], mouth: 'smile', mouthW: 4,
    hair: 'side', hairColor: 'grey', glasses: true, forehead: true,
    suit: 'navy', tie: '#3a6ad0', prop: 'book',
  },
  rakusan: {
    rx: 15, ry: 15, jaw: 2.2, ears: 1, nose: 2, brow: [2, 1], mouth: 'grin', mouthW: 6,
    hair: 'quiff', hairColor: 'brown', beard: 'stubble',
    suit: 'grey', shoes: '#e8e6e1',
  },
  zeman: {
    rx: 17, ry: 15, jaw: 2.6, ears: 1.2, nose: 3, brow: [2, -1], mouth: 'frown', mouthW: 5,
    hair: 'thin', hairColor: 'white', jowls: true, bags: true, lines: true, droopy: true, skin: SKIN_RUDDY,
    suit: 'charcoal', tie: '#b02020', prop: 'cane', wide: 4,
  },
  okamura: {
    rx: 14, ry: 15, jaw: 2.4, ears: 1, nose: 2, brow: [2, 2], mouth: 'flat', mouthW: 4,
    hair: 'side', hairColor: 'black', mirrorHair: true,
    suit: 'black', tie: '#7a1418', prop: 'megaphone',
  },
  babis: {
    rx: 14, ry: 17, jaw: 2.5, ears: 1.5, nose: 3, brow: [2, 1], mouth: 'grin', mouthW: 6,
    hair: 'cap', hairColor: 'grey', bags: true, lines: true, forehead: false, skin: SKIN_TAN,
    suit: 'navy', prop: 'donut', wide: 2,
  },
  turek: {
    rx: 15, ry: 16, jaw: 3.1, ears: 1, nose: 2, brow: [3, 2], mouth: 'flat', mouthW: 4,
    hair: 'slick', hairColor: 'black', beard: 'full',
    suit: 'green', prop: 'wheel', wide: 2,
  },
  bartos: {
    rx: 14, ry: 15, jaw: 2.3, ears: 1, nose: 2, brow: [1, 0], mouth: 'smile', mouthW: 5,
    hair: 'dreads', hairColor: 'brown', beard: 'stubble',
    suit: 'black', hoodie: true, prop: 'accordion',
  },
  schillerova: {
    rx: 13, ry: 15, jaw: 2.2, ears: 0.8, nose: 2, brow: [1, 0], mouth: 'smile', mouthW: 5,
    hair: 'bob', hairColor: 'blonde', glasses: true, lips: '#c0485a',
    suit: 'sky', prop: 'phone',
  },
  konecna: {
    rx: 14, ry: 15, jaw: 2.2, ears: 0.8, nose: 2, brow: [2, 2], mouth: 'flat', mouthW: 5,
    hair: 'long', hairColor: 'brown', lips: '#b03a48',
    suit: 'red', prop: 'sign',
  },
  stanjura: {
    rx: 16, ry: 15, jaw: 2.3, ears: 1, nose: 2, brow: [1, 0], mouth: 'flat', mouthW: 4,
    hair: 'side', hairColor: 'grey', glasses: true, jowls: true,
    suit: 'charcoal', tie: '#2a4a9a', prop: 'scissors', wide: 2,
  },
  jurecka: {
    rx: 16, ry: 15, jaw: 2.4, ears: 1.1, nose: 2, brow: [2, 0], mouth: 'smile', mouthW: 5,
    hair: 'side', hairColor: 'brown', skin: SKIN_RUDDY,
    suit: 'brown', tie: '#2a6a3a', prop: 'pitchfork', wide: 3,
  },
  pavel: {
    rx: 14, ry: 16, jaw: 2.8, ears: 1, nose: 2, brow: [2, 1], mouth: 'flat', mouthW: 4,
    hair: 'slick', hairColor: 'white', beard: 'full',
    suit: 'olive', tie: '#2a2e1c', medals: true, wide: 2,
  },
  pekarova: {
    rx: 13, ry: 15, jaw: 2.2, ears: 0.8, nose: 2, brow: [1, 1], mouth: 'smile', mouthW: 5,
    hair: 'long', hairColor: 'brown', lips: '#b03a48',
    suit: 'purple', prop: 'bell',
  },
  rajchl: {
    rx: 14, ry: 16, jaw: 2.7, ears: 1, nose: 2, brow: [3, 2], mouth: 'grin', mouthW: 5,
    hair: 'slick', hairColor: 'black', beard: 'stubble',
    suit: 'navy', prop: 'megaphone', wide: 1,
  },
};

export function drawPolitician(id, frame) {
  const f = POLITICIANS[id];
  const c = new Canvas(W, W);
  const S = shapes(W, W);
  const wide = f.wide ?? 0;
  const suit = SUITS[f.suit];
  const hair = HAIRS[f.hairColor];
  const skin = f.skin ?? SKIN;
  const MOUTH = f.lips ?? MOUTH_BASE;
  const bob = frame === 1 ? 1 : 0;
  const hx = 36;
  const hy = 23 + bob;
  const { rx, ry } = f;
  const row = (x0, x1, y, col) => {
    for (let x = Math.round(x0); x <= Math.round(x1); x++) c.px(x, y, col);
  };

  c.fill(S.ellipse(36, 68, 15 + wide, 3), hex('#000000', 70));

  // ---------- tělo ----------
  const top = 38 + bob;
  const handR = [52 + wide, 54 + bob];
  if (f.prop === 'cane') {
    c.paint(S.capsule([[handR[0] + 2, 50], [handR[0] + 2, 67]], 1), WOOD);
    c.paint(S.capsule([[handR[0] + 2, 50], [handR[0] - 2, 50]], 1), WOOD);
  }
  if (f.prop === 'pitchfork') {
    const x = handR[0] + 3;
    c.paint(S.capsule([[x, 30], [x, 67]], 1), WOOD);
    c.line(x - 3, 29, x + 3, 29, STEEL);
    for (const dx of [-3, 0, 3]) c.line(x + dx, 22, x + dx, 29, STEEL);
  }
  if (f.prop === 'sign') {
    const x = handR[0] + 2;
    c.paint(S.capsule([[x, 34], [x, 56]], 1), WOOD);
    c.paint(S.rect(x - 7, 24, x + 7, 34), SUITS.red);
    c.line(x - 4, 28, x + 4, 28, '#ffffff');
    c.line(x - 4, 31, x + 2, 31, '#ffffff');
  }
  for (const side of [-1, 1]) {
    const x0 = side < 0 ? 29 : 38;
    const lift = frame === 1 && side < 0 ? 2 : 0;
    c.paint(S.rect(x0, 54, x0 + 5, 62 - lift), suit);
    const shoe = f.shoes ? { o: '#3a3a3e', s: '#b8b6b0', b: f.shoes, l: '#ffffff' } : SUITS.black;
    c.paint(S.rect(x0 - (side < 0 ? 2 : 0), 63 - lift, x0 + 5 + (side > 0 ? 2 : 0), 66 - lift), shoe);
  }
  const torso = S.poly([
    [25 - wide, top + 3], [29 - wide, top], [43 + wide, top], [47 + wide, top + 3], [47 + wide, 56], [25 - wide, 56],
  ]);
  c.paint(torso, suit, { sw: 3 });
  if (f.hoodie) {
    for (const x of [33, 39]) c.line(x, top + 3, x, top + 10, '#d6cfc6');
  } else {
    c.paint(S.poly([[30, top], [42, top], [36, top + 12]]).and(torso), SHIRT);
    if (f.tie) c.paint(S.poly([[35, top + 1], [37, top + 1], [38, top + 10], [36, top + 13], [34, top + 10]]), { o: '#200808', s: f.tie, b: f.tie, l: f.tie });
    c.line(29, top + 1, 35, top + 13, suit.o);
    c.line(43, top + 1, 37, top + 13, suit.o);
  }
  if (f.medals) {
    for (const [x, col] of [[39, '#f6d76a'], [41, '#d42a2a'], [43, '#f6d76a']]) {
      c.px(x, top + 6, col);
      c.px(x, top + 7, col);
    }
    c.line(39, top + 5, 43, top + 5, '#3d4f86');
  }
  for (const side of [-1, 1]) {
    const hand = side > 0 ? handR : [20 - wide, 54 + bob];
    c.paint(S.capsule([[36 + side * (11 + wide), top + 5], [hand[0], hand[1] - 3]], 3), suit);
    c.paint(S.circle(hand[0], hand[1], 2.7), skin);
  }
  const [px, py] = handR;
  if (f.prop === 'book') {
    c.paint(S.rect(px - 1, py - 8, px + 6, py + 1), { o: '#2a0c0c', s: '#6e1c1c', b: '#963020', l: '#b84a30' });
    c.line(px + 6, py - 7, px + 6, py, '#ece9e3');
  } else if (f.prop === 'megaphone') {
    c.paint(S.poly([[px, py - 4], [px + 10, py - 10], [px + 10, py + 3], [px, py - 1]]), SHIRT);
    c.line(px + 10, py - 10, px + 10, py + 3, '#d42a2a');
  } else if (f.prop === 'donut') {
    const ring = S.circle(px + 3, py - 4, 5.5);
    c.paint(ring, DONUT);
    c.fill(ring.filter((x, y) => y < py - 4), '#f09ab8');
    c.fill(S.circle(px + 3, py - 4, 1.6), DONUT.o);
  } else if (f.prop === 'wheel') {
    c.paint(S.circle(px + 2, py - 4, 6).sub(S.circle(px + 2, py - 4, 3.8)), SUITS.black);
    c.line(px - 3, py - 4, px + 7, py - 4, SUITS.black.l);
    c.line(px + 2, py - 4, px + 2, py + 1, SUITS.black.l);
  } else if (f.prop === 'phone') {
    c.paint(S.rect(px, py - 10, px + 5, py - 1), SUITS.black);
    c.fill(S.rect(px + 1, py - 9, px + 4, py - 3), '#8cd0ff');
  } else if (f.prop === 'scissors') {
    c.line(px - 1, py - 12, px + 4, py - 2, STEEL);
    c.line(px + 4, py - 12, px - 1, py - 2, STEEL);
    c.paint(S.circle(px - 1, py, 1.6), SUITS.red, { outline: false });
    c.paint(S.circle(px + 5, py, 1.6), SUITS.red, { outline: false });
  } else if (f.prop === 'bell') {
    c.paint(S.poly([[px - 1, py - 2], [px + 8, py - 2], [px + 6, py - 9], [px + 1, py - 9]]), GOLD);
    c.paint(S.rect(px + 3, py - 12, px + 4, py - 10), WOOD, { outline: false });
    c.px(px + 3, py - 1, GOLD.o);
    c.px(px + 4, py - 1, GOLD.o);
  } else if (f.prop === 'accordion') {
    c.paint(S.rect(px - 4, py - 9, px + 6, py + 1), CAP);
    for (let x = px - 2; x <= px + 4; x += 2) c.line(x, py - 8, x, py, '#ece9e3');
  }

  // ---------- hlava ----------
  for (const side of [-1, 1]) {
    const e = S.ellipse(hx + side * (rx + 0.5), hy + 2, 2.6 * f.ears, 4.2 * f.ears);
    c.paint(e, skin);
    c.px(hx + side * (rx + 1), hy + 2, skin.s);
    c.px(hx + side * (rx + 1), hy + 3, skin.s);
  }
  let head = S.superellipse(hx, hy, rx, ry, f.jaw);
  if (f.jowls) head = head.or(S.ellipse(hx, hy + ry - 5, rx * 0.98, 7));
  const U = (x) => (x - hx) / rx;
  const V = (y) => (y - hy) / ry;
  c.paint(head, skin, { shade: (x, y) => (U(x) * 0.5 + V(y) * 0.62 > 0.62 ? -1 : 0) });

  const eyeY = hy + 1;
  const eyeDX = Math.round(rx * 0.45);
  const noseY = eyeY + 3 + f.nose * 2;
  const mouthY = noseY + 4;

  // Vousy (pod ústa a nos, kreslí se před nimi)
  if (f.beard)
    head.each((x, y) => {
      if (y <= noseY) return;
      if (f.beard === 'stubble' && (x + y) % 2) return;
      c.px(x, y, f.beard === 'full' ? ((x + y * 2) % 5 === 0 ? hair.l : hair.b) : f.hairColor === 'brown' ? '#b07a56' : '#9a8a84');
    });

  // Oči, váčky, obočí
  for (const side of [-1, 1]) {
    const ex = hx + side * eyeDX;
    for (let y = eyeY - 1; y <= eyeY + 1; y++) row(ex - 2, ex + 1, y, '#f5f1ea');
    for (let y = eyeY; y <= eyeY + 1; y++) row(ex - 1, ex, y, f.glasses ? '#3a5a78' : '#2a2018');
    row(ex - 2, ex + 1, eyeY - 2, '#3a1c14');
    if (f.droopy) row(ex - 2, ex + 1, eyeY - 1, skin.s);
    row(ex - 2, ex + 1, eyeY + 2, skin.s);
    if (f.bags) {
      row(ex - 2, ex + 1, eyeY + 4, skin.s);
      c.px(ex - 3, eyeY + 3, skin.s);
      c.px(ex + 2, eyeY + 3, skin.s);
    }
    const [thick, tilt] = f.brow;
    const by = eyeY - 5;
    for (let t = 0; t < thick; t++) c.line(ex + side * 3, by + t - Math.max(0, tilt) + (tilt < 0 ? -tilt : 0), ex - side * 3, by + t + (tilt > 0 ? tilt : 0), hair.o);
  }

  // Nos
  const nw = f.nose;
  for (let y = eyeY + 1; y <= noseY; y++) c.px(hx + nw - 1, y, skin.s);
  row(hx - nw, hx + nw, noseY + 1, skin.s);
  c.px(hx - nw, noseY + 1, '#9a5a48');
  c.px(hx + nw, noseY + 1, '#9a5a48');
  for (let y = noseY - nw; y <= noseY; y++) c.px(hx - 1, y, skin.l);
  if (nw >= 3) c.fill(S.ellipse(hx, noseY - 1, nw, 2), skin.l);

  // Vrásky
  if (f.lines)
    for (const side of [-1, 1]) c.line(hx + side * (nw + 2), noseY, hx + side * (f.mouthW + 3), mouthY + 1, skin.s);
  if (f.forehead) {
    row(hx - 5, hx + 5, hy - ry * 0.45, skin.s);
    row(hx - 4, hx + 3, hy - ry * 0.45 - 3, skin.s);
  }

  // Ústa
  const mw = f.mouthW;
  if (f.mouth === 'grin') {
    row(hx - mw, hx + mw, mouthY - 1, MOUTH);
    row(hx - mw + 1, hx + mw - 1, mouthY, '#f5f1ea');
    row(hx - mw + 1, hx + mw - 1, mouthY + 1, MOUTH);
    c.px(hx - mw - 1, mouthY - 2, MOUTH);
    c.px(hx + mw + 1, mouthY - 2, MOUTH);
  } else {
    row(hx - mw, hx + mw, mouthY, MOUTH);
    const d = f.mouth === 'smile' ? -1 : f.mouth === 'frown' ? 1 : 0;
    if (d) {
      c.px(hx - mw - 1, mouthY + d, MOUTH);
      c.px(hx + mw + 1, mouthY + d, MOUTH);
    }
    row(hx - 2, hx + 2, mouthY + 2, skin.s);
  }

  // Brýle
  if (f.glasses) {
    const g = '#1c1a18';
    for (const side of [-1, 1]) {
      const ex = hx + side * eyeDX;
      row(ex - 4, ex + 3, eyeY - 3, g);
      row(ex - 4, ex + 3, eyeY + 3, g);
      for (let y = eyeY - 3; y <= eyeY + 3; y++) {
        c.px(ex - 4, y, g);
        c.px(ex + 3, y, g);
      }
      row(side < 0 ? hx - rx : ex + 3, side < 0 ? ex - 4 : hx + rx, eyeY - 1, g);
    }
    row(hx - eyeDX + 3, hx + eyeDX - 4, eyeY - 1, g);
  }

  // ---------- vlasy ----------
  const dome = S.superellipse(hx, hy, rx + 1.2, ry + 1.2, f.jaw);
  const m = f.mirrorHair ? -1 : 1;
  let mask = null;
  if (f.hair === 'side')
    mask = dome
      .filter((x, y) => V(y) < -0.56 + 0.24 * m * U(x) + 0.5 * Math.abs(U(x)) ** 3)
      .or(S.ellipse(hx - 2 * m, hy - ry, rx * 0.85, 3.5));
  if (f.hair === 'quiff')
    mask = dome.filter((x, y) => V(y) < -0.62 + 0.55 * Math.abs(U(x)) ** 3).or(S.ellipse(hx + 3, hy - ry - 1, rx * 0.6, 4.5));
  if (f.hair === 'slick')
    mask = dome.filter((x, y) => V(y) < -0.7 + 0.6 * Math.abs(U(x)) ** 3).or(S.ellipse(hx, hy - ry, rx * 0.8, 3.5));
  if (f.hair === 'thin') mask = dome.filter((x, y) => Math.abs(U(x)) > 0.74 && V(y) < 0.05 && V(y) > -0.72);
  if (f.hair === 'cap') mask = dome.filter((x, y) => Math.abs(U(x)) > 0.8 && V(y) < 0.1 && V(y) > -0.5);
  if (f.hair === 'bob' || f.hair === 'long') {
    mask = dome.filter((x, y) => V(y) < -0.52 + 0.5 * Math.abs(U(x)) ** 3 || (Math.abs(U(x)) > 0.8 && V(y) < 0.72));
    if (f.hair === 'long')
      for (const side of [-1, 1]) mask = mask.or(S.capsule([[hx + side * rx, hy - 4], [hx + side * (rx + 1), 45 + bob]], 2.6));
  }
  if (f.hair === 'dreads') {
    mask = dome.filter((x, y) => V(y) < -0.5 + 0.5 * Math.abs(U(x)) ** 3);
    for (const side of [-1, 1])
      for (const [dx, len] of [[0, 50], [3, 47], [-3, 52]])
        mask = mask.or(S.capsule([[hx + side * (rx - 1 + dx), hy - 7], [hx + side * (rx + 1 + dx), len + bob]], 1.7));
  }
  if (mask) {
    c.paint(mask, hair, { hw: 2, sw: 2 });
    mask.each((x, y) => {
      const inner = mask.get(x + 2, y) && mask.get(x - 2, y) && mask.get(x, y + 2) && mask.get(x, y - 2);
      if (f.hair === 'dreads' && y > hy + 2) {
        if (y % 4 === 0) c.px(x, y, hair.s); // články dredů
      } else if (inner && (x * m + y * 2 + 100) % 7 === 0) c.px(x, y, hair.l);
      else if (inner && (x * m + y * 2 + 100) % 7 === 3) c.px(x, y, hair.s);
    });
  }
  if (f.hair === 'thin') {
    // Pár řídkých pramenů přes pleš
    for (const [x0, x1, y] of [[-8, 6, -ry + 1], [-10, 3, -ry + 3], [-5, 9, -ry + 2]]) row(hx + x0, hx + x1, hy + y, hair.b);
  }
  if (f.hair === 'cap') {
    const crown = dome.filter((x, y) => V(y) < -0.44).or(S.ellipse(hx, hy - ry + 2, rx * 0.95, 5));
    c.paint(crown, CAP, { hw: 2, sw: 2 });
    c.paint(S.rect(hx - rx - 1, hy - Math.round(ry * 0.44) - 1, hx + rx + 9, hy - Math.round(ry * 0.44) + 1), CAP);
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

// Lajk (srdíčko) a zvonek: střely nových politiků.
export function drawLike() {
  const c = new Canvas(12, 12);
  const S = shapes(12, 12);
  const heart = S.circle(4, 4, 2.6).or(S.circle(8, 4, 2.6)).or(S.poly([[1, 5], [11, 5], [6, 11]]));
  c.paint(heart, { o: '#4a0c20', s: '#c02a58', b: '#f0508a', l: '#ffb0cc' });
  return c;
}

export function drawBell() {
  const c = new Canvas(12, 12);
  const S = shapes(12, 12);
  c.paint(S.poly([[1, 9], [11, 9], [9, 2], [3, 2]]), GOLD);
  c.px(5, 10, GOLD.o);
  c.px(6, 10, GOLD.o);
  return c;
}
