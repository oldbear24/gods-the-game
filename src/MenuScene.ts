import Phaser from 'phaser';
import { audio } from './audio';
import { CHARACTERS } from './characters';
import { loadScores, type Run } from './scores';
import { GAME_W, GAME_H, label, formatTime } from './ui';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('menu');
  }

  create() {
    const def = CHARACTERS.truplik;
    this.add.tileSprite(0, 0, GAME_W, GAME_H, 'grass').setOrigin(0);
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x0a0c10, 0.72);

    label(this, GAME_W / 2, 130, 'GoDS', 190, '#ee8a3c');
    label(this, GAME_W / 2, 262, 'THE GAME', 64, '#e8e6e1');

    // Postava
    const cx = 560;
    this.add.rectangle(cx, 640, 620, 560, 0x1f232b, 0.9).setStrokeStyle(5, 0xee8a3c);
    this.add.sprite(cx, 780, def.sheet, 0).setScale(3).setOrigin(0.5, 0.945).play(`${def.id}-idle`);
    label(this, cx, 830, def.name, 64, '#ee8a3c');
    label(this, cx, 888, def.title, 32, '#e8e6e1');

    // Žebříček
    const sx = 1360;
    this.add.rectangle(sx, 640, 780, 560, 0x1f232b, 0.9).setStrokeStyle(5, 0x4a505c);
    label(this, sx, 410, 'Nejlepší pokusy', 48, '#e8e6e1');
    drawScores(this, sx, 490, loadScores().slice(0, 5), null);

    const start = label(this, GAME_W / 2, 985, 'ENTER nebo klik = hrát', 52, '#ffffff');
    this.tweens.add({ targets: start, alpha: 0.35, duration: 700, yoyo: true, repeat: -1 });
    label(
      this,
      GAME_W / 2,
      1048,
      'WASD / šipky = pohyb   ·   útočí sám   ·   mezerník / klik = Provokace   ·   Esc = pauza   ·   M = zvuk',
      26,
      '#9a9fa8',
    );

    const play = () => {
      audio.unlock();
      audio.play('click');
      this.scene.start('game');
    };
    this.input.keyboard!.once('keydown-ENTER', play);
    this.input.keyboard!.once('keydown-SPACE', play);
    this.input.once('pointerdown', play);
    this.input.keyboard!.on('keydown-M', () => audio.toggleMute());
  }
}

// Tabulka pokusů; zvýrazní řádek `highlight` (právě dohraný pokus).
export function drawScores(scene: Phaser.Scene, x: number, y: number, runs: Run[], highlight: Run | null, depth = 0) {
  const made: Phaser.GameObjects.Text[] = [];
  if (runs.length === 0) made.push(label(scene, x, y + 110, 'Zatím nic.\nBěž něco přežít.', 36, '#9a9fa8'));
  runs.forEach((run, i) => {
    const mine = highlight !== null && run.date === highlight.date && run.time === highlight.time;
    const text = `${i + 1}.   ${formatTime(run.time)}   ·   level ${run.level}   ·   ${run.kills} odvolaných`;
    made.push(label(scene, x, y + i * 62, text, 36, mine ? '#ee8a3c' : '#e8e6e1'));
  });
  made.forEach((t) => t.setDepth(depth));
  return made;
}
