// Trvalý postup: zlaťáky vydělané v pokusech a vylepšení koupená v obchodě. Uloženo v prohlížeči.
import type { Stats } from './characters';

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

interface Meta {
  gold: number;
  shop: Record<string, number>;
}

const KEY = 'gods.meta';

function load(): Meta {
  try {
    const m = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    return { gold: Number(m.gold) || 0, shop: typeof m.shop === 'object' && m.shop ? m.shop : {} };
  } catch {
    return { gold: 0, shop: {} };
  }
}

function save(m: Meta) {
  try {
    localStorage.setItem(KEY, JSON.stringify(m));
  } catch {
    // Plné nebo zakázané úložiště: postup se jen neuloží.
  }
}

export const gold = () => load().gold;
export const shopLevel = (id: string) => load().shop[id] ?? 0;
export const costOf = (item: ShopItem) => item.baseCost * (shopLevel(item.id) + 1);
export const goldMultiplier = () => 1 + 0.1 * shopLevel('gold');

// Přičte zlaťáky a vrátí nový stav.
export function addGold(amount: number) {
  const m = load();
  m.gold += amount;
  save(m);
  return m.gold;
}

// Koupí další úroveň; false, když je vyprodáno nebo chybí zlaťáky.
export function buy(item: ShopItem) {
  const m = load();
  const level = m.shop[item.id] ?? 0;
  const cost = item.baseCost * (level + 1);
  if (level >= item.max || m.gold < cost) return false;
  m.gold -= cost;
  m.shop[item.id] = level + 1;
  save(m);
  return true;
}

// Promítne koupená vylepšení do startovních statistik postavy.
export function applyShop(s: Stats) {
  const m = load();
  for (const item of SHOP) {
    const level = Math.min(item.max, m.shop[item.id] ?? 0);
    if (level > 0) item.apply(s, level);
  }
}
