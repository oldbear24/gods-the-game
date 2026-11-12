import Phaser from 'phaser';
import { audio } from './audio';
import { ACHIEVEMENTS } from './achievements';
import { CHARACTERS, selectedCharacter, rememberCharacter } from './characters';
import { loadScores, type Run } from './scores';
import { buySkin, gold, loadMeta, ownsSkin, selectSkin, sheetFor } from './meta';
import { GAME_W, GAME_H, label, formatTime } from './ui';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('menu');
  }

  create() {
    const ids = Object.keys(CHARACTERS);
    let index = Math.max(0, ids.indexOf(selectedCharacter()));
    let skinIndex = 0;

    this.add.tileSprite(0, 0, GAME_W, GAME_H, 'grass').setOrigin(0);
    this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x0a0c10, 0.72);

    label(this, GAME_W / 2, 130, 'GoDS', 190, '#ee8a3c');
    label(this, GAME_W / 2, 262, 'THE GAME', 64, '#e8e6e1');

    // Výběr postavy a skinu
    const cx = 560;
    this.add.rectangle(cx, 640, 620, 560, 0x1f232b, 0.9).setStrokeStyle(5, 0xee8a3c);
    const sprite = this.add.sprite(cx, 740, CHARACTERS[ids[index]].sheet, 0).setScale(2.5).setOrigin(0.5, 0.945);
    const name = label(this, cx, 780, '', 60, '#ee8a3c');
    const title = label(this, cx, 830, '', 30, '#e8e6e1');
    const blurb = label(this, cx, 884, '', 24, '#9a9fa8');
    const skinLabel = label(this, cx, 440, '', 28, '#f6d76a');
    label(this, cx, 395, 'Vyber postavu  (šipky ◄ ►)', 30, '#9a9fa8');

    const start = label(this, GAME_W / 2, 985, 'ENTER = hrát', 52, '#ffffff').setInteractive({ useHandCursor: true });
    this.tweens.add({ targets: start, alpha: 0.35, duration: 700, yoyo: true, repeat: -1 });
    const shop = label(this, 1500, 985, '', 34, '#f6d76a').setInteractive({ useHandCursor: true });
    const done = loadMeta().done.length;
    const trophies = label(this, 420, 985, `U = úspěchy  ·  ${done} / ${ACHIEVEMENTS.length}`, 34, '#f6d76a').setInteractive({
      useHandCursor: true,
    });

    const def = () => CHARACTERS[ids[index]];
    const skin = () => def().skins[skinIndex];
    // Překreslí skin: nekoupený je ztmavený a ENTER ho místo hraní koupí.
    const showSkin = () => {
      const owned = ownsSkin(skin());
      sprite.play(`${skin().sheet}-idle`);
      sprite.setTint(owned ? 0xffffff : 0x50545c);
      const many = def().skins.length > 1;
      skinLabel.setText(!many ? '' : owned ? `▲▼ skin: ${skin().name}` : `▲▼ skin: ${skin().name}  ·  ${skin().cost} zlaťáků`);
      start.setText(owned ? 'ENTER = hrát' : 'ENTER = koupit skin');
      shop.setText(`O = obchod  ·  ${gold()} zlaťáků`);
      if (owned) selectSkin(def().id, skin());
    };
    const show = () => {
      name.setText(def().name);
      title.setText(def().title);
      blurb.setText(def().blurb);
      rememberCharacter(def().id);
      skinIndex = Math.max(0, def().skins.findIndex((s) => s.sheet === sheetFor(def().id)));
      showSkin();
    };
    const step = (d: number) => {
      index = (index + d + ids.length) % ids.length;
      audio.unlock();
      audio.play('click');
      show();
    };
    const stepSkin = (d: number) => {
      const n = def().skins.length;
      if (n < 2) return;
      skinIndex = (skinIndex + d + n) % n;
      audio.unlock();
      audio.play('click');
      showSkin();
    };
    show();
    for (const [x, text, d] of [[cx - 265, '◄', -1], [cx + 265, '►', 1]] as const) {
      const arrow = label(this, x, 560, text, 72, '#ee8a3c').setInteractive({ useHandCursor: true });
      arrow.on('pointerdown', () => step(d));
    }

    // Žebříček
    const sx = 1360;
    this.add.rectangle(sx, 640, 780, 560, 0x1f232b, 0.9).setStrokeStyle(5, 0x4a505c);
    label(this, sx, 410, 'Nejlepší pokusy', 48, '#e8e6e1');
    drawScores(this, sx, 490, loadScores().slice(0, 5), null);

    label(
      this,
      GAME_W / 2,
      1048,
      'WASD / šipky = pohyb   ·   útočí sám   ·   mezerník / klik = schopnost   ·   Esc = pauza   ·   M = zvuk',
      26,
      '#9a9fa8',
    );

    const go = (scene: string) => () => {
      audio.unlock();
      audio.play('click');
      this.scene.start(scene);
    };
    const play = () => {
      audio.unlock();
      if (!ownsSkin(skin())) {
        // Nekoupený skin: ENTER ho koupí, pokud jsou zlaťáky.
        audio.play(buySkin(skin()) ? 'levelup' : 'block');
        showSkin();
        return;
      }
      audio.play('click');
      this.scene.start('game', { character: ids[index] });
    };
    shop.once('pointerdown', go('shop'));
    trophies.once('pointerdown', go('achievements'));
    start.on('pointerdown', play);
    sprite.setInteractive({ useHandCursor: true }).on('pointerdown', play);

    const kb = this.input.keyboard!;
    kb.on('keydown-ENTER', play);
    kb.on('keydown-SPACE', play);
    kb.on('keydown-LEFT', () => step(-1));
    kb.on('keydown-RIGHT', () => step(1));
    kb.on('keydown-A', () => step(-1));
    kb.on('keydown-D', () => step(1));
    kb.on('keydown-UP', () => stepSkin(-1));
    kb.on('keydown-DOWN', () => stepSkin(1));
    kb.on('keydown-W', () => stepSkin(-1));
    kb.on('keydown-S', () => stepSkin(1));
    kb.on('keydown-M', () => audio.toggleMute());
    kb.once('keydown-O', go('shop'));
    kb.once('keydown-U', go('achievements'));
  }
}

// Tabulka pokusů; zvýrazní řádek `highlight` (právě dohraný pokus).
export function drawScores(scene: Phaser.Scene, x: number, y: number, runs: Run[], highlight: Run | null, depth = 0) {
  const made: Phaser.GameObjects.Text[] = [];
  if (runs.length === 0) made.push(label(scene, x, y + 110, 'Zatím nic.\nBěž něco přežít.', 36, '#9a9fa8'));
  runs.forEach((run, i) => {
    const mine = highlight !== null && run.date === highlight.date && run.time === highlight.time;
    const who = CHARACTERS[run.character]?.name ?? '?';
    const text = `${i + 1}.  ${who}  ${formatTime(run.time)}  ·  level ${run.level}  ·  ${run.kills} odvolaných`;
    made.push(label(scene, x, y + i * 62, text, 30, mine ? '#ee8a3c' : run.won ? '#f6d76a' : '#e8e6e1'));
  });
  made.forEach((t) => t.setDepth(depth));
  return made;
}
