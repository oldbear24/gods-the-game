import Phaser from 'phaser';
import { CHARACTERS, type CharacterDef, type Stats } from './characters';
import { ENEMIES, BOSSES, BOSS_INTERVAL, type EnemyDef } from './enemies';
import { UPGRADES, type Upgrade } from './upgrades';
import { audio } from './audio';
import { addScore, type Run } from './scores';
import { drawScores } from './MenuScene';
import { GAME_W, GAME_H, UI_DEPTH, label, formatTime } from './ui';

const MAX_ENEMIES = 220;
const SPAWN_RADIUS = 1250;
const HURT_COOLDOWN = 0.7;
const AURA_RADIUS = 190;
const TAUNT_RADIUS = 420;
const TAUNT_DURATION = 4;
const DECOR_CELL = 480;
const REGEN_PER_SECOND = 1; // tank se pomalu léčí sám

type Sprite = Phaser.Physics.Arcade.Sprite;
type Key = Phaser.Input.Keyboard.Key;

export class GameScene extends Phaser.Scene {
  private def!: CharacterDef;
  private stats!: Stats;
  private player!: Sprite;
  private enemies!: Phaser.Physics.Arcade.Group;
  private shots!: Phaser.Physics.Arcade.Group;
  private gems!: Phaser.GameObjects.Group;
  private ground!: Phaser.GameObjects.TileSprite;
  private auraRing!: Phaser.GameObjects.Arc;
  private decor = new Map<string, Phaser.GameObjects.Image | null>();
  private boss: Sprite | null = null;
  private hudBars!: Phaser.GameObjects.Graphics;
  private hudHp!: Phaser.GameObjects.Text;
  private hudLevel!: Phaser.GameObjects.Text;
  private hudTime!: Phaser.GameObjects.Text;
  private hudKills!: Phaser.GameObjects.Text;
  private hudTaunt!: Phaser.GameObjects.Text;
  private hudBoss!: Phaser.GameObjects.Text;
  private pauseLabel: Phaser.GameObjects.Text | null = null;
  private keys!: Record<string, Key>;

  private hp = 0;
  private xp = 0;
  private level = 1;
  private kills = 0;
  private elapsed = 0;
  private attackTimer = 0;
  private spawnTimer = 0;
  private auraTimer = 0;
  private hurtUntil = 0;
  private hurtFlashUntil = 0;
  private attackAnimUntil = 0;
  private tauntReadyAt = 0;
  private tauntUntil = 0;
  private nextBossAt = BOSS_INTERVAL;
  private bossCount = 0;
  private paused = false;
  private choosing = false;
  private dead = false;
  private tauntClicked = false;
  private bot = false;
  private speed = 1;
  private barkAt = 0;

  constructor() {
    super('game');
  }

  create() {
    // Ladicí parametry v adrese: ?t=120 začne ve 2:00, ?boss=20 pošle prvního bosse ve 20. vteřině,
    // ?bot=1 hraje sám a ?speed=5 zrychlí čas (obojí na zkoušení vyvážení).
    const params = new URLSearchParams(location.search);
    this.bot = params.has('bot');
    this.speed = Number(params.get('speed') ?? 1);
    this.physics.world.timeScale = 1 / this.speed;
    this.tweens.timeScale = this.speed;
    this.anims.globalTimeScale = this.speed;
    this.time.timeScale = this.speed;

    this.def = CHARACTERS.truplik;
    this.stats = { ...this.def.stats };
    this.hp = this.stats.maxHp;
    this.xp = 0;
    this.level = 1;
    this.kills = 0;
    this.elapsed = Number(params.get('t') ?? 0);
    this.attackTimer = 0.5;
    this.spawnTimer = 0;
    this.auraTimer = 0;
    this.hurtUntil = 0;
    this.hurtFlashUntil = 0;
    this.attackAnimUntil = 0;
    this.tauntReadyAt = 0;
    this.tauntUntil = 0;
    this.nextBossAt = Number(params.get('boss') ?? BOSS_INTERVAL);
    this.bossCount = Number(params.get('skip') ?? 0);
    this.boss = null;
    this.paused = false;
    this.choosing = false;
    this.dead = false;
    this.pauseLabel = null;
    this.decor.clear();
    this.barkAt = this.elapsed + 3;

    this.ground = this.add.tileSprite(0, 0, GAME_W, GAME_H, 'grass').setOrigin(0).setScrollFactor(0).setDepth(-1e9);

    const sheet = this.def.sheet;

    // Pozice postavy = její chodidla; kolizní kruh je kolem nohou.
    this.player = this.physics.add.sprite(0, 0, sheet, 0).setScale(2).setOrigin(0.5, 0.945);
    this.player.setCircle(14, 50, 100);
    this.player.play(`${this.def.id}-idle`);

    this.auraRing = this.add.circle(0, 0, AURA_RADIUS, 0xee8a3c, 0.12).setStrokeStyle(3, 0xee8a3c, 0.35).setVisible(false);

    this.enemies = this.physics.add.group();
    this.shots = this.physics.add.group();
    this.gems = this.add.group();
    this.physics.add.collider(this.enemies, this.enemies);
    this.physics.add.overlap(this.player, this.enemies, (_p, e) =>
      this.takeDamage(((e as Sprite).getData('def') as EnemyDef).damage),
    );
    this.physics.add.overlap(this.player, this.shots, (_p, s) => {
      const shot = s as Sprite;
      this.takeDamage(shot.getData('damage') as number, true);
      shot.destroy();
    });

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setFollowOffset(0, 70);

    this.keys = this.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SPACE,ESC,M') as Record<string, Key>;

    // Provokace jde spustit i kliknutím myši (mimo výběr vylepšení a pauzu).
    this.tauntClicked = false;
    this.input.on('pointerdown', () => {
      if (!this.choosing && !this.paused && !this.dead) this.tauntClicked = true;
    });

    // Zvuk smí začít až po prvním stisku nebo kliknutí (menu to už udělalo).
    const startAudio = () => {
      audio.unlock();
      if (!this.dead) audio.startMusic();
    };
    startAudio();
    this.input.keyboard!.once('keydown', startAudio);
    this.input.once('pointerdown', startAudio);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => audio.stopMusic());

