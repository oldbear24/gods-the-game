// Trvalý postup: zlaťáky, obchod, skiny, úspěchy a souhrnné statistiky. Uloženo v prohlížeči.
import { CHARACTERS, type Stats, type Skin } from './characters';

export interface ShopItem {
  id: string;
  name: string;
  desc: string;
  max: number; // kolikrát jde koupit
  baseCost: number; // n-tý nákup stojí baseCost × n
  apply: (s: Stats, level: number) => void;
}

export const SHOP: ShopItem[] = [
  { id: 'hp', name: 'Guildovní svačina', desc: '+15 max. životů', max: 5, baseCost: 100, apply: (s, l) => (s.maxHp += 15 * l) },
  { id: 'dmg', name: 'Nabroušeno z domu', desc: '+6 % poškození', max: 5, baseCost: 100, apply: (s, l) => (s.damage *= 1 + 0.06 * l) },
  { id: 'speed', name: 'Lepší boty', desc: '+3 % rychlost pohybu', max: 5, baseCost: 100, apply: (s, l) => (s.speed *= 1 + 0.03 * l) },
  { id: 'magnet', name: 'Hlubší kapsy', desc: '+15 % dosah sbírání', max: 3, baseCost: 80, apply: (s, l) => (s.pickupRange *= 1 + 0.15 * l) },
  { id: 'armor', name: 'Podvlíkačky', desc: 'Každý zásah bolí o 1 méně', max: 2, baseCost: 400, apply: (s, l) => (s.armor += l) },
  { id: 'gold', name: 'Členské příspěvky', desc: '+10 % zlaťáků z pokusu', max: 5, baseCost: 150, apply: () => undefined },
];

export interface Life {
  kills: number;
  throws: number; // kolikrát Jiry hodil Truplem
  wins: string[]; // postavy, se kterými hráč vyhrál
  bosses: string[]; // bossové, které už někdy odvolal
}

export interface Meta {
  gold: number;
  shop: Record<string, number>;
  skins: string[]; // koupené skiny (název sprite sheetu)
  skin: Record<string, string>; // vybraný skin pro každou postavu
  done: string[]; // splněné úspěchy
  life: Life;
}

const KEY = 'gods.meta';
const list = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []);
const dict = <T>(v: unknown): Record<string, T> => (typeof v === 'object' && v ? (v as Record<string, T>) : {});

export function loadMeta(): Meta {
  let m: Record<string, unknown> = {};
  try {
    m = dict(JSON.parse(localStorage.getItem(KEY) ?? '{}'));
  } catch {
    // Poškozená data: začne se od nuly.
  }
  const life = dict<unknown>(m.life);
  return {
    gold: Number(m.gold) || 0,
    shop: dict<number>(m.shop),
    skins: list(m.skins),
    skin: dict<string>(m.skin),
    done: list(m.done),
    life: { kills: Number(life.kills) || 0, throws: Number(life.throws) || 0, wins: list(life.wins), bosses: list(life.bosses) },
  };
}

export function saveMeta(m: Meta) {
  try {
    localStorage.setItem(KEY, JSON.stringify(m));
  } catch {
    // Plné nebo zakázané úložiště: postup se jen neuloží.
  }
}

export const gold = () => loadMeta().gold;
export const shopLevel = (id: string) => loadMeta().shop[id] ?? 0;
export const costOf = (item: ShopItem) => item.baseCost * (shopLevel(item.id) + 1);
export const goldMultiplier = () => 1 + 0.1 * shopLevel('gold');

// Koupí další úroveň; false, když je vyprodáno nebo chybí zlaťáky.
export function buy(item: ShopItem) {
  const m = loadMeta();
  const level = m.shop[item.id] ?? 0;
  const cost = item.baseCost * (level + 1);
  if (level >= item.max || m.gold < cost) return false;
  m.gold -= cost;
  m.shop[item.id] = level + 1;
  saveMeta(m);
  return true;
}

// Promítne koupená vylepšení do startovních statistik postavy.
export function applyShop(s: Stats) {
  const m = loadMeta();
  for (const item of SHOP) {
    const level = Math.min(item.max, m.shop[item.id] ?? 0);
    if (level > 0) item.apply(s, level);
  }
}

// ---------- skiny ----------

export const ownsSkin = (skin: Skin) => skin.cost === 0 || loadMeta().skins.includes(skin.sheet);

export function buySkin(skin: Skin) {
  const m = loadMeta();
  if (m.skins.includes(skin.sheet) || m.gold < skin.cost) return false;
  m.gold -= skin.cost;
  m.skins.push(skin.sheet);
  saveMeta(m);
  return true;
}

export function selectSkin(character: string, skin: Skin) {
  const m = loadMeta();
  m.skin[character] = skin.sheet;
  saveMeta(m);
}

// Sprite sheet, ve kterém postava právě chodí (vybraný a koupený skin, jinak základní).
export function sheetFor(character: string) {
  const def = CHARACTERS[character];
  const chosen = loadMeta().skin[character];
  const skin = def.skins.find((s) => s.sheet === chosen);
  return skin && ownsSkin(skin) ? skin.sheet : def.sheet;
}
