// Malá knihovna na generování pixel artu kódem: masky tvarů, stínování, obrysy, export PNG.
import zlib from 'node:zlib';

const hexCache = new Map();
export function hex(h, a = 255) {
  const key = h + a;
  let c = hexCache.get(key);
  if (!c) {
    const s = h.replace('#', '');
    c = [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16), a];
    hexCache.set(key, c);
  }
  return c;
}

export class Mask {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.d = new Uint8Array(w * h);
  }
  get(x, y) {
    return x >= 0 && y >= 0 && x < this.w && y < this.h && this.d[y * this.w + x] === 1;
  }
  static from(w, h, fn) {
    const m = new Mask(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (fn(x, y)) m.d[y * w + x] = 1;
    return m;
  }
  or(o) {
    return Mask.from(this.w, this.h, (x, y) => this.get(x, y) || o.get(x, y));
  }
  and(o) {
    return Mask.from(this.w, this.h, (x, y) => this.get(x, y) && o.get(x, y));
  }
  sub(o) {
    return Mask.from(this.w, this.h, (x, y) => this.get(x, y) && !o.get(x, y));
  }
  filter(fn) {
    return Mask.from(this.w, this.h, (x, y) => this.get(x, y) && fn(x, y));
  }
  erode(n) {
    return Mask.from(this.w, this.h, (x, y) => {
      for (let dy = -n; dy <= n; dy++)
        for (let dx = -n; dx <= n; dx++)
          if (Math.abs(dx) + Math.abs(dy) <= n + 1 && !this.get(x + dx, y + dy)) return false;
      return true;
    });
  }
  each(fn) {
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) if (this.d[y * this.w + x]) fn(x, y);
  }
}

function distToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : ((px - ax) * dx + (py - ay) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

// Továrna na tvary pro plátno dané velikosti.
export function shapes(w, h) {
  return {
    from: (fn) => Mask.from(w, h, fn),
    ellipse: (cx, cy, rx, ry) => Mask.from(w, h, (x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1),
    circle: (cx, cy, r) => Mask.from(w, h, (x, y) => (x - cx) ** 2 + (y - cy) ** 2 <= r * r),
    // Superelipsa: n = 2 je elipsa, vyšší n dává hranatější tvar.
    superellipse: (cx, cy, rx, ry, n) =>
      Mask.from(w, h, (x, y) => Math.abs((x - cx) / rx) ** n + Math.abs((y - cy) / ry) ** n <= 1),
    rect: (x0, y0, x1, y1) => Mask.from(w, h, (x, y) => x >= x0 && x <= x1 && y >= y0 && y <= y1),
    poly: (pts) =>
      Mask.from(w, h, (x, y) => {
        const px = x + 0.01;
        const py = y + 0.01;
        let inside = false;
        for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
          const [xi, yi] = pts[i];
          const [xj, yj] = pts[j];
          if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
        }
        return inside;
      }),
    capsule: (pts, r) =>
      Mask.from(w, h, (x, y) => {
        for (let i = 0; i < pts.length - 1; i++)
          if (distToSegment(x, y, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]) <= r) return true;
        return false;
      }),
  };
}

export class Canvas {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.d = new Uint8ClampedArray(w * h * 4);
  }
  px(x, y, color) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const c = typeof color === 'string' ? hex(color) : color;
    const i = (y * this.w + x) * 4;
    const a = c[3] / 255;
    if (a >= 1 || this.d[i + 3] === 0) {
      this.d[i] = c[0];
      this.d[i + 1] = c[1];
      this.d[i + 2] = c[2];
      this.d[i + 3] = c[3];
    } else {
      this.d[i] = c[0] * a + this.d[i] * (1 - a);
      this.d[i + 1] = c[1] * a + this.d[i + 1] * (1 - a);
      this.d[i + 2] = c[2] * a + this.d[i + 2] * (1 - a);
      this.d[i + 3] = Math.max(this.d[i + 3], c[3]);
    }
  }
  fill(mask, color) {
    mask.each((x, y) => this.px(x, y, color));
  }
  line(x0, y0, x1, y1, color) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let i = 0; i <= n; i++) this.px(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n, color);
  }
  // Vykreslí tvar: tmavý obrys kolem, uvnitř tři tóny (stín, základ, světlo). Světlo jde zleva shora.
  // ramp = { o: obrys, s: stín, b: základ, l: světlo }; shade(x, y) vrací -1 stín, 0 základ, 1 světlo.
  paint(mask, ramp, { outline = true, shade = null, hw = 1, sw = 2 } = {}) {
    if (outline && ramp.o) {
      for (let y = 0; y < this.h; y++)
        for (let x = 0; x < this.w; x++)
          if (
            !mask.get(x, y) &&
            (mask.get(x + 1, y) || mask.get(x - 1, y) || mask.get(x, y + 1) || mask.get(x, y - 1))
          )
            this.px(x, y, ramp.o);
    }
    mask.each((x, y) => {
      let t;
      if (shade) t = shade(x, y);
      else {
        const sh = !mask.get(x + sw, y) || !mask.get(x, y + sw);
        const hl = !mask.get(x - hw, y) || !mask.get(x, y - hw);
        t = sh && !hl ? -1 : hl && !sh ? 1 : 0;
      }
      this.px(x, y, t < 0 ? ramp.s : t > 0 ? ramp.l : ramp.b);
    });
  }
  blit(src, dx, dy, scale = 1) {
    for (let y = 0; y < src.h; y++)
      for (let x = 0; x < src.w; x++) {
        const i = (y * src.w + x) * 4;
        if (src.d[i + 3] === 0) continue;
        const c = [src.d[i], src.d[i + 1], src.d[i + 2], src.d[i + 3]];
        for (let sy = 0; sy < scale; sy++)
          for (let sx = 0; sx < scale; sx++) this.px(dx + x * scale + sx, dy + y * scale + sy, c);
      }
  }
  clear(color) {
    const c = hex(color);
    for (let i = 0; i < this.d.length; i += 4) this.d.set(c, i);
  }
  scaled(scale) {
    const out = new Canvas(this.w * scale, this.h * scale);
    out.blit(this, 0, 0, scale);
    return out;
  }
}

export function encodePNG(canvas) {
  const { w, h, d } = canvas;
  const stride = w * 4 + 1;
  const raw = Buffer.alloc(stride * h);
  for (let y = 0; y < h; y++) Buffer.from(d.buffer, y * w * 4, w * 4).copy(raw, y * stride + 1);
  const chunk = (type, data) => {
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const out = Buffer.alloc(body.length + 8);
    out.writeUInt32BE(data.length, 0);
    body.copy(out, 4);
    out.writeUInt32BE(zlib.crc32(body) >>> 0, body.length + 4);
    return out;
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bitová hloubka
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}
