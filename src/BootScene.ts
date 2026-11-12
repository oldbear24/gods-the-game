import Phaser from 'phaser';
import { CHARACTERS } from './characters';
import { ENEMIES, BOSSES } from './enemies';

// Načte grafiku, připraví animace a pustí menu (nebo rovnou hru, když je v adrese ladicí parametr).
export class BootScene extends Phaser.Scene {
  constructor() {
    super('boot');
  }

  preload() {
    for (const c of Object.values(CHARACTERS))
      for (const s of c.skins) this.load.spritesheet(s.sheet, `assets/${s.sheet}.png`, { frameWidth: 128, frameHeight: 128 });
    for (const e of [...ENEMIES, ...BOSSES])
      this.load.spritesheet(e.sheet, `assets/${e.sheet}.png`, { frameWidth: e.frameSize, frameHeight: e.frameSize });
    for (const key of ['gem', 'grass', 'arrow', 'leaflet', 'donut', 'pixel', 'tree', 'rock', 'bush', 'boomerang', 'shuriken', 'hammer', 'like', 'bell', 'katana', 'urn']) this.load.image(key, `assets/${key}.png`);
  }

  create() {
    // Každý skin má vlastní animace pojmenované podle sprite sheetu.
    for (const c of Object.values(CHARACTERS))
      for (const s of c.skins) {
        const frames = (list: number[]) => list.map((frame) => ({ key: s.sheet, frame }));
        this.anims.create({ key: `${s.sheet}-idle`, frames: frames(c.frames.idle), frameRate: 2, repeat: -1 });
        this.anims.create({ key: `${s.sheet}-walk`, frames: frames(c.frames.walk), frameRate: 8, repeat: -1 });
      }
    for (const e of [...ENEMIES, ...BOSSES])
      this.anims.create({ key: e.id, frames: this.anims.generateFrameNumbers(e.sheet, {}), frameRate: 4, repeat: -1 });

    const params = new URLSearchParams(location.search);
    const debug = ['t', 'boss', 'bot', 'speed', 'skip', 'char', 'vote'].some((p) => params.has(p));
    this.scene.start(debug ? 'game' : 'menu');
  }
}
