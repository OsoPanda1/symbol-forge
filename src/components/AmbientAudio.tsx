"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Immersive procedural ambient drone generated with the Web Audio API.
 * Zero asset weight, SSR-safe (only constructs AudioContext on user gesture),
 * persists user preference in localStorage. Includes UI hover SFX hook via
 * the global `window.forgeSfx(type)` helper installed on mount.
 */
type SfxType = "hover" | "click" | "spark";

declare global {
  interface Window {
    forgeSfx?: (type: SfxType) => void;
  }
}

const STORAGE_KEY = "forge-audio-enabled";

export default function AmbientAudio() {
  const [enabled, setEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const nodesRef = useRef<{ oscillators: OscillatorNode[]; lfos: OscillatorNode[] }>({
    oscillators: [],
    lfos: [],
  });

  // Init SFX hook (always available, only audible when ctx exists)
  useEffect(() => {
    setMounted(true);
    const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored === "1") setEnabled(true);

    window.forgeSfx = (type: SfxType) => {
      const ctx = ctxRef.current;
      const master = masterRef.current;
      if (!ctx || !master) return;
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.connect(g);
      g.connect(master);
      const cfg = {
        hover: { f: 880, dur: 0.08, peak: 0.04, type: "sine" as OscillatorType },
        click: { f: 220, dur: 0.18, peak: 0.12, type: "triangle" as OscillatorType },
        spark: { f: 1760, dur: 0.25, peak: 0.06, type: "sawtooth" as OscillatorType },
      }[type];
      osc.type = cfg.type;
      osc.frequency.setValueAtTime(cfg.f, t);
      osc.frequency.exponentialRampToValueAtTime(cfg.f * 0.5, t + cfg.dur);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(cfg.peak, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + cfg.dur);
      osc.start(t);
      osc.stop(t + cfg.dur + 0.02);
    };

    return () => {
      delete window.forgeSfx;
    };
  }, []);

  const stop = useCallback(() => {
    nodesRef.current.oscillators.forEach((o) => {
      try {
        o.stop();
      } catch {
        /* noop */
      }
    });
    nodesRef.current.lfos.forEach((o) => {
      try {
        o.stop();
      } catch {
        /* noop */
      }
    });
    nodesRef.current = { oscillators: [], lfos: [] };
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
      masterRef.current = null;
    }
  }, []);

  const start = useCallback(async () => {
    if (ctxRef.current) return;
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = 0;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1200;
    filter.Q.value = 0.6;
    master.connect(filter);
    filter.connect(ctx.destination);
    masterRef.current = master;

    // Layered drone: deep root + perfect fifth + airy upper shimmer
    const voices = [
      { freq: 55, type: "sine" as OscillatorType, gain: 0.22, detune: 0 },
      { freq: 82.4, type: "sine" as OscillatorType, gain: 0.14, detune: -4 },
      { freq: 110, type: "triangle" as OscillatorType, gain: 0.08, detune: 6 },
      { freq: 330, type: "sine" as OscillatorType, gain: 0.04, detune: 0 },
    ];

    voices.forEach((v) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      osc.type = v.type;
      osc.frequency.value = v.freq;
      osc.detune.value = v.detune;
      g.gain.value = v.gain;
      lfo.type = "sine";
      lfo.frequency.value = 0.08 + Math.random() * 0.12;
      lfoGain.gain.value = v.gain * 0.35;
      lfo.connect(lfoGain);
      lfoGain.connect(g.gain);
      osc.connect(g);
      g.connect(master);
      osc.start();
      lfo.start();
      nodesRef.current.oscillators.push(osc);
      nodesRef.current.lfos.push(lfo);
    });

    // Fade in
    master.gain.linearRampToValueAtTime(0.45, ctx.currentTime + 2.5);
  }, []);

  const toggle = useCallback(async () => {
    const next = !enabled;
    setEnabled(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    }
    if (next) {
      await start();
    } else {
      stop();
    }
  }, [enabled, start, stop]);

  // Auto-start if user previously enabled (still requires their click event)
  useEffect(() => {
    if (!mounted || !enabled || ctxRef.current) return;
    start().catch(() => {});
    return () => stop();
  }, [mounted, enabled, start, stop]);

  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? "Silenciar audio ambiental" : "Activar audio ambiental"}
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded border border-border bg-background/85 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-bone backdrop-blur-md transition-colors hover:border-blood-glow hover:text-blood-glow"
    >
      <span
        className={`inline-block size-2 rounded-full ${
          enabled
            ? "bg-blood-glow shadow-[0_0_10px_var(--blood-glow)] animate-pulse"
            : "bg-ash"
        }`}
      />
      {enabled ? "AUDIO · ON" : "AUDIO · OFF"}
    </button>
  );
}
