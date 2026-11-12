// Truplik: tank, nepříjemný zrzek. Tři návrhové varianty na mřížce 128×128.
import { Canvas, shapes, hex } from './px.mjs';

const SIZE = 128;

const PAL = {
  skin: { o: '#5a2e26', s: '#cc8c70', b: '#eab292', l: '#f7d0b4' },
  hair: { o: '#56200e', s: '#9a3c12', b: '#c95c1c', l: '#ee8a3c' },
  shaved: '#8a3a16',
  beard: { s: '#8f4f2a', b: '#b0673a', l: '#c8855c' },
  earInner: '#dc8f86',
  fluff: '#f6ead8',
  brow: '#6b3214',
  lid: '#3a1c14',
  eyeWhite: '#f5f1ea',
  iris: '#5d8496',
  pupil: '#182026',
  mouth: '#78382e',
  lip: '#d8937e',
  nostril: '#9a5a48',
  hoodie: { o: '#1c1212', s: '#32201f', b: '#4b3331', l: '#654744' },
  collar: { o: '#1c1212', s: '#4b3331', b: '#5e423f', l: '#77575337'.slice(0, 7) },
  tee: { o: '#6f6a66', s: '#c2bdb7', b: '#ece9e3', l: '#ffffff' },
  string: '#d6cfc6',
  pants: { o: '#12141c', s: '#262b3b', b: '#373e55', l: '#4a546f' },
  shoe: { o: '#141110', s: '#2b2523', b: '#403835', l: '#5c534e' },
  steel: { o: '#22262d', s: '#687480', b: '#9ba7b3', l: '#dbe3ea' },
  gold: { o: '#3a2608', s: '#a8741c', b: '#d9a32e', l: '#f6d76a' },
  wood: { o: '#35200f', s: '#6c4222', b: '#96622f', l: '#bd8749' },
  rust: { o: '#3a120a', s: '#6e2415', b: '#963420', l: '#b94a2c' },
};

export const VARIANTS = {
  a: {
    name: 'Chibi',
    note: 'Velká hlava, malé tělo, kulatý dřevěný štít.',
    hx: 64, hy: 45, rx: 27, ry: 25, overlap: 5,
    sh: 20, hip: 16, torsoH: 30, footY: 120,
    armR: 5, armLen: 20, maceDx: 17, maceLen: 26, ballR: 6,
    shield: 'round',
  },
  b: {
    name: 'Hrdina',
    note: 'Vyšší postava, ocelové nárameníky, věžový štít.',
    hx: 64, hy: 30, rx: 17, ry: 17, overlap: 3,
    sh: 25, hip: 19, torsoH: 42, footY: 121,
    armR: 6, armLen: 30, maceDx: 14, maceLen: 30, ballR: 7,
    shield: 'tower', pauldrons: true,
  },
  c: {
    name: 'Kocour',
    note: 'Střední proporce, kočičí ocas, štít s tlapkou.',
    hx: 64, hy: 38, rx: 22, ry: 21, overlap: 5,
    sh: 22, hip: 18, torsoH: 36, footY: 121,
    armR: 5.5, armLen: 24, maceDx: 15, maceLen: 28, ballR: 6.5,
    shield: 'kite', tail: true,
  },
};

const sphere = (cx, cy, r) => (x, y) => {
  const d = ((x - cx) / r) * 0.6 + ((y - cy) / r) * 0.6;
  return d > 0.4 ? -1 : d < -0.4 ? 1 : 0;
};

// pose: { bob: posun těla nahoru/dolů, liftL/liftR: zvednutí nohy, swing: palcát v úderu }
export function drawTruplik(key, pose = {}) {
  const P = { ...VARIANTS[key] };
  P.hy += pose.bob ?? 0;
  const c = new Canvas(SIZE, SIZE);
  const S = shapes(SIZE, SIZE);
  const { hx, hy, rx, ry, sh, hip } = P;
  const cx = hx;
  const top = hy + ry - P.overlap;
  const bot = top + P.torsoH;
  const footY = P.footY;

  // Stín na zemi
  c.fill(S.ellipse(cx, footY, sh + 10, 4), hex('#000000', 70));

  if (P.tail) drawTail(c, S, cx - hip, bot);

  // Kapuce shrnutá za krkem
  c.paint(S.ellipse(cx, top + 2, sh - 3, 8), PAL.hoodie);

  drawLegs(c, S, cx, hip, bot, footY, [pose.liftL ?? 0, pose.liftR ?? 0]);
  drawTorso(c, S, P, cx, top, bot);
  drawMaceArm(c, S, P, cx, top, pose.swing);
  if (P.pauldrons) {
    for (const side of [-1, 1]) {
      const px = cx + side * (sh - 1);
      c.paint(S.ellipse(px, top + 6, 9, 7), PAL.steel, { shade: sphere(px, top + 6, 8) });
    }
  }
  drawHead(c, S, P);
  drawShieldArm(c, S, P, cx, top);
  return c;
}

