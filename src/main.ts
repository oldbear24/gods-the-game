import Phaser from 'phaser';
import '@fontsource/pixelify-sans/700.css';
import { BootScene } from './BootScene';
import { MenuScene } from './MenuScene';
import { GameScene } from './GameScene';
import { ShopScene } from './ShopScene';
import { AchievementsScene } from './AchievementsScene';
import { GAME_W, GAME_H } from './ui';

// Písmo se musí načíst dřív, než Phaser nakreslí první text (včetně českých znaků).
document.fonts
  .load('700 32px "Pixelify Sans"', 'GoDS ěščřžýáíéůúňťď')
  .catch(() => undefined)
  .then(() => {
    // Při vývoji je hra dostupná v konzoli jako window.__game (na ruční krokování a ladění).
    (window as { __game?: Phaser.Game }).__game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: 'game',
      width: GAME_W,
      height: GAME_H,
      backgroundColor: '#0e1014',
      pixelArt: true,
      scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
      physics: { default: 'arcade' },
      scene: [BootScene, MenuScene, ShopScene, AchievementsScene, GameScene],
    });
  });
