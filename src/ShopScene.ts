import Phaser from 'phaser';
import { audio } from './audio';
import { SHOP, buy, costOf, gold, shopLevel } from './meta';
import { GAME_W, GAME_H, label } from './ui';

// Obchod mezi pokusy: trvalá vylepšení za zlaťáky.
export class ShopScene extends Phaser.Scene {
  constructor() {
    super('shop');
  }

  create() {
    this.add.tileSprite(0, 0, GAME_W, GAME_H, 'grass').setOrigin(0);
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x0a0c10, 0.78);
    label(this, GAME_W / 2, 110, 'OBCHOD', 110, '#ee8a3c');
    const have = gold();
    label(this, GAME_W / 2, 210, `Máš ${have} zlaťáků`, 44, '#f6d76a');

    const tryBuy = (i: number) => {
      const item = SHOP[i];
      if (!item) return;
      audio.unlock();
      if (buy(item)) {
        audio.play('levelup');
        this.scene.restart(); // překreslí ceny a úrovně
      } else audio.play('block');
    };

    SHOP.forEach((item, i) => {
      const x = GAME_W / 2 + ((i % 3) - 1) * 580;
      const y = 440 + Math.floor(i / 3) * 330;
      const level = shopLevel(item.id);
      const sold = level >= item.max;
      const cost = costOf(item);
      const can = !sold && have >= cost;
      const card = this.add.rectangle(x, y, 540, 300, 0x1f232b, 0.95).setStrokeStyle(5, can ? 0xee8a3c : 0x4a505c);
      card.setInteractive({ useHandCursor: can });
      card.on('pointerover', () => card.setFillStyle(0x2e3440, 0.95));
      card.on('pointerout', () => card.setFillStyle(0x1f232b, 0.95));
      card.on('pointerdown', () => tryBuy(i));
      label(this, x - 235, y - 115, `${i + 1}`, 36, '#9a9fa8');
      label(this, x, y - 85, item.name, 42, '#ee8a3c');
      label(this, x, y - 25, item.desc, 28, '#e8e6e1');
      label(this, x, y + 40, `Úroveň ${level} / ${item.max}`, 30, '#9a9fa8');
      label(this, x, y + 100, sold ? 'VYPRODÁNO' : `Cena: ${cost}`, 36, sold ? '#9a9fa8' : can ? '#f6d76a' : '#e0483a');
    });

    label(this, GAME_W / 2, 1010, 'Klik nebo klávesa 1–6 = koupit   ·   Esc = zpět do menu', 32, '#9a9fa8');
    const kb = this.input.keyboard!;
    kb.on('keydown', (ev: KeyboardEvent) => {
      const i = ['1', '2', '3', '4', '5', '6'].indexOf(ev.key);
      if (i >= 0) tryBuy(i);
    });
    kb.once('keydown-ESC', () => this.scene.start('menu'));
    kb.on('keydown-M', () => audio.toggleMute());
  }
}
