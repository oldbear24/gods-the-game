# GoDS: The Game

2D pixel-art survivors aréna s postavami z klanu GoDS. Hraje se v prohlížeči:
**https://oldbear24.github.io/gods-the-game/**

## Ovládání

- WASD / šipky – pohyb
- Útok mečem probíhá sám
- Mezerník / klik – Provokace
- Esc – pauza, M – zvuk

## Vývoj

```bash
npm install
npm run dev
```

- `src/` – hra (Phaser 3 + TypeScript)
- `src/characters.ts`, `src/enemies.ts`, `src/upgrades.ts` – postavy, příšery a vylepšení
- `tools/sprites/` – generátor pixel artu; `npm run sprites` vyrenderuje grafiku do `public/assets`
- Ladicí parametry v adrese: `?t=120` (start ve 2:00), `?boss=20` (boss ve 20. vteřině), `?bot=1&speed=6` (hraje sám, zrychleně)

Každý push do větve `main` se sám nasadí na GitHub Pages.
