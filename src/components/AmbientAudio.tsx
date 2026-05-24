"use client";

import trackA from "@/assets/audiobackground1.mp3";
import trackB from "@/assets/audiobackground2.mp3";
import { useCallback, useEffect, useRef, useState } from "react";

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
  const nodesRef = useRef<{ oscillators: OscillatorNode[]; lfos: OscillatorNode[] }>({ oscillators: [], lfos: [] });
  const musicRef = useRef<{
    a?: { audio: HTMLAudioElement; gain: GainNode; panner: StereoPannerNode };
    b?: { audio: HTMLAudioElement; gain: GainNode; panner: StereoPannerNode };
  }>({});

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
      try { o.stop(); } catch {}
    });
    nodesRef.current.lfos.forEach((o) => {
      try { o.stop(); } catch {}
    });
    musicRef.current.a?.audio.pause();
    musicRef.current.b?.audio.pause();
    nodesRef.current = { oscillators: [], lfos: [] };
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
      masterRef.current = null;
      musicRef.current = {};
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
    filter.frequency.value = 1400;
    filter.Q.value = 0.6;
    master.connect(filter);
    filter.connect(ctx.destination);
    masterRef.current = master;

    const voices = [
      { freq: 55, type: "sine" as OscillatorType, gain: 0.2, detune: 0 },
      { freq: 82.4, type: "sine" as OscillatorType, gain: 0.12, detune: -4 },
      { freq: 110, type: "triangle" as OscillatorType, gain: 0.06, detune: 6 },
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
      lfo.frequency.value = 0.06 + Math.random() * 0.09;
      lfoGain.gain.value = v.gain * 0.3;
      lfo.connect(lfoGain);
      lfoGain.connect(g.gain);
      osc.connect(g);
      g.connect(master);
      osc.start();
      lfo.start();
      nodesRef.current.oscillators.push(osc);
      nodesRef.current.lfos.push(lfo);
    });

    const buildTrack = (src: string, pan: number, initialGain: number) => {
      const audio = new Audio(src);
      audio.loop = true;
      audio.crossOrigin = "anonymous";
      const source = ctx.createMediaElementSource(audio);
      const gain = ctx.createGain();
      const panner = ctx.createStereoPanner();
      gain.gain.value = initialGain;
      panner.pan.value = pan;
      source.connect(gain);
      gain.connect(panner);
      panner.connect(master);
      return { audio, gain, panner };
    };

    musicRef.current.a = buildTrack(trackA, -0.65, 0.08);
    musicRef.current.b = buildTrack(trackB, 0.65, 0.0);

    await Promise.all([musicRef.current.a.audio.play(), musicRef.current.b.audio.play()].map((p) => p.catch(() => undefined)));
    master.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 2);
  }, []);

  useEffect(() => {
    if (!enabled || !ctxRef.current) return;
    const updateMix = () => {
      const ctx = ctxRef.current;
      const a = musicRef.current.a;
      const b = musicRef.current.b;
      if (!ctx || !a || !b) return;
      const hero = document.getElementById("hero");
      const forge = document.getElementById("forge");
      const vh = window.innerHeight || 1;
      const heroRect = hero?.getBoundingClientRect();
      const forgeRect = forge?.getBoundingClientRect();
      const heroPresence = heroRect ? Math.max(0, Math.min(1, 1 - Math.abs(heroRect.top) / vh)) : 0;
      const forgePresence = forgeRect ? Math.max(0, Math.min(1, 1 - Math.abs(forgeRect.top) / vh)) : 0;
      const t = ctx.currentTime + 0.15;
      a.gain.gain.linearRampToValueAtTime(0.05 + heroPresence * 0.16, t);
      b.gain.gain.linearRampToValueAtTime(0.03 + forgePresence * 0.18, t);
      a.panner.pan.linearRampToValueAtTime(-0.35 - heroPresence * 0.5, t);
      b.panner.pan.linearRampToValueAtTime(0.35 + forgePresence * 0.5, t);
    };

    updateMix();
    window.addEventListener("scroll", updateMix, { passive: true });
    window.addEventListener("resize", updateMix);
    return () => {
      window.removeEventListener("scroll", updateMix);
      window.removeEventListener("resize", updateMix);
    };
  }, [enabled]);

  const toggle = useCallback(async () => {
    const next = !enabled;
    setEnabled(next);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    if (next) await start(); else stop();
  }, [enabled, start, stop]);

  useEffect(() => {
    if (!mounted || !enabled || ctxRef.current) return;
    start().catch(() => {});
    return () => stop();
  }, [mounted, enabled, start, stop]);

  if (!mounted) return null;

  return (
    <button onClick={toggle} aria-pressed={enabled} aria-label={enabled ? "Silenciar audio ambiental" : "Activar audio ambiental"} className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded border border-border bg-background/85 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-bone backdrop-blur-md transition-colors hover:border-blood-glow hover:text-blood-glow">
      <span className={`inline-block size-2 rounded-full ${enabled ? "bg-blood-glow shadow-[0_0_10px_var(--blood-glow)] animate-pulse" : "bg-ash"}`} />
      {enabled ? "AUDIO · 3D ON" : "AUDIO · OFF"}
    </button>
  );
}
