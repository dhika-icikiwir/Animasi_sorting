import type { Step } from "@/lib/algorithms";

/** Nilai batang 5..100 dipetakan ke 240..1000 Hz, jadi data yang makin terurut terdengar makin naik. */
const freqOf = (value: number) => 200 + value * 8;

export class StepSound {
  private ctx: AudioContext | null = null;

  /** Harus dipanggil dari klik pengguna: browser menolak memulai audio tanpa interaksi. */
  unlock() {
    this.ctx ??= new AudioContext();
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  private tone(freq: number, seconds: number, type: OscillatorType, delay = 0, volume = 0.07) {
    const ctx = this.ctx;
    if (!ctx) return;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(volume, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + seconds + 0.02);
  }

  /** Bunyi untuk satu langkah; panjangnya mengikuti jeda antar langkah agar tidak saling menumpuk. */
  playStep(step: Step, delayMs: number) {
    const seconds = Math.min(Math.max(delayMs / 1000, 0.03), 0.12);
    if (step.swap.length) {
      step.swap.forEach((i, k) => this.tone(freqOf(step.bars[i].value), seconds, "triangle", k * seconds * 0.5, 0.08));
    } else if (step.compare.length) {
      step.compare.forEach((i) => this.tone(freqOf(step.bars[i].value), seconds, "sine"));
    }
  }

  playFinish(step: Step) {
    const gap = Math.min(0.6 / step.bars.length, 0.04);
    step.bars.forEach((bar, i) => this.tone(freqOf(bar.value), 0.08, "sine", i * gap, 0.05));
  }
}