function drawTail(c, S, x, bot) {
  const pts = [[x + 3, bot - 3], [x - 8, bot + 10], [x - 18, bot + 13], [x - 25, bot + 4]];
  c.paint(S.capsule(pts, 3.2), PAL.hair);
  const tip = S.circle(x - 25, bot + 4, 3.2).or(S.circle(x - 24, bot + 6, 3.2)).and(S.capsule(pts, 3.2));
  c.fill(tip, PAL.fluff);
}

function drawLegs(c, S, cx, hip, bot, groundY, lifts) {
  const legTop = bot - 3;
  for (const side of [-1, 1]) {
    const footY = groundY - lifts[side < 0 ? 0 : 1];
    const legBot = footY - 6;
    const x0 = side < 0 ? cx - hip + 1 : cx + 2;
    const x1 = side < 0 ? cx - 2 : cx + hip - 1;
    c.paint(S.rect(x0, legTop, x1, legBot), PAL.pants);
    const sx0 = x0 - (side < 0 ? 3 : 0);
    const sx1 = x1 + (side > 0 ? 3 : 0);
    const shoe = S.rect(sx0, legBot + 1, sx1, footY).sub(
      S.from((x, y) => y === legBot + 1 && (x === sx0 || x === sx1)),
    );
    c.paint(shoe, PAL.shoe);
    for (let x = sx0 + 1; x < sx1; x++) c.px(x, footY, PAL.shoe.l); // podrážka
  }
}

function drawTorso(c, S, P, cx, top, bot) {
  const { sh, hip, rx } = P;
  const torso = S.poly([
    [cx - sh + 5, top], [cx + sh - 5, top], [cx + sh, top + 6],
    [cx + hip, bot], [cx - hip, bot], [cx - sh, top + 6],
  ]);
  c.paint(torso, PAL.hoodie, { sw: 3 });
  // Lem mikiny
  for (let x = cx - hip + 1; x < cx + hip; x++) if (torso.get(x, bot - 4)) c.px(x, bot - 4, PAL.hoodie.o);
  // Klokaní kapsa
  const pocket = S.poly([
    [cx - hip + 4, bot - 6], [cx - hip + 9, bot - 17], [cx + hip - 9, bot - 17], [cx + hip - 4, bot - 6],
  ]);
  c.paint(pocket, PAL.hoodie);
  // Límec kapuce a bílé tričko
  const tw = Math.round(rx * 0.33);
  const th = 9;
  const tee = S.ellipse(cx, top + 3, tw, th).and(torso);
  const collar = S.ellipse(cx, top + 3, tw + 5, th + 4).and(torso).sub(tee);
  c.paint(collar, PAL.collar);
  c.paint(tee, PAL.tee);
  // Šňůrky s kovovými očky
  for (const side of [-1, 1]) {
    const x = cx + side * (tw + 2);
    const y = top + th + 5;
    c.px(x, y - 1, PAL.steel.l);
    for (let i = 0; i < 9; i++) c.px(x + (i > 5 ? side : 0), y + i, PAL.string);
  }
}

