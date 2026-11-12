// Zbraně navíc, které se berou při level-upu a fungují samy vedle hlavního útoku postavy.
// Pole mají jednu hodnotu na každou úroveň zbraně (index 0 = úroveň 1).

export interface WeaponDef {
  id: 'boomerang' | 'shuriken' | 'hammer';
  name: string;
  desc: string[]; // co se napíše na kartu, když hráč tuhle úroveň bere
  count: number[]; // kolik kusů najednou
  damage: number[]; // násobek poškození postavy
  cooldown: number[]; // s mezi použitím (shuriken: nepoužito)
  size: number[]; // px: dolet bumerangu, poloměr dráhy shurikenů, poloměr výbuchu kladiva
}

export const WEAPONS: WeaponDef[] = [
  {
    id: 'boomerang',
    name: 'Bumerang',
    desc: ['Letí tam a zpátky,\nprosekne všechny', '+30 % poškození', 'Hází dva najednou', '+30 % poškození', 'Hází tři najednou'],
    count: [1, 1, 2, 2, 3],
    damage: [0.9, 1.2, 1.2, 1.5, 1.5],
    cooldown: [2, 2, 2, 2, 2],
    size: [440, 440, 440, 440, 440],
  },
  {
    id: 'shuriken',
    name: 'Shurikeny',
    desc: ['Dva krouží kolem tebe', 'Třetí shuriken', '+40 % poškození', 'Čtvrtý shuriken', 'Pátý shuriken'],
    count: [2, 3, 3, 4, 5],
    damage: [0.5, 0.5, 0.7, 0.7, 0.7],
    cooldown: [0, 0, 0, 0, 0],
    size: [160, 160, 160, 160, 160],
  },
  {
    id: 'hammer',
    name: 'Banhammer',
    desc: ['Padá z nebe na\nnáhodného politika', 'Větší výbuch', 'Padá častěji', '+50 % poškození', 'Padají dva najednou'],
    count: [1, 1, 1, 1, 2],
    damage: [2.5, 2.5, 2.5, 3.75, 3.75],
    cooldown: [3.2, 3.2, 2.2, 2.2, 2.2],
    size: [140, 190, 190, 190, 190],
  },
];
