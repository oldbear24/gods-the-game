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
  female?: boolean; // kvůli tvaru „byla odvolána“
  ranged?: { range: number; cooldown: number; speed: number; damage: number; sprite: string };
  boss?: {
    // spread = vějíř střel na hráče, radial = střely do všech stran, charge = rozjezd v přímce,
    // summon = přivolá si na pomoc běžné politiky
    ability: 'spread' | 'radial' | 'charge' | 'summon';
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
  // Rychlá, s cedulí.
  { id: 'konecna', name: 'Kateřina Konečná', sheet: 'konecna', female: true, ...small, speed: 200, hp: 12, damage: 6, xp: 1, from: 50, weight: 2,
    quotes: ['„Stačilo!“', '„A dost!“', '„Tohle už stačilo!“', '„Lidi toho mají dost!“'],
    defeat: '„Tak tohle fakt stačilo.“',
  },
  // Středně tuhý, škrtá nůžkami.
  { id: 'stanjura', name: 'Zbyněk Stanjura', sheet: 'stanjura', ...small, speed: 110, hp: 32, damage: 9, xp: 2, from: 95, weight: 2,
    quotes: ['„Škrtám!“', '„Na to nejsou peníze.“', '„Konsolidační balíček!“', '„Rozpočet je v pořádku.“'],
    defeat: '„Vyškrtli mě.“',
  },
  // Pomalý a hodně odolný, s vidlemi.
  { id: 'jurecka', name: 'Marian Jurečka', sheet: 'jurecka', ...small, speed: 75, hp: 70, damage: 11, xp: 3, from: 140, weight: 1.5,
    quotes: ['„Jdu rovnou z pole!“', '„Sklizeň bude!“', '„Důchody vyřešíme později.“', '„Kde mám traktor?“'],
    defeat: '„Jdu zpátky na statek.“',
  },
  // Střelkyně: fotí selfie a hází lajky.
  {
    id: 'schillerova', name: 'Alena Schillerová', sheet: 'schillerova', female: true, ...small, speed: 90, hp: 22, damage: 6, xp: 2, from: 150, weight: 1.2,
    ranged: { range: 480, cooldown: 2.2, speed: 300, damage: 9, sprite: 'like' },
    quotes: ['„Počkej, ještě selfie!“', '„Dej mi lajk!“', '„To je do storíčka.“', '„Rozpočet mám na Instagramu.“'],
    defeat: '„Tohle si nepostnu.“',
  },
];

// Pořadí bossů se v každém pokusu losuje: tři přijdou postupně, zbylí tři tvoří finální koalici.
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
  {
    id: 'pavel', name: 'Petr Pavel', sheet: 'pavel', ...big, speed: 80, hp: 850, damage: 22, xp: 3, from: 0, weight: 0,
    quotes: ['„Řád a klid!“', '„Pozor!“', '„Vraťme sem řád a klid.“', '„To je rozkaz.“'],
    defeat: '„Rozchod.“',
    boss: { ability: 'summon', cooldown: 6 },
  },
  {
    id: 'pekarova', name: 'Markéta Pekarová Adamová', sheet: 'pekarova', female: true, ...big, speed: 75, hp: 800, damage: 20, xp: 3, from: 0, weight: 0,
    quotes: ['„Klid v sále!“', '„Uděluji vám napomenutí!“', '„Přerušuji schůzi!“', '„Vezměte si svetr.“'],
    defeat: '„Schůze je ukončena.“',
    boss: {
      ability: 'radial', cooldown: 3, shot: { sprite: 'bell', speed: 310, damage: 10 },
    },
  },
  {
    id: 'rajchl', name: 'Jindřich Rajchl', sheet: 'rajchl', ...big, speed: 85, hp: 750, damage: 20, xp: 3, from: 0, weight: 0,
    quotes: ['„Demisi!“', '„Všichni na náměstí!“', '„Podám žalobu!“', '„Mám na to právní rozbor!“'],
    defeat: '„Sejdeme se u soudu.“',
    boss: {
      ability: 'spread', cooldown: 2.4, shot: { sprite: 'leaflet', speed: 370, damage: 11 },
    },
  },
];

export const BOSS_INTERVAL = 180;
