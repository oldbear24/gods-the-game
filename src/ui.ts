import Phaser from 'phaser';

export const GAME_W = 1920;
export const GAME_H = 1080;
export const UI_DEPTH = 1e9;
export const FONT = '"Pixelify Sans", "Trebuchet MS", sans-serif';

// Text s černým obrysem, zarovnaný na střed.
export function label(scene: Phaser.Scene, x: number, y: number, text: string, size: number, color: string) {
  return scene.add
    .text(x, y, text, {
      fontFamily: FONT,
      fontSize: `${size}px`,
      fontStyle: 'bold',
      color,
      align: 'center',
      stroke: '#000000',
      strokeThickness: Math.max(4, Math.round(size / 8)),
    })
    .setOrigin(0.5);
}

export function formatTime(seconds: number) {
  const s = Math.floor(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}
