// Příšery. Nová příšera = nový záznam tady + sprite sheet v tools/sprites.

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
  ranged?: { range: number; cooldown: number; speed: number; damage: number };
  boss?: boolean;
}

export const ENEMIES: EnemyDef[] = [
  {
    id: 'slime', name: 'Sliz', sheet: 'slime', frameSize: 48, scale: 2, originY: 0.85, body: [13, 11, 22],
    speed: 95, hp: 14, damage: 7, xp: 1, from: 0, weight: 5,
  },
  {
    id: 'bat', name: 'Netopýr', sheet: 'bat', frameSize: 48, scale: 2, originY: 0.92, body: [8, 16, 20],
    speed: 185, hp: 9, damage: 5, xp: 1, from: 30, weight: 3,
  },
  {
    id: 'skeleton', name: 'Kostlivec', sheet: 'skeleton', frameSize: 48, scale: 2, originY: 0.94, body: [9, 15, 30],
    speed: 75, hp: 55, damage: 10, xp: 3, from: 75, weight: 2,
  },
  {
    id: 'goblin', name: 'Goblin šaman', sheet: 'goblin', frameSize: 48, scale: 2, originY: 0.94, body: [9, 15, 30],
    speed: 85, hp: 26, damage: 6, xp: 2, from: 120, weight: 1.2,
    ranged: { range: 520, cooldown: 2.4, speed: 330, damage: 10 },
  },
];

export const BOSS: EnemyDef = {
  id: 'king', name: 'Slizový král', sheet: 'king', frameSize: 96, scale: 3, originY: 0.87, body: [30, 18, 44],
  speed: 70, hp: 700, damage: 22, xp: 3, from: 180, weight: 0, boss: true,
};

export const BOSS_INTERVAL = 180;
