// Nepřátelé: satirické karikatury českých politiků napříč spektrem.
// Nový nepřítel = nový záznam tady + karikatura v tools/sprites/politicians.mjs.
// Hlášky bossů jsou zjevná parodie, ne skutečné citáty.

export interface EnemyDef {
  id: string;
  name: string;
  sheet: string;
  frameSize: number;
  scale: number;
  originY: number;
  body: [radius: number, offsetX: number, offsetY: number]; // v pixelech snímku
  speed: number;
  hp: number;
  damage: number;
  xp: number;
  from: number; // od kolikáté vteřiny se objevuje
  weight: number; // jak často oproti ostatním
  ranged?: { range: number; cooldown: number; speed: number; damage: number; sprite: string };
  boss?: {
    quote: string;
    // spread = vějíř střel na hráče, radial = střely do všech stran, charge = rozjezd v přímce
    ability: 'spread' | 'radial' | 'charge';
    cooldown: number;
    shot?: { sprite: string; speed: number; damage: number };
  };
}

const small = { frameSize: 48, scale: 2, originY: 0.94, body: [9, 15, 30] as [number, number, number] };
const big = { frameSize: 96, scale: 3, originY: 0.94, body: [18, 30, 60] as [number, number, number] };

export const ENEMIES: EnemyDef[] = [
  // Základní: pomalý profesor, jde rovně a vytrvale.
  { id: 'fiala', name: 'Petr Fiala', sheet: 'fiala', ...small, speed: 95, hp: 14, damage: 7, xp: 1, from: 0, weight: 5 },
  // Rychlý a slabý.
  { id: 'rakusan', name: 'Vít Rakušan', sheet: 'rakusan', ...small, speed: 185, hp: 9, damage: 5, xp: 1, from: 30, weight: 3 },
  // Pomalý a tuhý, s holí.
  { id: 'zeman', name: 'Miloš Zeman', sheet: 'zeman', ...small, speed: 70, hp: 55, damage: 10, xp: 3, from: 75, weight: 2 },
  // Střelec: stojí opodál a hází letáky.
  {
    id: 'okamura', name: 'Tomio Okamura', sheet: 'okamura', ...small, speed: 85, hp: 26, damage: 6, xp: 2, from: 120, weight: 1.2,
    ranged: { range: 520, cooldown: 2.4, speed: 330, damage: 10, sprite: 'leaflet' },
  },
];

// Bossové se střídají v tomhle pořadí, každé kolo silnější.
export const BOSSES: EnemyDef[] = [
  {
    id: 'babis', name: 'Andrej Babiš', sheet: 'babis', ...big, speed: 75, hp: 700, damage: 20, xp: 3, from: 0, weight: 0,
    boss: {
      quote: '„Všichni dostanou koblihu!“',
      ability: 'spread', cooldown: 2.6, shot: { sprite: 'donut', speed: 360, damage: 12 },
    },
  },
  {
    id: 'turek', name: 'Filip Turek', sheet: 'turek', ...big, speed: 80, hp: 800, damage: 26, xp: 3, from: 0, weight: 0,
    boss: { quote: '„Uhni, jedu!“', ability: 'charge', cooldown: 4.5 },
  },
  {
    id: 'bartos', name: 'Ivan Bartoš', sheet: 'bartos', ...big, speed: 70, hp: 900, damage: 20, xp: 3, from: 0, weight: 0,
    boss: {
      quote: '„Zdigitalizuju tě!“',
      ability: 'radial', cooldown: 3.2, shot: { sprite: 'pixel', speed: 300, damage: 10 },
    },
  },
];

export const BOSS_INTERVAL = 180;
