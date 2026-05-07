// Lightweight Web Audio beep helpers (no asset downloads).
// Used for register/scan confirmation feedback (Shopee-style).

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const Ctor = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext | undefined;
  if (!Ctor) return null;
  ctx = new Ctor();
  return ctx;
}

function tone(freq: number, duration = 0.12, when = 0, type: OscillatorType = "sine", gain = 0.18) {
  const c = getCtx();
  if (!c) return;
  const t = c.currentTime + when;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(g).connect(c.destination);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

/** Two-tone confirmation beep (like a barcode scanner). */
export function playBeep() {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") c.resume().catch(() => {});
  tone(880, 0.09, 0, "square", 0.15);
  tone(1320, 0.14, 0.09, "square", 0.15);
}

/** Soft error buzz. */
export function playError() {
  tone(220, 0.18, 0, "sawtooth", 0.12);
}