function drawMaceArm(c, S, P, cx, top, swing = false) {
  const { sh, armR } = P;
  const shoulder = [cx - sh + 2, top + 8];
  const hand = swing ? [cx - sh - 9, top + P.armLen - 5] : [cx - sh - 6, top + P.armLen];
  const tip = swing ? [hand[0] - 26, hand[1] + 9] : [hand[0] - P.maceDx, hand[1] - P.maceLen - 6];
  const butt = swing ? [hand[0] + 5, hand[1] - 1] : [hand[0] + 2, hand[1] + 6];
  // Meč: jílec, hlavice, záštita, čepel
  const len = Math.hypot(tip[0] - butt[0], tip[1] - butt[1]);
  const d = [(tip[0] - butt[0]) / len, (tip[1] - butt[1]) / len];
  const n = [-d[1], d[0]];
  const at = (t, side = 0) => [butt[0] + d[0] * t + n[0] * side, butt[1] + d[1] * t + n[1] * side];
  const guardT = 11;
  c.paint(S.capsule([butt, at(guardT)], 1.4), PAL.wood);
  c.paint(S.circle(butt[0], butt[1], 2.2), PAL.gold);
  c.paint(
    S.poly([at(guardT + 1, 3), at(len - 6, 3), at(len, 0), at(len - 6, -3), at(guardT + 1, -3)]),
    PAL.steel,
  );
  c.line(...at(guardT + 3), ...at(len - 7), PAL.steel.s); // žlábek čepele
  c.paint(S.capsule([at(guardT, 6), at(guardT, -6)], 1.6), PAL.gold);
  // Rukáv a ruka
  c.paint(S.capsule([shoulder, hand], armR), PAL.hoodie);
  c.paint(S.circle(hand[0], hand[1] + 2, armR - 1), PAL.skin);
}

function drawShieldArm(c, S, P, cx, top) {
  const { sh, armR } = P;
  c.paint(S.capsule([[cx + sh - 2, top + 8], [cx + sh + 3, top + P.armLen - 4]], armR), PAL.hoodie);

  if (P.shield === 'round') {
    const sx = cx + sh + 1;
    const sy = top + 25;
    c.paint(S.circle(sx, sy, 16), PAL.steel);
    const wood = S.circle(sx, sy, 13);
    c.paint(wood, PAL.wood);
    wood.each((x, y) => {
      if ((x - sx + 100) % 6 === 0) c.px(x, y, PAL.wood.s); // spáry mezi prkny
    });
    c.paint(S.circle(sx, sy, 4.5), PAL.steel, { shade: sphere(sx, sy, 4.5) });
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4 + 0.39;
      c.px(sx + Math.cos(a) * 14.6, sy + Math.sin(a) * 14.6, PAL.steel.o); // nýty
    }
  } else if (P.shield === 'tower') {
    const sx = cx + sh + 3;
    const sy = top + 32;
    const w = 14;
    const h = 26;
    const body = S.poly([
      [sx - w + 4, sy - h], [sx + w - 4, sy - h], [sx + w, sy - h + 4], [sx + w, sy + h - 6],
      [sx + w - 6, sy + h], [sx - w + 6, sy + h], [sx - w, sy + h - 6], [sx - w, sy - h + 4],
    ]);
    c.paint(body, PAL.steel);
    const field = body.erode(3);
    c.paint(field, PAL.rust);
    // Ocelový kříž přes pole
    c.paint(field.and(S.rect(sx - 2, 0, sx + 2, SIZE)).or(field.and(S.rect(0, sy - 8, SIZE, sy - 4))), PAL.steel, {
      outline: false,
    });
    c.paint(S.circle(sx, sy - 6, 4), PAL.steel, { shade: sphere(sx, sy - 6, 4) });
  } else {
    const sx = cx + sh + 2;
    const sy = top + 8;
    const w = 14;
    const body = S.poly([
      [sx - w + 3, sy], [sx + w - 3, sy], [sx + w, sy + 3], [sx + w, sy + 20],
      [sx, sy + 41], [sx - w, sy + 20], [sx - w, sy + 3],
    ]);
    c.paint(body, PAL.steel);
    c.paint(body.erode(3), PAL.hair);
    // Bílá kočičí tlapka
    const paw = S.ellipse(sx, sy + 20, 5, 4)
      .or(S.circle(sx - 6.5, sy + 14, 2))
      .or(S.circle(sx - 2.5, sy + 11, 2))
      .or(S.circle(sx + 2.5, sy + 11, 2))
      .or(S.circle(sx + 6.5, sy + 14, 2));
    c.fill(paw, PAL.fluff);
  }
}

