// Lightweight Web Audio beep helpers (no asset downloads).
// Used for register/scan confirmation feedback (Shopee-style).

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const Ctor = (window.AudioContext || (window as any).webkitAudioContext) as
    | typeof AudioContext
    | undefined;
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
  const fire = () => {
    tone(880, 0.12, 0, "square", 0.35);
    tone(1320, 0.18, 0.11, "square", 0.35);
  };
  if (c.state === "suspended") {
    c.resume().then(fire).catch(fire);
  } else {
    fire();
  }
}

// Prime the AudioContext on the first user gesture so subsequent
// programmatic beeps (e.g. after a successful sale registration on mobile)
// are guaranteed to play without being blocked by the autoplay policy.
if (typeof window !== "undefined") {
  const prime = () => {
    const c = getCtx();
    if (c && c.state === "suspended") c.resume().catch(() => {});
  };
  window.addEventListener("pointerdown", prime, { once: false, passive: true });
  window.addEventListener("touchstart", prime, { once: false, passive: true });
  window.addEventListener("keydown", prime, { once: false, passive: true });
}

/** Soft error buzz. */
export function playError() {
  tone(220, 0.18, 0, "sawtooth", 0.12);
}
