import type { Stats } from './characters';

export interface Upgrade {
  id: string;
  name: string;
  desc: string;
  heal?: number;
  apply: (s: Stats) => void;
}

export const UPGRADES: Upgrade[] = [
  { id: 'dmg', name: 'Ostřejší meč', desc: '+25 % poškození', apply: (s) => (s.damage *= 1.25) },
  { id: 'cd', name: 'Rychlejší ruka', desc: 'Útočí o 15 % rychleji', apply: (s) => (s.attackCooldown *= 0.85) },
  { id: 'range', name: 'Delší čepel', desc: '+20 % dosah útoku', apply: (s) => (s.attackRange *= 1.2) },
  { id: 'hp', name: 'Tlustá kůže', desc: '+30 max. životů\na vyléčí 30', heal: 30, apply: (s) => (s.maxHp += 30) },
  { id: 'speed', name: 'Kočičí tlapky', desc: '+10 % rychlost pohybu', apply: (s) => (s.speed *= 1.1) },
  { id: 'armor', name: 'Mikina +1', desc: 'Každý zásah bolí\no 1 méně', apply: (s) => (s.armor += 1) },
  {
    id: 'aura',
    name: 'Nepříjemná aura',
    desc: 'Příšery poblíž ztrácí\n5 životů za vteřinu',
    apply: (s) => (s.aura += 5),
  },
  { id: 'block', name: 'Kočičí reflex', desc: '+8 % šance vykrýt\nzásah štítem', apply: (s) => (s.block = Math.min(0.6, s.block + 0.08)) },
  { id: 'taunt', name: 'Větší huba', desc: 'Provokace se nabíjí\no 20 % rychleji', apply: (s) => (s.tauntCooldown *= 0.8) },
  { id: 'magnet', name: 'Lakota', desc: '+40 % dosah sbírání\nzkušeností', apply: (s) => (s.pickupRange *= 1.4) },
];