function drawHead(c, S, P) {
  const { hx, hy, rx, ry } = P;
  const k = rx / 27;
  const U = (x) => (x - hx) / rx;
  const V = (y) => (y - hy) / ry;
  const N = 2.5;

  // Lidské uši
  const earRx = Math.max(2.5, rx * 0.14);
  const earRy = Math.max(3.5, ry * 0.22);
  for (const side of [-1, 1]) {
    const ex = hx + side * (rx - 0.5);
    const ey = hy + ry * 0.12;
    c.paint(S.ellipse(ex, ey, earRx, earRy), PAL.skin);
    c.px(ex + side * 0.5, ey, PAL.skin.s);
    c.px(ex + side * 0.5, ey + 1, PAL.skin.s);
  }

  // Hlava: široký obličej s hranatější čelistí
  const head = S.superellipse(hx, hy, rx, ry, N);
  c.paint(head, PAL.skin, { shade: (x, y) => (U(x) * 0.5 + V(y) * 0.62 > 0.62 ? -1 : 0) });

  // Strniště: husté na čelisti a licousech, řidší kolem pusy
  head.each((x, y) => {
    const u = U(x);
    const v = V(y);
    const au = Math.abs(u);
    const inBeard = v > 0.4 || (au > 0.8 && v > 0.08);
    if (!inBeard) return;
    const dense = v > 0.66 || au > 0.74;
    if (!dense && (x + y) % 2 === 0) return;
    const dark = u * 0.5 + v * 0.62 > 0.66;
    c.px(x, y, dark ? PAL.beard.s : dense ? PAL.beard.b : PAL.beard.l);
  });

  drawFace(c, P, k);

  // Kočičí uši (za vlasy)
  for (const side of [-1, 1]) {
    const a = [hx + side * rx * 0.3, hy - ry * 0.8];
    const b = [hx + side * rx * 1.0, hy - ry * 0.5];
    const t = [hx + side * rx * 0.95, hy - ry * 1.52];
    c.paint(S.poly([a, b, t]), PAL.hair);
    const g = [(a[0] + b[0] + t[0]) / 3, (a[1] + b[1] + t[1]) / 3];
    const shrink = (p) => [g[0] + (p[0] - g[0]) * 0.56, g[1] + (p[1] - g[1]) * 0.56];
    const inner = S.poly([shrink(a), shrink(b), shrink(t)]);
    inner.each((x, y) => {
      const fluffy = y > g[1] || (y > g[1] - 2 && (x + y) % 2 === 0);
      c.px(x, y, fluffy ? PAL.fluff : PAL.earInner);
    });
  }

  // Vlasy: čepice vlasů s linií nad čelem + rozcuchané špičky nahoře
  const hairline = (u) => -0.56 + 0.46 * Math.abs(u) ** 3;
  const cap = S.superellipse(hx, hy, rx * 1.03, ry * 1.05, N).filter((x, y) => {
    const jag = ((x * 7) % 5 === 0 ? 1 : 0) / ry;
    return V(y) < hairline(U(x)) + jag;
  });
  let hair = cap;
  const spikes = 7;
  for (let i = 0; i < spikes; i++) {
    const ub = -0.72 + i * (1.44 / (spikes - 1));
    const xb = hx + ub * rx;
    const yb = hy - ry * (1 - Math.abs(ub) ** N) ** (1 / N);
    const height = ry * [0.16, 0.34, 0.24, 0.4, 0.27, 0.36, 0.18][i];
    const lean = rx * [0.05, 0.2, 0.1, 0.24, 0.12, 0.26, 0.14][i];
    const bw = rx * 0.24;
    hair = hair.or(S.poly([[xb - bw, yb + 4], [xb + bw, yb + 4], [xb + lean, yb - height]]));
  }
  c.paint(hair, PAL.hair, { hw: 2, sw: 2 });
  hair.each((x, y) => {
    const au = Math.abs(U(x));
    const v = V(y);
    if (au > 0.78 && v > -0.6) {
      // Vyholené boky
      c.px(x, y, (x + y) % 2 === 0 ? PAL.shaved : PAL.hair.s);
      return;
    }
    const edge = !hair.get(x + 2, y) || !hair.get(x, y + 2) || !hair.get(x - 2, y) || !hair.get(x, y - 2);
    if (edge) return;
    const streak = (x + y * 2) % 9; // šikmé prameny
    if (streak === 0) c.px(x, y, PAL.hair.l);
    else if (streak === 4) c.px(x, y, PAL.hair.s);
  });
}

