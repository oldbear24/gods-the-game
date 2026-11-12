// Hratelné postavy. Nový člen GoDS = nový záznam tady + sprite sheet v tools/sprites.

export interface Stats {
  maxHp: number;
  speed: number; // px/s
  damage: number;
  attackCooldown: number; // s
  attackRange: number; // px (dosah meče nebo dostřel)
  attackArc: number; // rad, jen pro útok zblízka
  armor: number; // odečte se z každého zásahu
  aura: number; // poškození za sekundu nepřátelům poblíž
  pickupRange: number; // px
  block: number; // šance 0–1 vykrýt zásah (štít, úhyb)
  tauntCooldown: number; // s, nabíjení speciální schopnosti
}

export interface CharacterDef {
  id: string;
  name: string;
  title: string;
  blurb: string; // krátký popis do menu
  sheet: string;
  // Snímky ve sprite sheetu (viz tools/sprites/build-game.mjs)
  frames: { idle: number[]; walk: number[]; attack: number };
  stats: Stats;
  // melee = sek do oblouku; ranged = střela na nejbližšího nepřítele, pierce = kolik nepřátel ještě proletí
  attack: { kind: 'melee' } | { kind: 'ranged'; sprite: string; speed: number; pierce: number };
  // taunt = Provokace (odhodí okolí, půlí poškození); throw = hodí Truplika po nepřátelích
  ability: { kind: 'taunt' | 'throw'; name: string };
  blockText: string;
  // Vlastní názvy vylepšení, kde obecný text k postavě nesedí (klíč = id vylepšení)
  upgradeText?: Record<string, { name: string; desc: string }>;
  quotes: { levelUp: string[]; death: string[]; ability: string[] };
}

export const CHARACTERS: Record<string, CharacterDef> = {
  truplik: {
    id: 'truplik',
    name: 'Truplik',
    title: 'tank, nepříjemný zrzek',
    blurb: 'Meč a štít. Hodně vydrží, seká zblízka.\nMezerník: Provokace.',
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
    attack: { kind: 'melee' },
    ability: { kind: 'taunt', name: 'Provokace' },
    blockText: 'BLOK!',
    quotes: {
      ability: [
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

  jiry: {
    id: 'jiry',
    name: 'Jiry',
    title: 'malý lučištník, milovník Japonska',
    blurb: 'Japonský luk. Rychlý, střílí z dálky, málo vydrží.\nMezerník: Hod Truplem.',
    sheet: 'jiry',
    frames: { idle: [0, 1], walk: [2, 0, 3, 0], attack: 4 },
    stats: {
      maxHp: 110,
      speed: 300,
      damage: 14,
      attackCooldown: 0.5,
      attackRange: 640,
      attackArc: 0,
      armor: 0,
      aura: 0,
      pickupRange: 170,
      block: 0.15,
      tauntCooldown: 16,
    },
    attack: { kind: 'ranged', sprite: 'arrow', speed: 900, pierce: 2 },
    ability: { kind: 'throw', name: 'Hod Truplem' },
    blockText: 'ÚHYB!',
    upgradeText: {
      dmg: { name: 'Ostřejší šípy', desc: '+25 % poškození' },
      cd: { name: 'Rychlejší tětiva', desc: 'Střílí o 15 % rychleji' },
      range: { name: 'Delší luk', desc: '+20 % dostřel' },
      armor: { name: 'Kimono +1', desc: 'Každý zásah bolí\no 1 méně' },
      block: { name: 'Ninja reflex', desc: '+8 % šance uhnout\nzásahu' },
      taunt: { name: 'Silnější ruce', desc: 'Hod Truplem se nabíjí\no 20 % rychleji' },
      hp: { name: 'Miska ramenu', desc: '+30 max. životů\na vyléčí 30' },
    },
    quotes: {
      ability: ['„Leť, Truple!“', '„Truple, aport!“', '„Tank jde první!“', '„Sayonara, Truple!“'],
      levelUp: [
        '„Sugoi!“',
        '„Malej, ale šikovnej.“',
        '„Ještě level a hodím Truplem dál.“',
        '„Arigató, arigató.“',
      ],
      death: [
        '„Sayonara…“',
        '„Za to může Trupl.“',
        '„Truple, kde jsi měl aggro?!“',
        '„Jsem malej, měli mě minout.“',
      ],
    },
  },
};

// Co křičí Truplik, když ho Jiry hodí po nepřátelích.
export const THROWN_QUOTES = ['„Jiry, ty zmetku!“', '„Proč zase já?!“', '„Tohle si vyřídíme!“', '„Já to řeknu guild masterovi!“'];

const CHARACTER_KEY = 'gods.character';

// Naposledy vybraná postava (nebo ?char=jiry v adrese na zkoušení).
export function selectedCharacter(): string {
  const fromUrl = new URLSearchParams(location.search).get('char');
  const id = fromUrl ?? localStorage.getItem(CHARACTER_KEY) ?? 'truplik';
  return id in CHARACTERS ? id : 'truplik';
}

export function rememberCharacter(id: string) {
  localStorage.setItem(CHARACTER_KEY, id);
}