    this.createHud();
  }

  update(_time: number, deltaMs: number) {
    this.ground.tilePositionX = this.cameras.main.scrollX;
    this.ground.tilePositionY = this.cameras.main.scrollY;
    if (Phaser.Input.Keyboard.JustDown(this.keys.M))
      this.banner(audio.toggleMute() ? 'Zvuk vypnutý' : 'Zvuk zapnutý', '#e8e6e1');
    if (this.dead || this.choosing) return;
    if (Phaser.Input.Keyboard.JustDown(this.keys.ESC)) this.togglePause();
    if (this.paused) return;
    const dt = Math.min(deltaMs / 1000, 0.05) * this.speed;
    this.elapsed += dt;

    this.hp = Math.min(this.stats.maxHp, this.hp + REGEN_PER_SECOND * dt);
    this.movePlayer();
    if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE) || this.tauntClicked || this.botWantsTaunt()) this.taunt();
    this.tauntClicked = false;
    this.moveEnemies();
    this.enemyBark();
    this.updateShots();
    this.spawnEnemies(dt);
    this.autoAttack(dt);
    this.tickAura(dt);
    this.collectGems(dt);
    this.updateDecor();
    this.updateHud();
  }

  // ---------- hráč ----------

  private movePlayer() {
    const k = this.keys;
    let dx = (k.D.isDown || k.RIGHT.isDown ? 1 : 0) - (k.A.isDown || k.LEFT.isDown ? 1 : 0);
    let dy = (k.S.isDown || k.DOWN.isDown ? 1 : 0) - (k.W.isDown || k.UP.isDown ? 1 : 0);
    if (this.bot) {
      // Bot běhá ve velkém kruhu, což je v tomhle žánru běžná taktika průměrného hráče.
      dx = Math.cos(this.elapsed * 0.45);
      dy = Math.sin(this.elapsed * 0.45);
    }
    const len = Math.hypot(dx, dy) || 1;
    this.player.setVelocity((dx / len) * this.stats.speed, (dy / len) * this.stats.speed);
    this.player.setDepth(this.player.y);

    if (this.elapsed < this.attackAnimUntil) {
      this.player.anims.stop();
      this.player.setFrame(this.def.frames.attack);
    } else {
      // Meč drží v levé ruce (z pohledu hráče), při pohybu doprava se postava zrcadlí.
      if (dx !== 0) this.player.setFlipX(dx > 0);
      this.player.play(`${this.def.id}-${dx || dy ? 'walk' : 'idle'}`, true);
    }
    const tint = this.elapsed < this.hurtFlashUntil ? 0xff7070 : this.elapsed < this.tauntUntil ? 0xffc27a : 0xffffff;
    this.player.setTint(tint);
  }

  private autoAttack(dt: number) {
    this.attackTimer -= dt;
    if (this.attackTimer > 0) return;
    const { attackRange: range, attackArc: arc, damage } = this.stats;
    const p = this.player;

    let target: Sprite | null = null;
    let best = range * 1.15;
    for (const e of this.enemies.getChildren() as Sprite[]) {
      const dist = Phaser.Math.Distance.Between(p.x, p.y, e.x, e.y);
      if (dist < best) {
        best = dist;
        target = e;
      }
    }
    if (!target) return;

    this.attackTimer = this.stats.attackCooldown;
    this.attackAnimUntil = this.elapsed + 0.18;
    audio.play('swing');
    const angle = Phaser.Math.Angle.Between(p.x, p.y, target.x, target.y);
    p.setFlipX(Math.cos(angle) > 0);

    for (const e of [...this.enemies.getChildren()] as Sprite[]) {
      const dist = Phaser.Math.Distance.Between(p.x, p.y, e.x, e.y);
      // Velcí nepřátelé (boss) se počítají od okraje těla, ne od středu.
      const reach = range + (e.getData('def') as EnemyDef).body[0] * e.scaleX * 0.6;
      if (dist > reach) continue;
      const diff = Phaser.Math.Angle.Wrap(Phaser.Math.Angle.Between(p.x, p.y, e.x, e.y) - angle);
      if (Math.abs(diff) > arc / 2) continue;
      this.damageEnemy(e, damage, 320, 0.14, true);
    }

    // Stopa po seknutí
    const slash = this.add.graphics({ x: p.x, y: p.y - 36 }).setDepth(p.y + 1);
    slash.fillStyle(0xffffff, 0.45);
    slash.slice(0, 0, range, angle - arc / 2, angle + arc / 2, false);
    slash.fillPath();
    this.tweens.add({ targets: slash, alpha: 0, duration: 200, onComplete: () => slash.destroy() });
  }

  // Provokace: odhodí a omráčí nepřátele kolem, na pár vteřin půlí přijaté poškození.
  private taunt() {
    if (this.elapsed < this.tauntReadyAt) return;
    this.tauntReadyAt = this.elapsed + this.stats.tauntCooldown;
    this.tauntUntil = this.elapsed + TAUNT_DURATION;
    audio.play('taunt');
    const p = this.player;

    const ring = this.add.circle(p.x, p.y - 20, 40, 0xee8a3c, 0).setStrokeStyle(8, 0xee8a3c, 0.9).setDepth(p.y - 500);
    this.tweens.add({ targets: ring, scale: TAUNT_RADIUS / 40, alpha: 0, duration: 380, onComplete: () => ring.destroy() });
    this.cameras.main.shake(140, 0.006);
    this.float(p.x, p.y - 290, Phaser.Utils.Array.GetRandom(this.def.quotes.taunt), '#ffc27a', 34, 1800);

    for (const e of [...this.enemies.getChildren()] as Sprite[]) {
      if (Phaser.Math.Distance.Between(p.x, p.y, e.x, e.y) <= TAUNT_RADIUS)
        this.damageEnemy(e, this.stats.damage * 1.5, 560, 0.7, true);
    }
  }

  private tickAura(dt: number) {
    const active = this.stats.aura > 0;
    this.auraRing.setVisible(active);
    if (!active) return;
    this.auraRing.setPosition(this.player.x, this.player.y - 10).setDepth(this.player.y - 1000);
    this.auraTimer -= dt;
    if (this.auraTimer > 0) return;
    this.auraTimer = 0.5;
    for (const e of [...this.enemies.getChildren()] as Sprite[]) {
      if (Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y) <= AURA_RADIUS)
        this.damageEnemy(e, this.stats.aura * 0.5, 0);
    }
  }

  // Zásah hráče. Střely ignorují krátkou nezranitelnost po doteku nepřítele.
  private takeDamage(amount: number, ignoreCooldown = false) {
    if (this.dead) return;
    if (!ignoreCooldown) {
      if (this.elapsed < this.hurtUntil) return;
      this.hurtUntil = this.elapsed + HURT_COOLDOWN;
    }
    const p = this.player;
    if (Math.random() < this.stats.block) {
      this.float(p.x, p.y - 230, 'BLOK!', '#9bd3ff', 36);
      audio.play('block');
      return;
    }
    let dmg = Math.max(1, amount - this.stats.armor);
    if (this.elapsed < this.tauntUntil) dmg = Math.ceil(dmg / 2);
    this.hp -= dmg;
    this.hurtFlashUntil = this.elapsed + 0.12;
    this.float(p.x, p.y - 230, `-${dmg}`, '#ff6a5a', 34);
    this.cameras.main.shake(90, 0.004);
    audio.play('hurt');
    if (this.hp <= 0) this.die();
  }

  // ---------- nepřátelé ----------

  private spawn(def: EnemyDef, x: number, y: number, hpScale: number) {
    const e = this.enemies.create(x, y, def.sheet) as Sprite;
    e.setScale(def.scale).setOrigin(0.5, def.originY);
    e.setCircle(...def.body);
    e.play({ key: def.id, startFrame: Phaser.Math.Between(0, 1) });
    e.setData({ def, hp: def.hp * hpScale, maxHp: def.hp * hpScale, stun: 0, actAt: this.elapsed + 1.5, windupUntil: 0, chargeUntil: 0 });
    return e;
  }

  private spawnEnemies(dt: number) {
    const t = this.elapsed;
    const ringPoint = () => {
      const a = Math.random() * Math.PI * 2;
      return [this.player.x + Math.cos(a) * SPAWN_RADIUS, this.player.y + Math.sin(a) * SPAWN_RADIUS] as const;
    };

    if (t >= this.nextBossAt) {
      this.nextBossAt += BOSS_INTERVAL;
      this.bossCount++;
      const [x, y] = ringPoint();
      // Bossové se střídají; každé další kolo mají víc životů.
      const def = BOSSES[(this.bossCount - 1) % BOSSES.length];
      this.boss = this.spawn(def, x, y, 1 + (this.bossCount - 1) * 0.6);
      this.boss.setPushable(false);
      this.banner(`${def.name.toUpperCase()} PŘICHÁZÍ!\n${Phaser.Utils.Array.GetRandom(def.quotes)}`, '#e0483a');
      audio.play('boss');
    }

    this.spawnTimer -= dt;
    if (this.spawnTimer > 0) return;
    this.spawnTimer = Math.max(0.35, 1.1 - t / 200);
    const pool = ENEMIES.filter((e) => t >= e.from);
    const total = pool.reduce((sum, e) => sum + e.weight, 0);
    const count = 1 + Math.floor(t / 60);
    for (let i = 0; i < count && this.enemies.countActive() < MAX_ENEMIES; i++) {
      let roll = Math.random() * total;
      const def = pool.find((e) => (roll -= e.weight) <= 0) ?? pool[0];
      this.spawn(def, ...ringPoint(), 1 + t / 150);
    }
  }

  private moveEnemies() {
    const bonus = Math.min(50, this.elapsed / 5);
    const p = this.player;
    for (const e of this.enemies.getChildren() as Sprite[]) {
      const def = e.getData('def') as EnemyDef;
      e.setDepth(e.y);
      if (this.elapsed < (e.getData('stun') as number)) continue;
      e.setFlipX(e.x > p.x);
      const dist = Phaser.Math.Distance.Between(e.x, e.y, p.x, p.y);

      if (def.ranged && dist < def.ranged.range) {
        // Střelec zůstane stát a pálí.
        e.setVelocity(0, 0);
        if (this.elapsed >= (e.getData('actAt') as number)) {
          e.setData('actAt', this.elapsed + def.ranged.cooldown);
          const a = Phaser.Math.Angle.Between(e.x, e.y - 50, p.x, p.y - 60);
          this.fireShot(e.x, e.y - 50, a, def.ranged);
        }
        continue;
      }

      if (def.boss && this.bossAct(e, def)) continue;
      this.physics.moveToObject(e, p, def.speed + (def.boss ? 0 : bonus));
    }
  }

  // Hlášky: jednou za pár vteřin něco zakřičí náhodný politik poblíž hráče; boss má přednost.
  private enemyBark() {
    if (this.elapsed < this.barkAt) return;
    this.barkAt = this.elapsed + 3 + Math.random() * 2.5;
    const p = this.player;
    const near = (this.enemies.getChildren() as Sprite[]).filter(
      (e) => Math.abs(e.x - p.x) < 800 && Math.abs(e.y - p.y) < 420,
    );
    if (near.length === 0) return;
    const boss = near.find((e) => (e.getData('def') as EnemyDef).boss);
    const speaker = boss && Math.random() < 0.6 ? boss : Phaser.Utils.Array.GetRandom(near);
    const def = speaker.getData('def') as EnemyDef;
    this.say(speaker, Phaser.Utils.Array.GetRandom(def.quotes), def.boss ? '#ffd27a' : '#fff3c4');
  }

  private say(e: Sprite, text: string, color: string) {
    const big = !!(e.getData('def') as EnemyDef).boss;
    this.float(e.x, e.y - e.displayHeight - 14, text, color, big ? 38 : 28, 2000);
  }

  // Schopnost bosse. Vrací true, když boss v tomhle snímku nemá jít za hráčem (rozjezd).
  private bossAct(e: Sprite, def: EnemyDef) {
    const boss = def.boss!;
    const p = this.player;
    const now = this.elapsed;
    const ready = now >= (e.getData('actAt') as number);

    if (boss.ability === 'charge') {
      if (now < (e.getData('chargeUntil') as number)) return true; // jede v přímce
      const windupUntil = e.getData('windupUntil') as number;
      if (windupUntil > 0) {
        e.setVelocity(0, 0);
        if (now >= windupUntil) {
          const a = Phaser.Math.Angle.Between(e.x, e.y, p.x, p.y);
          e.setVelocity(Math.cos(a) * 640, Math.sin(a) * 640);
          e.setData({ windupUntil: 0, chargeUntil: now + 0.9 });
          e.clearTint();
          audio.play('taunt');
        }
        return true;
      }
      if (ready) {
        // Krátké varování před rozjezdem
        e.setData({ actAt: now + boss.cooldown, windupUntil: now + 0.7 });
        e.setTint(0xffe060);
        return true;
      }
      return false;
    }

    if (ready && boss.shot) {
      e.setData('actAt', now + boss.cooldown);
      const y = e.y - e.displayHeight * 0.4;
      const aim = Phaser.Math.Angle.Between(e.x, y, p.x, p.y - 60);
      const angles =
        boss.ability === 'spread'
          ? [-0.28, 0, 0.28].map((d) => aim + d)
          : Array.from({ length: 12 }, (_, i) => aim + (i / 12) * Math.PI * 2);
      for (const a of angles) this.fireShot(e.x, y, a, boss.shot);
    }
    return false;
  }

  private fireShot(x: number, y: number, angle: number, spec: { sprite: string; speed: number; damage: number }) {
    const shot = this.shots.create(x, y, spec.sprite) as Sprite;
    const r = shot.width / 2 - 2;
    shot.setScale(2).setCircle(r, 2, 2).setDepth(UI_DEPTH - 10);
    shot.setData({ damage: spec.damage, dieAt: this.elapsed + 4 });
    shot.setVelocity(Math.cos(angle) * spec.speed, Math.sin(angle) * spec.speed);
    audio.play('shot');
  }

  private updateShots() {
    for (const s of [...this.shots.getChildren()] as Sprite[])
      if (this.elapsed >= (s.getData('dieAt') as number)) s.destroy();
  }

  private damageEnemy(e: Sprite, amount: number, knockback: number, stun = 0.14, showNumber = false) {
    const def = e.getData('def') as EnemyDef;
    const hp = (e.getData('hp') as number) - amount;
    if (showNumber) this.float(e.x, e.y - e.displayHeight * 0.8, `${Math.round(amount)}`, '#ffffff', 26, 450);
    if (hp <= 0) {
      this.killEnemy(e, def);
      return;
    }
    e.setData('hp', hp);
    if (showNumber) audio.play('hit');
    e.setTintFill(0xffffff);
    this.time.delayedCall(70, () => e.active && e.clearTint());
    if (knockback > 0 && !def.boss) {
      const a = Phaser.Math.Angle.Between(this.player.x, this.player.y, e.x, e.y);
      e.setVelocity(Math.cos(a) * knockback, Math.sin(a) * knockback);
      e.setData('stun', this.elapsed + stun);
    }
  }

  private killEnemy(e: Sprite, def: EnemyDef) {
    this.kills++;
    audio.play(def.boss ? 'bossDead' : 'kill');
    const drop = (x: number, y: number, value: number) => {
      const gem = this.add.image(x, y, 'gem').setScale(value > 1 ? 3 : 2).setDepth(y - 1);
      gem.setData('value', value);
      this.gems.add(gem);
    };
    if (def.boss) {
      this.boss = null;
      for (let i = 0; i < 20; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = 40 + Math.random() * 180;
        drop(e.x + Math.cos(a) * r, e.y + Math.sin(a) * r, def.xp);
      }
      this.hp = Math.min(this.stats.maxHp, this.hp + 50);
      this.banner(`${def.name.toUpperCase()} BYL ODVOLÁN!\n${def.defeat}`, '#f6d76a');
      this.cameras.main.flash(250, 255, 240, 200);
    } else {
      drop(e.x, e.y - 12, def.xp);
      // Občas odvolaný politik ještě něco prohlásí.
      if (Math.random() < 0.08) this.say(e, def.defeat, '#c8ccd4');
    }
    // Odvolaný politik zmizí v obláčku
    const puff = this.add.circle(e.x, e.y - e.displayHeight * 0.3, e.displayWidth * 0.25, 0xffffff, 0.7).setDepth(e.y);
    this.tweens.add({ targets: puff, scale: 1.8, alpha: 0, duration: 220, onComplete: () => puff.destroy() });
    e.destroy();
  }

  // ---------- zkušenosti a level up ----------

  private collectGems(dt: number) {
    const p = this.player;
    for (const gem of [...this.gems.getChildren()] as Phaser.GameObjects.Image[]) {
      const dist = Phaser.Math.Distance.Between(p.x, p.y - 30, gem.x, gem.y);
      if (dist < 34) {
        this.xp += gem.getData('value') as number;
        audio.play('pickup');
        gem.destroy();
      } else if (dist < this.stats.pickupRange) {
        const a = Phaser.Math.Angle.Between(gem.x, gem.y, p.x, p.y - 30);
        gem.x += Math.cos(a) * 620 * dt;
        gem.y += Math.sin(a) * 620 * dt;
      }
    }
    if (this.xp >= this.xpNeeded()) this.openLevelUp();
  }

  private xpNeeded() {
    return 3 + this.level * 3;
  }

  private openLevelUp() {
    this.xp -= this.xpNeeded();
    this.level++;
    this.choosing = true;
    this.freeze(true);
    audio.play('levelup');

    const picks = Phaser.Utils.Array.Shuffle([...UPGRADES]).slice(0, 3);
    const objects: Phaser.GameObjects.GameObject[] = [];
    const ui = <T extends Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text>(o: T) => {
      o.setScrollFactor(0).setDepth(UI_DEPTH + 10);
      objects.push(o);
      return o;
    };

    ui(this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x000000, 0.62));
    ui(this.label(GAME_W / 2, 190, `LEVEL ${this.level}!`, 84, '#ee8a3c'));
    ui(this.label(GAME_W / 2, 290, Phaser.Utils.Array.GetRandom(this.def.quotes.levelUp), 36, '#e8e6e1'));

    const choose = (u: Upgrade) => {
      this.input.keyboard!.off('keydown', onKey);
      objects.forEach((o) => o.destroy());
      audio.play('click');
      u.apply(this.stats);
      if (u.heal) this.hp = Math.min(this.stats.maxHp, this.hp + u.heal);
      this.choosing = false;
      this.freeze(false);
    };
    const onKey = (ev: KeyboardEvent) => {
      const i = ['1', '2', '3'].indexOf(ev.key);
      if (i >= 0) choose(picks[i]);
    };
    this.input.keyboard!.on('keydown', onKey);
    if (this.bot) window.setTimeout(() => this.choosing && choose(picks[0]), 60);

    picks.forEach((u, i) => {
      const x = GAME_W / 2 + (i - 1) * 480;
      const card = ui(this.add.rectangle(x, 620, 420, 380, 0x1f232b).setStrokeStyle(5, 0xee8a3c));
      card.setInteractive({ useHandCursor: true });
      card.on('pointerover', () => card.setFillStyle(0x2e3440));
      card.on('pointerout', () => card.setFillStyle(0x1f232b));
      card.on('pointerdown', () => choose(u));
      ui(this.label(x, 500, `${i + 1}`, 44, '#9a9fa8'));
      ui(this.label(x, 590, u.name, 44, '#ee8a3c'));
      ui(this.label(x, 690, u.desc, 32, '#e8e6e1'));
    });
    ui(this.label(GAME_W / 2, 900, 'Vyber kliknutím nebo klávesou 1, 2, 3', 30, '#9a9fa8'));
  }

  private freeze(frozen: boolean) {
    if (frozen) {
      this.physics.pause();
      this.anims.pauseAll();
      this.tweens.pauseAll();
    } else {
      this.physics.resume();
      this.anims.resumeAll();
      this.tweens.resumeAll();
    }
  }

  private togglePause() {
    this.paused = !this.paused;
    this.freeze(this.paused);
    if (this.paused) {
      this.pauseLabel = this.label(GAME_W / 2, GAME_H / 2, 'PAUZA\nEsc = pokračovat', 72, '#ffffff')
        .setScrollFactor(0)
        .setDepth(UI_DEPTH + 10);
    } else {
      this.pauseLabel?.destroy();
      this.pauseLabel = null;
    }
  }

  // ---------- smrt ----------

  private die() {
    this.dead = true;
    this.hp = 0;
    this.updateHud();
    this.physics.pause();
    this.anims.pauseAll();
    this.player.setTint(0x888888);
    audio.stopMusic();
    audio.play('death');
    // Truplik se skácí na záda, pak teprve naskočí tabulka.
    this.tweens.add({ targets: this.player, angle: this.player.flipX ? -90 : 90, duration: 450, ease: 'Bounce.easeOut' });
    this.time.delayedCall(900, () => this.showDeathScreen());
  }

  private showDeathScreen() {
    const run: Run = {
      character: this.def.id,
      time: this.elapsed,
      level: this.level,
      kills: this.kills,
      date: new Date().toISOString(),
    };
    // Pokusy s ladicími parametry se do žebříčku nepočítají.
    const debug = location.search.length > 1;
    const { rank, list } = debug ? { rank: 0, list: [] } : addScore(run);
    if (debug) console.log('[gods] konec pokusu', JSON.stringify({ ...run, stats: this.stats }));

    const depth = UI_DEPTH + 10;
    const ui = (o: Phaser.GameObjects.Rectangle | Phaser.GameObjects.Text) => o.setScrollFactor(0).setDepth(depth);
    ui(this.add.rectangle(GAME_W / 2, GAME_H / 2, GAME_W, GAME_H, 0x000000, 0.72));
    ui(this.label(GAME_W / 2, 150, `${this.def.name.toUpperCase()} PADL`, 110, '#e0483a'));
    ui(this.label(GAME_W / 2, 260, Phaser.Utils.Array.GetRandom(this.def.quotes.death), 42, '#e8e6e1'));
    const stats = `Přežil ${formatTime(this.elapsed)}   ·   level ${this.level}   ·   ${this.kills} odvolaných politiků`;
    ui(this.label(GAME_W / 2, 370, stats, 40, '#e8e6e1'));
    const verdict = rank === 1 ? 'Nový rekord!' : rank > 0 ? `${rank}. místo v žebříčku` : 'Do žebříčku to nestačilo.';
    ui(this.label(GAME_W / 2, 440, verdict, 40, rank === 1 ? '#ee8a3c' : '#9a9fa8'));
    if (!debug) drawScores(this, GAME_W / 2, 540, list.slice(0, 5), run, depth).forEach((t) => t.setScrollFactor(0));
    ui(this.label(GAME_W / 2, 960, 'Mezerník = hrát znovu   ·   Esc = menu', 36, '#9a9fa8'));
    this.input.keyboard!.once('keydown-SPACE', () => this.scene.restart());
    this.input.keyboard!.once('keydown-ESC', () => this.scene.start('menu'));
  }

  // Bot spustí Provokaci, když je obklíčený.
  private botWantsTaunt() {
    if (!this.bot || this.elapsed < this.tauntReadyAt) return false;
    const p = this.player;
    let near = 0;
    for (const e of this.enemies.getChildren() as Sprite[])
      if (Phaser.Math.Distance.Between(p.x, p.y, e.x, e.y) < 260) near++;
    return near >= 5;
  }

  // ---------- mapa ----------

  // Stromy, keře a kameny rozmístěné podle pozice v mřížce, takže louka je nekonečná a pořád stejná.
  private updateDecor() {
    const cam = this.cameras.main;
    const cx = Math.floor((cam.scrollX + GAME_W / 2) / DECOR_CELL);
    const cy = Math.floor((cam.scrollY + GAME_H / 2) / DECOR_CELL);
    for (let gy = cy - 3; gy <= cy + 3; gy++)
      for (let gx = cx - 4; gx <= cx + 4; gx++) {
        const key = `${gx},${gy}`;
        if (this.decor.has(key)) continue;
        const h = hash(gx, gy);
        const nearStart = gx >= -1 && gx <= 0 && gy >= -1 && gy <= 0;
        if (nearStart || h % 100 >= 60) {
          this.decor.set(key, null);
          continue;
        }
        const kind = h % 100 < 20 ? 'tree' : h % 100 < 42 ? 'bush' : 'rock';
        const x = gx * DECOR_CELL + 60 + ((h >>> 8) % (DECOR_CELL - 120));
        const y = gy * DECOR_CELL + 60 + ((h >>> 16) % (DECOR_CELL - 120));
        const img = this.add.image(x, y, kind).setScale(kind === 'tree' ? 3 : 2).setOrigin(0.5, 0.93).setDepth(y);
        this.decor.set(key, img);
      }
    for (const [key, img] of this.decor) {
      const [gx, gy] = key.split(',').map(Number);
      if (Math.abs(gx - cx) > 6 || Math.abs(gy - cy) > 5) {
        img?.destroy();
        this.decor.delete(key);
      }
    }
  }

  // ---------- HUD ----------

  private label(x: number, y: number, text: string, size: number, color: string) {
    return label(this, x, y, text, size, color);
  }

  // Text ve světě, který vyletí nahoru a zmizí (čísla poškození, hlášky).
  private float(x: number, y: number, text: string, color: string, size = 30, duration = 650) {
    const t = this.label(x, y, text, size, color).setDepth(UI_DEPTH - 1);
    this.tweens.add({ targets: t, y: y - 70, alpha: 0, duration, ease: 'Quad.easeIn', onComplete: () => t.destroy() });
  }

  // Velké oznámení uprostřed obrazovky.
  private banner(text: string, color: string) {
    const t = this.label(GAME_W / 2, 300, text, 80, color).setScrollFactor(0).setDepth(UI_DEPTH + 5);
    this.tweens.add({ targets: t, alpha: 0, delay: 1800, duration: 600, onComplete: () => t.destroy() });
  }

  private createHud() {
    this.hudBars = this.add.graphics().setScrollFactor(0).setDepth(UI_DEPTH);
    const hud = (t: Phaser.GameObjects.Text) => t.setScrollFactor(0).setDepth(UI_DEPTH + 1);
    this.hudHp = hud(this.label(230, 72, '', 28, '#ffffff'));
    this.hudLevel = hud(this.label(GAME_W - 40, 72, '', 36, '#ee8a3c').setOrigin(1, 0.5));
    this.hudTime = hud(this.label(GAME_W / 2, 76, '', 52, '#ffffff'));
    this.hudKills = hud(this.label(40, 124, '', 30, '#e8e6e1').setOrigin(0, 0.5));
    this.hudTaunt = hud(this.label(230, GAME_H - 75, '', 28, '#ffffff'));
    this.hudBoss = hud(this.label(GAME_W / 2, GAME_H - 118, '', 32, '#f07a8a'));
    this.updateHud();
  }

  private updateHud() {
    const g = this.hudBars;
    g.clear();
    // Zkušenosti přes celou šířku nahoře
    g.fillStyle(0x000000, 0.6).fillRect(0, 0, GAME_W, 26);
    g.fillStyle(0x4fc3f7, 1).fillRect(0, 0, GAME_W * Math.min(1, this.xp / this.xpNeeded()), 26);
    // Životy
    g.fillStyle(0x000000, 0.6).fillRect(40, 50, 380, 44);
    g.fillStyle(0xd0392e, 1).fillRect(44, 54, 372 * Math.max(0, this.hp / this.stats.maxHp), 36);
    this.hudHp.setText(`${Math.ceil(this.hp)} / ${this.stats.maxHp}`);
    this.hudLevel.setText(`Level ${this.level}`);
    this.hudTime.setText(formatTime(this.elapsed));
    this.hudKills.setText(`Odvoláno: ${this.kills}`);
    // Provokace
    const wait = this.tauntReadyAt - this.elapsed;
    const ready = wait <= 0;
    g.fillStyle(0x000000, 0.6).fillRect(40, GAME_H - 100, 380, 50);
    g.fillStyle(ready ? 0xee8a3c : 0x6b4a2a, 1).fillRect(
      44,
      GAME_H - 96,
      372 * (ready ? 1 : 1 - wait / this.stats.tauntCooldown),
      42,
    );
    this.hudTaunt.setText(ready ? 'MEZERNÍK / klik · Provokace' : `Provokace ${Math.ceil(wait)} s`);
    // Boss
    const boss = this.boss?.active ? this.boss : null;
    this.hudBoss.setVisible(!!boss);
    if (boss) {
      const ratio = (boss.getData('hp') as number) / (boss.getData('maxHp') as number);
      g.fillStyle(0x000000, 0.6).fillRect(GAME_W / 2 - 404, GAME_H - 94, 808, 38);
      g.fillStyle(0xc8324a, 1).fillRect(GAME_W / 2 - 400, GAME_H - 90, 800 * Math.max(0, ratio), 30);
      this.hudBoss.setText((boss.getData('def') as EnemyDef).name);
    }
  }
}

function hash(x: number, y: number) {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}
