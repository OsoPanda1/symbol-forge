"use client";

import { useEffect, useRef, useState } from "react";
import phaseTwo from "@/assets/142363-780562112_medium.mp4";
import phaseThree from "@/assets/118641-715427089_medium.mp4";

// Triple-phase cinematic intro:
//   PHASE 0 → YouTube transmission (aRgsTqreA_w)
//   PHASE 1 → Local ambient video #1 with manifesto overlay
//   PHASE 2 → Local ambient video #2 with system handshake
// Plays once per session (sessionStorage) and is skippable.

const PHASES = 3;
const YT_ID = "aRgsTqreA_w";
const SESSION_FLAG = "tarh.intro.consumed";

const phaseLines = [
  {
    tag: "TRANSMISIÓN 01 · ENLACE EXTERNO",
    title: "Brecha abierta en frecuencia no autorizada",
    sub: "Reproduciendo señal cifrada — desde el bunker de The Alpha Red Hat.",
  },
  {
    tag: "TRANSMISIÓN 02 · MEMORIA OPERACIONAL",
    title: "Las legiones nunca dejaron de marchar",
    sub: "El símbolo es la única identificación que el sistema no puede borrar.",
  },
  {
    tag: "TRANSMISIÓN 03 · HANDSHAKE CON EL NODO",
    title: "Acceso concedido a la forja",
    sub: "Generador desbloqueado · canal directo con la red TAMV.",
  },
];

export default function CinematicIntro() {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_FLAG)) return;
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const duration = phase === 0 ? 9000 : 6500; // YT slightly longer
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    timerRef.current = window.setTimeout(() => {
      if (phase < PHASES - 1) {
        setPhase((p) => p + 1);
        setProgress(0);
      } else finish();
    }, duration);
    return () => {
      cancelAnimationFrame(raf);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, phase]);

  const finish = () => {
    if (typeof window !== "undefined") sessionStorage.setItem(SESSION_FLAG, "1");
    setVisible(false);
  };

  const skip = () => finish();
  const next = () => {
    if (phase < PHASES - 1) {
      setPhase(phase + 1);
      setProgress(0);
    } else finish();
  };

  if (!visible) return null;

  const line = phaseLines[phase];

  return (
    <div className="fixed inset-0 z-[200] bg-black text-bone scanlines animate-fade-in">
      {/* Background media */}
      <div className="absolute inset-0 overflow-hidden">
        {phase === 0 && (
          <iframe
            key="yt"
            title="transmission"
            src={`https://www.youtube.com/embed/${YT_ID}?autoplay=1&mute=1&controls=0&modestbranding=1&playsinline=1&rel=0&loop=1&playlist=${YT_ID}`}
            allow="autoplay; encrypted-media; picture-in-picture"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[120vh] w-[210vw] -translate-x-1/2 -translate-y-1/2 opacity-70"
          />
        )}
        {phase === 1 && (
          <video
            key="v1"
            autoPlay
            muted
            playsInline
            className="h-full w-full object-cover opacity-70"
          >
            <source src={phaseTwo} type="video/mp4" />
          </video>
        )}
        {phase === 2 && (
          <video
            key="v2"
            autoPlay
            muted
            playsInline
            className="h-full w-full object-cover opacity-75"
          >
            <source src={phaseThree} type="video/mp4" />
          </video>
        )}
      </div>

      {/* Vignette + chromatic burn */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,oklch(0_0_0/0.85)_100%)]" />
      <div className="pointer-events-none absolute inset-0 mix-blend-screen opacity-30 bg-[linear-gradient(120deg,oklch(0.58_0.28_25/0.25),transparent_40%,oklch(0.78_0.2_150/0.25))]" />

      {/* HUD frame */}
      <div className="pointer-events-none absolute inset-4 border border-blood/40">
        <span className="absolute -top-px -left-px h-4 w-4 border-t-2 border-l-2 border-blood" />
        <span className="absolute -top-px -right-px h-4 w-4 border-t-2 border-r-2 border-blood" />
        <span className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-blood" />
        <span className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-blood" />
      </div>

      {/* Top status row */}
      <div className="absolute left-0 right-0 top-6 flex items-center justify-between px-8 font-mono text-[10px] uppercase tracking-[0.32em] text-terminal">
        <div className="flex items-center gap-3">
          <span className="inline-block size-2 animate-pulse rounded-full bg-blood shadow-[0_0_12px_oklch(0.58_0.28_25)]" />
          <span>tamv.network · streaming</span>
        </div>
        <div className="flex items-center gap-4">
          <span>fase {phase + 1} / {PHASES}</span>
          <button onClick={skip} className="border border-terminal/60 px-3 py-1 text-terminal hover:bg-terminal/10">
            saltar intro ▸
          </button>
        </div>
      </div>

      {/* Phase copy */}
      <div className="absolute inset-0 flex flex-col items-center justify-end px-8 pb-24 text-center">
        <div className="badge-alpha mb-4">{line.tag}</div>
        <h2
          className="glitch font-display text-3xl uppercase leading-tight md:text-5xl"
          data-text={line.title}
        >
          {line.title}
        </h2>
        <p className="mt-4 max-w-2xl font-mono text-xs text-ash md:text-sm">{line.sub}</p>

        {/* Progress bar */}
        <div className="mt-8 flex w-full max-w-xl items-center gap-2">
          {Array.from({ length: PHASES }).map((_, i) => (
            <div
              key={i}
              className="relative h-[3px] flex-1 overflow-hidden bg-bone/15"
            >
              <div
                className="absolute inset-y-0 left-0 bg-blood shadow-[0_0_8px_oklch(0.7_0.3_25)]"
                style={{
                  width:
                    i < phase ? "100%" : i === phase ? `${progress * 100}%` : "0%",
                  transition: i === phase ? "none" : "width 0.3s",
                }}
              />
            </div>
          ))}
        </div>

        <button onClick={next} className="btn-blood mt-8">
          {phase < PHASES - 1 ? "continuar ⟶" : "entrar al sistema ⸸"}
        </button>
      </div>

      {/* Bottom code rain hint */}
      <div className="pointer-events-none absolute bottom-3 left-8 right-8 flex justify-between font-mono text-[9px] uppercase tracking-[0.3em] text-ash/60">
        <span>node://anubis.villaseñor</span>
        <span>encryption: aes-512 · channel: dark</span>
        <span>{new Date().getUTCFullYear()}.alpha</span>
      </div>
    </div>
  );
}
