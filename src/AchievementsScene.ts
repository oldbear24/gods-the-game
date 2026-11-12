import Phaser from 'phaser';
import { audio } from './audio';
import { ACHIEVEMENTS } from './achievements';
import { loadMeta } from './meta';
import { GAME_W, GAME_H, label } from './ui';

// Přehled úspěchů: splněné zlatě, ostatní šedě.
export class AchievementsScene extends Phaser.Scene {
  constructor() {
    super('achievements');
  }

  create() {
    this.add.tileSprite(0, 0, GAME_W, GAME_H, 'grass').setOrigin(0);
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x0a0c10, 0.8);
    const done = loadMeta().done;
    label(this, GAME_W / 2, 100, 'ÚSPĚCHY', 100, '#ee8a3c');
    label(this, GAME_W / 2, 190, `${ACHIEVEMENTS.filter((a) => done.includes(a.id)).length} / ${ACHIEVEMENTS.length} splněno`, 38, '#f6d76a');

    const rows = Math.ceil(ACHIEVEMENTS.length / 2);
    ACHIEVEMENTS.forEach((a, i) => {
      const x = GAME_W / 2 + (i < rows ? -460 : 460);
      const y = 290 + (i % rows) * 100;
      const got = done.includes(a.id);
      this.add.rectangle(x, y, 860, 88, 0x1f232b, 0.92).setStrokeStyle(4, got ? 0xf6d76a : 0x4a505c);
      label(this, x, y - 18, `${got ? '✔ ' : ''}${a.name}   ·   +${a.reward}`, 34, got ? '#f6d76a' : '#9a9fa8');
      label(this, x, y + 22, a.desc, 24, got ? '#e8e6e1' : '#7a7f88');
    });

    label(this, GAME_W / 2, 1030, 'Esc = zpět do menu', 32, '#9a9fa8');
    const kb = this.input.keyboard!;
    kb.once('keydown-ESC', () => this.scene.start('menu'));
    kb.on('keydown-M', () => audio.toggleMute());
  }
}
