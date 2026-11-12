// Úspěchy: vyhodnocují se na konci pokusu, odměna jsou zlaťáky do obchodu.
import { loadMeta, saveMeta, type Life } from './meta';
import { BOSSES } from './enemies';
import { CHARACTERS } from './characters';

export interface RunSummary {
  character: string;
  time: number;
  kills: number;
  bossIds: string[]; // bossové odvolaní v tomhle pokusu
  won: boolean;
  hpUpgrades: number; // kolikrát vzal vylepšení životů
  throws: number;
  weapons: number; // kolik různých zbraní navíc měl
  evolved: boolean;
  maxStill: number; // nejdelší stání na místě v kuse (s)
  urns: number;
}

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  reward: number;
  done: (run: RunSummary, life: Life, gold: number) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'prvni', name: 'První odvolaný', desc: 'Odvolej prvního politika.', reward: 20, done: (r) => r.kills >= 1 },
  { id: 'stovka', name: 'Stovka', desc: 'Odvolej 100 politiků v jednom pokusu.', reward: 50, done: (r) => r.kills >= 100 },
  { id: 'tisic', name: 'Ústavní většina', desc: 'Odvolej celkem 1000 politiků.', reward: 150, done: (_r, l) => l.kills >= 1000 },
  {
    id: 'tank', name: 'Tank bez healera', desc: 'Přežij 5 minut bez jediného vylepšení životů.', reward: 100,
    done: (r) => r.time >= 300 && r.hpUpgrades === 0,
  },
  { id: 'hod', name: 'Trupl Airlines', desc: 'Hoď Truplem celkem 50×.', reward: 100, done: (_r, l) => l.throws >= 50 },
  { id: 'boss', name: 'Lovec trofejí', desc: 'Odvolej prvního bosse.', reward: 50, done: (_r, l) => l.bosses.length >= 1 },
  {
    id: 'sbirka', name: 'Celá sbírka', desc: 'Odvolej postupně všechny bosse.', reward: 200,
    done: (_r, l) => BOSSES.every((b) => l.bosses.includes(b.id)),
  },
  { id: 'arzenal', name: 'Chodící zbrojnice', desc: 'Měj v jednom pokusu všechny tři zbraně navíc.', reward: 75, done: (r) => r.weapons >= 3 },
  { id: 'evoluce', name: 'Evoluce', desc: 'Vyviň zbraň do nejsilnější podoby.', reward: 100, done: (r) => r.evolved },
  { id: 'afk', name: 'AFK', desc: 'Stůj 30 vteřin v kuse na místě.', reward: 75, done: (r) => r.maxStill >= 30 },
  { id: 'urny', name: 'Volební komise', desc: 'Seber 3 volební urny v jednom pokusu.', reward: 75, done: (r) => r.urns >= 3 },
  { id: 'vyhra', name: 'Vítěz voleb', desc: 'Odvolej finální koalici.', reward: 300, done: (r) => r.won },
  {
    id: 'jednota', name: 'Klanová jednota', desc: 'Vyhraj s každou postavou.', reward: 500,
    done: (_r, l) => Object.keys(CHARACTERS).every((id) => l.wins.includes(id)),
  },
  { id: 'banka', name: 'Guild bank', desc: 'Měj najednou 1000 zlaťáků.', reward: 100, done: (_r, _l, gold) => gold >= 1000 },
];

// Uzavře pokus: přičte zlaťáky a souhrnné statistiky, odemkne nové úspěchy a vyplatí odměny.
export function finishRun(run: RunSummary, earned: number) {
  const m = loadMeta();
  m.gold += earned;
  m.life.kills += run.kills;
  m.life.throws += run.throws;
  for (const id of run.bossIds) if (!m.life.bosses.includes(id)) m.life.bosses.push(id);
  if (run.won && !m.life.wins.includes(run.character)) m.life.wins.push(run.character);

  const fresh: Achievement[] = [];
  // Odměna může odemknout další úspěch (Guild bank), proto se zkouší, dokud něco přibývá.
  for (let more = true; more; ) {
    more = false;
    for (const a of ACHIEVEMENTS) {
      if (m.done.includes(a.id) || !a.done(run, m.life, m.gold)) continue;
      m.done.push(a.id);
      m.gold += a.reward;
      fresh.push(a);
      more = true;
    }
  }
  saveMeta(m);
  return { fresh, total: m.gold };
}