function drawFace(c, P, k) {
  const { hx, hy, rx, ry } = P;
  const ew = Math.max(4, Math.round(8 * k));
  const eh = Math.max(3, Math.round(5 * k));
  const ey = hy + Math.round(ry * 0.02);
  const big = k > 0.9;

  for (const side of [-1, 1]) {
    const ex = hx + side * Math.round(rx * 0.4);
    const x0 = ex - Math.floor(ew / 2);
    const y0 = ey - Math.floor(eh / 2);
    // Bělmo
    for (let y = 0; y < eh; y++)
      for (let x = 0; x < ew; x++) {
        if (ew >= 6 && y === eh - 1 && (x === 0 || x === ew - 1)) continue;
        c.px(x0 + x, y0 + y, PAL.eyeWhite);
      }
    // Duhovka se dívá do strany (pohled úkosem)
    const iw = Math.max(2, Math.round(ew * 0.5));
    const ix0 = x0 + ew - iw - 1;
    for (let y = 0; y < eh; y++) for (let x = 0; x < iw; x++) c.px(ix0 + x, y0 + y, PAL.iris);
    if (iw >= 4) {
      for (let y = 1; y < eh - 1; y++) for (let x = 1; x < iw - 1; x++) c.px(ix0 + x, y0 + y, PAL.pupil);
    } else {
      for (let y = 1; y < eh; y++) c.px(ix0 + Math.floor(iw / 2), y0 + y, PAL.pupil);
    }
    // Přivřené víčko: horní řada oka je víčko, nad ní tmavá linka
    for (let x = 0; x < ew; x++) c.px(x0 + x, y0, PAL.skin.s);
    for (let x = -1; x <= ew; x++) c.px(x0 + x, y0 - 1, PAL.lid);
    if (eh >= 4) c.px(ix0, y0 + 1, PAL.eyeWhite); // odlesk
    // Kruhy pod očima
    for (let x = 0; x < ew; x++) c.px(x0 + x, y0 + eh, PAL.skin.s);
    if (big) for (let x = 1; x < ew - 1; x++) if (x % 2) c.px(x0 + x, y0 + eh + 1, PAL.skin.s);

    // Obočí: vnitřní konec níž (zamračené), pravé povytažené (povýšené)
    const lift = side > 0 ? (big ? 2 : 1) : 0;
    const by = y0 - (big ? 5 : 3) - lift;
    const outer = ex + side * (Math.floor(ew / 2) + 2);
    const inner = ex - side * (Math.floor(ew / 2) + 1);
    const drop = big ? 3 : 2;
    const thick = k > 0.75 ? 2 : 1;
    for (let t = 0; t < thick; t++) c.line(outer, by + t, inner, by + drop + t, PAL.brow);
  }

  // Nos
  const ny = hy + Math.round(ry * 0.3);
  const nw = Math.max(1, Math.round(2.2 * k));
  for (let dy = -nw - 1; dy <= 0; dy++) c.px(hx + nw, ny + dy, PAL.skin.s);
  for (let dx = -nw; dx <= nw; dx++) c.px(hx + dx, ny + 1, PAL.skin.s);
  c.px(hx - nw, ny + 1, PAL.nostril);
  c.px(hx + nw, ny + 1, PAL.nostril);
  for (let dy = -nw; dy <= 0; dy++) c.px(hx - (nw > 1 ? 1 : 0), ny + dy, PAL.skin.l);

  // Pusa: samolibý úšklebek, pravý koutek nahoru
  const my = hy + Math.round(ry * 0.6);
  const mx0 = hx - Math.round(rx * 0.24);
  const mx1 = hx + Math.round(rx * 0.32);
  const rise = Math.max(1, Math.round(2.4 * k));
  for (let x = mx0; x <= mx1; x++) {
    const t = (x - mx0) / (mx1 - mx0);
    const dy = t > 0.6 ? -Math.round(((t - 0.6) / 0.4) * rise) : 0;
    c.px(x, my + dy, PAL.mouth);
    if (t > 0.2 && t < 0.6) c.px(x, my + 1, PAL.lip);
  }
  c.px(mx1 + 1, my - rise - 1, PAL.skin.s); // dolíček v koutku
  c.px(mx0 - 1, my, PAL.skin.s);
}
