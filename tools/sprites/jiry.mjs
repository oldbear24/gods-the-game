// Jiry: malý lučištník s japonským lukem (yumi). Mřížka 128×128, postava je schválně menší než Truplik.
import { Canvas, shapes, hex } from './px.mjs';

const SIZE = 128;
const PAL = {
  skin: { o: '#5a2e26', s: '#cc8c70', b: '#eab292', l: '#f7d0b4' },
  hair: { o: '#120a06', s: '#281810', b: '#3c281c', l: '#5a4030' },
  shirt: { o: '#2a3a30', s: '#6a8a74', b: '#8fb09a', l: '#b4d0bc' },
  pants: { o: '#12141c', s: '#232a40', b: '#333c5a', l: '#46527a' },
  sandal: { o: '#2a1408', s: '#5a2f18', b: '#804522', l: '#a86432' },
  bow: { o: '#2a0a06', s: '#5a1810', b: '#84261a', l: '#b04030' },
  wood: { o: '#35200f', s: '#6c4222', b: '#96622f', l: '#bd8749' },
  band: { o: '#6f6a66', s: '#c2bdb7', b: '#f2efe9', l: '#ffffff' },
  strap: '#3a5a8a',
  frame: '#0c0c0e',
  string: '#e8e2d4',
};

// pose: { bob, liftL, liftR, draw: natažený luk }
export function drawJiry(pose = {}) {
  const c = new Canvas(SIZE, SIZE);
  const S = shapes(SIZE, SIZE);
  const bob = pose.bob ?? 0;
  const hx = 64;
  const hy = 62 + bob;
  const rx = 21;
  const ry = 20;
  const U = (x) => (x - hx) / rx;
  const V = (y) => (y - hy) / ry;
  const row = (x0, x1, y, col) => {
    for (let x = Math.round(x0); x <= Math.round(x1); x++) c.px(x, Math.round(y), col);
  };

  c.fill(S.ellipse(64, 121, 26, 4), hex('#000000', 70));

  // Toulec na zádech
  c.paint(S.capsule([[80, 100 + bob], [90, 74 + bob]], 3.2), PAL.wood);
  for (const [dx, dy] of [[0, 0], [2, -3], [-2, -2]]) {
    c.line(90 + dx, 72 + bob + dy, 92 + dx, 66 + bob + dy, PAL.band.b);
    c.px(92 + dx, 65 + bob + dy, '#d42a2a');
  }

  // Nohy a sandály
  for (const side of [-1, 1]) {
    const lift = side < 0 ? pose.liftL ?? 0 : pose.liftR ?? 0;
    const x0 = side < 0 ? 54 : 66;
    c.paint(S.rect(x0, 102 + bob, x0 + 8, 113 - lift), PAL.pants);
    c.paint(S.rect(x0 - (side < 0 ? 2 : 0), 114 - lift, x0 + 8 + (side > 0 ? 2 : 0), 120 - lift), PAL.sandal);
  }

  // Trup: zelené tričko a popruhy batohu
  const top = 81 + bob;
  const torso = S.poly([[48, top + 5], [53, top], [75, top], [80, top + 5], [78, 105 + bob], [50, 105 + bob]]);
  c.paint(torso, PAL.shirt, { sw: 3 });
  for (const x of [54, 73]) for (let y = top + 1; y < top + 20; y++) if (torso.get(x, y)) { c.px(x, y, PAL.strap); c.px(x + 1, y, PAL.strap); }

  // Luk yumi: delší horní rameno, drží se ve spodní třetině
  const grip = [36, 97 + bob];
  const tipTop = [31, 36 + bob];
  const tipBot = [34, 119];
  const limb = [tipBot, [39, 109], grip, [41, 78 + bob], [39, 56 + bob], tipTop];
  const nock = pose.draw ? [60, 96 + bob] : null;
  if (nock) {
    c.line(tipTop[0], tipTop[1], nock[0], nock[1], PAL.string);
    c.line(tipBot[0], tipBot[1], nock[0], nock[1], PAL.string);
  } else {
    c.line(tipTop[0], tipTop[1], tipBot[0], tipBot[1], PAL.string);
  }
  c.paint(S.capsule(limb, 1.6), PAL.bow);
  if (nock) {
    // Šíp na tětivě
    c.line(26, nock[1], nock[0], nock[1], PAL.wood.l);
    c.line(26, nock[1] + 1, nock[0], nock[1] + 1, PAL.wood.s);
    c.paint(S.poly([[20, nock[1] + 0.5], [27, nock[1] - 3], [27, nock[1] + 4]]), { o: '#22262d', s: '#687480', b: '#9ba7b3', l: '#dbe3ea' });
  }

  // Ruce: levá drží luk, pravá visí nebo natahuje tětivu
  c.paint(S.capsule([[51, top + 7], [45, top + 12]], 4.5), PAL.shirt);
  c.paint(S.capsule([[44, top + 13], [grip[0] + 2, grip[1]]], 3.2), PAL.skin);
  c.paint(S.circle(grip[0] + 1, grip[1], 3.6), PAL.skin);
  const handR = nock ? [nock[0] + 2, nock[1]] : [87, 101 + bob];
  c.paint(S.capsule([[77, top + 7], nock ? [74, top + 13] : [82, top + 12]], 4.5), PAL.shirt);
  c.paint(S.capsule([nock ? [73, top + 14] : [83, top + 13], handR], 3.2), PAL.skin);
  c.paint(S.circle(handR[0], handR[1], 3.6), PAL.skin);

  // Hlava
  for (const side of [-1, 1]) {
    c.paint(S.ellipse(hx + side * (rx + 0.5), hy + 3, 3.4, 5.4), PAL.skin);
    c.px(hx + side * (rx + 1), hy + 3, PAL.skin.s);
  }
  c.px(hx + rx + 1, hy + 9, '#f6d76a'); // náušnice
  const head = S.superellipse(hx, hy, rx, ry, 2.4);
  c.paint(head, PAL.skin, { shade: (x, y) => (U(x) * 0.5 + V(y) * 0.62 > 0.62 ? -1 : 0) });

  // Plnovous: od nosu dolů a pořádně pod bradu
  const beard = head
    .filter((x, y) => V(y) > 0.3 || (Math.abs(U(x)) > 0.72 && V(y) > 0.05))
    .or(S.ellipse(hx, hy + ry + 1, 17, 11).filter((x, y) => y > hy + 6));
  c.paint(beard, PAL.hair, { hw: 2, sw: 3 });
  beard.each((x, y) => {
    const inner = beard.get(x + 2, y) && beard.get(x - 2, y) && beard.get(x, y + 3);
    if (inner && (x * 3 + y) % 7 === 0) c.px(x, y, PAL.hair.l);
  });
  row(hx - 4, hx + 4, hy + 11, '#a05a4a'); // ústa ve vousech
  c.px(hx + 5, hy + 10, '#a05a4a');

  // Oči, obočí, nos
  const eyeY = hy;
  for (const side of [-1, 1]) {
    const ex = hx + side * 9;
    for (let y = eyeY - 1; y <= eyeY + 1; y++) row(ex - 2, ex + 2, y, '#f5f1ea');
    for (let y = eyeY - 1; y <= eyeY + 1; y++) row(ex, ex + 1, y, '#2a1c14');
    for (let t = 0; t < 2; t++) c.line(ex - side * 4, eyeY - 7 + t + 1, ex + side * 5, eyeY - 7 + t, PAL.hair.o);
  }
  for (let y = eyeY + 1; y <= eyeY + 6; y++) c.px(hx + 2, y, PAL.skin.s);
  row(hx - 2, hx + 2, eyeY + 7, PAL.skin.s);
  for (let y = eyeY + 3; y <= eyeY + 6; y++) c.px(hx - 1, y, PAL.skin.l);

  // Hranaté černé brýle s lehce zabarvenými skly
  for (const side of [-1, 1]) {
    const ex = hx + side * 9;
    c.fill(S.rect(ex - 5, eyeY - 3, ex + 5, eyeY + 3), hex('#7a5040', 60));
    for (let t = 0; t < 2; t++) {
      row(ex - 6, ex + 6, eyeY - 4 - t + 1, PAL.frame);
      row(ex - 6, ex + 6, eyeY + 4, PAL.frame);
    }
    for (let y = eyeY - 4; y <= eyeY + 4; y++) {
      c.px(ex - 6, y, PAL.frame);
      c.px(ex + 6, y, PAL.frame);
    }
    row(side < 0 ? hx - rx - 1 : ex + 6, side < 0 ? ex - 6 : hx + rx + 1, eyeY - 2, PAL.frame);
  }
  row(hx - 3, hx + 3, eyeY - 2, PAL.frame);

  // Vlasy stažené dozadu: vysoké čelo, drdol nahoře
  const dome = S.superellipse(hx, hy, rx + 1.2, ry + 1.2, 2.4);
  const hair = dome
    .filter((x, y) => V(y) < -0.74 + 0.62 * Math.abs(U(x)) ** 2.5 || (Math.abs(U(x)) > 0.86 && V(y) < 0.1))
    .or(S.circle(hx + 6, hy - ry - 4, 7));
  c.paint(hair, PAL.hair, { hw: 2, sw: 2 });
  hair.each((x, y) => {
    if (hair.get(x + 2, y) && hair.get(x - 2, y) && hair.get(x, y - 2) && (x + y * 3) % 6 === 0) c.px(x, y, PAL.hair.l);
  });

  // Čelenka hačimaki s červeným kolečkem
  const band = head.filter((x, y) => V(y) > -0.62 && V(y) < -0.42);
  c.paint(band, PAL.band, { hw: 1, sw: 1 });
  c.fill(S.circle(hx, hy - Math.round(ry * 0.52), 2.2), '#d42a2a');
  c.paint(S.capsule([[hx + rx, hy - 10], [hx + rx + 7, hy - 6]], 1.3), PAL.band);
  c.paint(S.capsule([[hx + rx, hy - 10], [hx + rx + 6, hy - 13]], 1.3), PAL.band);
  return c;
}

// Šíp letící doprava (ve hře se otáčí podle směru).
export function drawArrow() {
  const c = new Canvas(28, 9);
  const S = shapes(28, 9);
  c.line(3, 4, 22, 4, PAL.wood.l);
  c.paint(S.poly([[27, 4.5], [20, 1], [20, 8]]), { o: '#22262d', s: '#687480', b: '#9ba7b3', l: '#dbe3ea' });
  for (const x of [1, 3, 5]) {
    c.px(x, 2, PAL.band.b);
    c.px(x, 6, PAL.band.b);
    c.px(x + 1, 3, '#d42a2a');
    c.px(x + 1, 5, '#d42a2a');
  }
  return c;
}
