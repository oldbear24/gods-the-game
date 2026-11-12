// Hratelné postavy. Nový člen GoDS = nový záznam tady + sprite sheet v tools/sprites.

export interface Stats {
  maxHp: number;
  speed: number; // px/s
  damage: number;
  attackCooldown: number; // s
  attackRange: number; // px
  attackArc: number; // rad
  armor: number; // odečte se z každého zásahu
  aura: number; // poškození za sekundu nepřátelům poblíž
  pickupRange: number; // px
  block: number; // šance 0–1 vykrýt zásah štítem
  tauntCooldown: number; // s, speciální schopnost
}

export interface CharacterDef {
  id: string;
  name: string;
  title: string;
  sheet: string;
  // Snímky ve sprite sheetu (viz tools/sprites/build-game.mjs)
  frames: { idle: number[]; walk: number[]; attack: number };
  stats: Stats;
  quotes: { levelUp: string[]; death: string[]; taunt: string[] };
}

export const CHARACTERS: Record<string, CharacterDef> = {
  truplik: {
    id: 'truplik',
    name: 'Truplik',
    title: 'tank, nepříjemný zrzek',
    sheet: 'truplik',
    frames: { idle: [0, 1], walk: [2, 0, 3, 0], attack: 4 },
    stats: {
      maxHp: 160,
      speed: 250,
      damage: 16,
      attackCooldown: 0.75,
      attackRange: 210,
      attackArc: Math.PI * 0.8,
      armor: 2,
      aura: 0,
      pickupRange: 150,
      block: 0.12,
      tauntCooldown: 14,
    },
    quotes: {
      taunt: [
        '„Pojďte sem, vy lemry!“',
        '„Na mě! Stejně nic jinýho neumíte.“',
        '„Tak co, bude to dneska?“',
        '„Aggro je moje!“',
      ],
      levelUp: [
        '„No konečně. To trvalo.“',
        '„Jsem lepší. Ne že bych předtím nebyl.“',
        '„Heal nepotřebuju. Stejně žádnej nepřijde.“',
        '„Další level a pořád tankuju sám.“',
      ],
      death: [
        '„To byla chyba healera.“',
        '„Lag. Jednoznačně lag.“',
        '„Já za to nemůžu, já jsem tank.“',
        '„Kdo mi to tam napulloval?!“',
      ],
    },
  },
};
