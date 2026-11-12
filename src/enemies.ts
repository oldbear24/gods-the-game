// Nepřátelé: satirické karikatury českých politiků napříč spektrem.
// Nový nepřítel = nový záznam tady + karikatura v tools/sprites/politicians.mjs.
// Hlášky jsou satira: parodie a narážky na známé slogany a veřejnou image, ne doslovné citáty.

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
  quotes: string[]; // co pokřikuje během boje
  defeat: string; // co řekne, když je odvolán
  ranged?: { range: number; cooldown: number; speed: number; damage: number; sprite: string };
  boss?: {
    // spread = vějíř střel na hráče, radial = střely do všech stran, charge = rozjezd v přímce
    ability: 'spread' | 'radial' | 'charge';
    cooldown: number;
    shot?: { sprite: string; speed: number; damage: number };
  };
}

// Všichni jsou nakreslení na mřížce 72×72; bossové jsou jen dvakrát větší.
const small = { frameSize: 72, scale: 2, originY: 0.945, body: [10, 26, 50] as [number, number, number] };
const big = { frameSize: 72, scale: 4, originY: 0.945, body: [10, 26, 50] as [number, number, number] };

export const ENEMIES: EnemyDef[] = [
  // Základní: pomalý profesor, jde rovně a vytrvale.
  { id: 'fiala', name: 'Petr Fiala', sheet: 'fiala', ...small, speed: 95, hp: 14, damage: 7, xp: 1, from: 0, weight: 5,
    quotes: ['„Dáme Česko dohromady!“', '„Teď to trochu zabolí.“', '„To je populismus!“', '„Mám na to analýzu.“'],
    defeat: '„Demokraticky to přijímám.“',
  },
  // Rychlý a slabý.
  { id: 'rakusan', name: 'Vít Rakušan', sheet: 'rakusan', ...small, speed: 185, hp: 9, damage: 5, xp: 1, from: 30, weight: 3,
    quotes: ['„Už běžím!“', '„Tohle vykomunikujeme!“', '„Starostové to zařídí!“', '„Mám na to tiskovku!“'],
    defeat: '„Byla to chyba v komunikaci.“',
  },
  // Pomalý a tuhý, s holí.
  { id: 'zeman', name: 'Miloš Zeman', sheet: 'zeman', ...small, speed: 70, hp: 55, damage: 10, xp: 3, from: 75, weight: 2,
    quotes: ['„Hezký den.“', '„Novináři, fuj!“', '„Jednu becherovku, prosím.“', '„Já se nikam nehrnu.“'],
    defeat: '„Stejně jsem měl pravdu.“',
  },
  // Střelec: stojí opodál a hází letáky.
  {
    id: 'okamura', name: 'Tomio Okamura', sheet: 'okamura', ...small, speed: 85, hp: 26, damage: 6, xp: 2, from: 120, weight: 1.2,
    ranged: { range: 520, cooldown: 2.4, speed: 330, damage: 10, sprite: 'leaflet' },
    quotes: ['„Ne diktátu Bruselu!“', '„Referendum!“', '„Za všechno může vláda!“', '„Vezměte si leták!“'],
    defeat: '„To je cenzura!“',
  },
];

// Bossové se střídají v tomhle pořadí, každé kolo silnější.
export const BOSSES: EnemyDef[] = [
  {
    id: 'babis', name: 'Andrej Babiš', sheet: 'babis', ...big, speed: 75, hp: 700, damage: 20, xp: 3, from: 0, weight: 0,
    quotes: ['„Čau lidi!“', '„Sorry jako.“', '„Všichni dostanou koblihu!“', '„To je kampaň!“', '„Makáme!“'],
    defeat: '„To je účelovka!“',
    boss: {
      ability: 'spread', cooldown: 2.6, shot: { sprite: 'donut', speed: 360, damage: 12 },
    },
  },
  {
    id: 'turek', name: 'Filip Turek', sheet: 'turek', ...big, speed: 80, hp: 800, damage: 26, xp: 3, from: 0, weight: 0,
    quotes: ['„Uhni, jedu!“', '„Spalovák navždy!“', '„Plnej plyn!“', '„Elektromobil? Nikdy!“'],
    defeat: '„Došel benzín.“',
    boss: { ability: 'charge', cooldown: 4.5 },
  },
  {
    id: 'bartos', name: 'Ivan Bartoš', sheet: 'bartos', ...big, speed: 70, hp: 900, damage: 20, xp: 3, from: 0, weight: 0,
    quotes: ['„Zdigitalizuju tě!“', '„Systém se právě načítá…“', '„Zkuste to vypnout a zapnout.“', '„Internet je náš!“'],
    defeat: '„Spadl mi systém.“',
    boss: {
      ability: 'radial', cooldown: 3.2, shot: { sprite: 'pixel', speed: 300, damage: 10 },
    },
  },
];

export const BOSS_INTERVAL = 180;
