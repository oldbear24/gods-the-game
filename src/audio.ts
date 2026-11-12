// Zvuky a hudba generované přímo ve WebAudio, bez zvukových souborů.

export type SfxName =
  | 'swing' | 'hit' | 'kill' | 'hurt' | 'block' | 'pickup' | 'levelup'
  | 'taunt' | 'boss' | 'bossDead' | 'death' | 'click' | 'shot';

const MUTE_KEY = 'gods.muted';
const midi = (n: number) => 440 * 2 ** ((n - 69) / 12);

// Hudební smyčka: 4 takty po 8 osminách, akordy Am – F – C – G.
const BASS = [45, 41, 48, 43];
const LEAD = [
  [69, 72, 76, 72, 69, 76, 72, 76],
  [65, 69, 72, 69, 65, 72, 69, 72],
  [67, 72, 76, 72, 67, 76, 72, 79],
  [67, 71, 74, 71, 67, 74, 71, 74],
];
const STEP = 60 / 132 / 2; // délka osminy ve vteřinách

class GameAudio {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private musicGain!: GainNode;
  private noiseBuffer!: AudioBuffer;
  private lastPlayed = new Map<SfxName, number>();
  private musicTimer: number | null = null;
  private nextStepAt = 0;
  private step = 0;
  muted = localStorage.getItem(MUTE_KEY) === '1';

  // Prohlížeč dovolí zvuk až po kliknutí nebo stisku klávesy, proto se volá z ovládání.
  unlock() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 1;
      this.master.connect(this.ctx.destination);
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.5;
      this.musicGain.connect(this.master);
      this.noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem(MUTE_KEY, this.muted ? '1' : '0');
    if (this.ctx) this.master.gain.value = this.muted ? 0 : 1;
    return this.muted;
  }

  private tone(
    freq: number, dur: number, type: OscillatorType, vol: number,
    { slideTo = freq, at = 0, out = this.master as AudioNode } = {},
  ) {
    const ctx = this.ctx!;
    const t = ctx.currentTime + at;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo !== freq) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain).connect(out);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  private noise(dur: number, vol: number, { freq = 4000, at = 0, out = this.master as AudioNode } = {}) {
    const ctx = this.ctx!;
    const t = ctx.currentTime + at;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(filter).connect(gain).connect(out);
    src.start(t, Math.random() * 0.5, dur + 0.02);
  }

  play(name: SfxName) {
    if (!this.ctx || this.muted) return;
    // Časté zvuky (zásahy, sbírání) se nesmí slít do rachotu.
    const now = this.ctx.currentTime;
    if (now - (this.lastPlayed.get(name) ?? -1) < 0.045) return;
    this.lastPlayed.set(name, now);

    switch (name) {
      case 'swing': this.noise(0.09, 0.16, { freq: 2600 }); break;
      case 'hit': this.tone(190, 0.07, 'square', 0.1, { slideTo: 90 }); break;
      case 'kill': this.tone(320, 0.11, 'square', 0.1, { slideTo: 110 }); break;
      case 'hurt': this.tone(170, 0.2, 'sawtooth', 0.2, { slideTo: 60 }); break;
      case 'block': this.tone(1100, 0.1, 'triangle', 0.22, { slideTo: 700 }); this.noise(0.05, 0.1, { freq: 6000 }); break;
      case 'pickup': this.tone(880, 0.07, 'sine', 0.08, { slideTo: 1400 }); break;
      case 'shot': this.tone(700, 0.12, 'triangle', 0.06, { slideTo: 300 }); break;
      case 'click': this.tone(660, 0.05, 'square', 0.08); break;
      case 'levelup': [72, 76, 79, 84].forEach((n, i) => this.tone(midi(n), 0.16, 'square', 0.12, { at: i * 0.08 })); break;
      case 'taunt': this.tone(110, 0.35, 'sawtooth', 0.22, { slideTo: 260 }); this.noise(0.3, 0.14, { freq: 900 }); break;
      case 'boss': this.tone(90, 0.9, 'sawtooth', 0.26, { slideTo: 45 }); this.tone(135, 0.9, 'sawtooth', 0.16, { slideTo: 60 }); break;
      case 'bossDead': [60, 64, 67, 72, 76, 79, 84].forEach((n, i) => this.tone(midi(n), 0.22, 'square', 0.13, { at: i * 0.09 })); break;
      case 'death': this.tone(420, 1.0, 'sawtooth', 0.22, { slideTo: 50 }); break;
    }
  }

  startMusic() {
    if (!this.ctx || this.musicTimer !== null) return;
    this.step = 0;
    this.nextStepAt = this.ctx.currentTime + 0.1;
    this.musicTimer = window.setInterval(() => this.scheduleMusic(), 50);
  }

  stopMusic() {
    if (this.musicTimer !== null) window.clearInterval(this.musicTimer);
    this.musicTimer = null;
  }

  private scheduleMusic() {
    const ctx = this.ctx!;
    // Po uspání záložky nedohánět zameškané takty.
    if (this.nextStepAt < ctx.currentTime - 0.5) this.nextStepAt = ctx.currentTime + 0.05;
    while (this.nextStepAt < ctx.currentTime + 0.2) {
      const at = this.nextStepAt - ctx.currentTime;
      const out = this.musicGain;
      const bar = Math.floor(this.step / 8) % 4;
      const i = this.step % 8;
      const second = Math.floor(this.step / 32) % 2 === 1; // každé druhé kolo o oktávu výš
      this.tone(midi(BASS[bar] + (i % 2 ? 12 : 0)), STEP * 0.9, 'triangle', 0.2, { at, out });
      this.tone(midi(LEAD[bar][i] + (second ? 12 : 0)), STEP * 0.8, 'square', 0.045, { at, out });
      if (i % 4 === 0) this.tone(130, 0.12, 'sine', 0.3, { slideTo: 45, at, out });
      if (i % 4 === 2) this.noise(0.09, 0.12, { freq: 1800, at, out });
      this.noise(0.03, 0.04, { freq: 8000, at, out });
      this.nextStepAt += STEP;
      this.step++;
    }
  }
}

export const audio = new GameAudio();
