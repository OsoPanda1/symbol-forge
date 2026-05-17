"use client";

import { useEffect, useRef } from "react";

const LEGION_CHARS = "A̵̢̡͙͓̥̣̩̋̔͒̏́̏̀l̷̹͕̻̞͚̀̓ͅf̶̔͂̀̓̈́̉̂̾̚ aire ̝̹e̵̡̖͖̥͙̗̙̬͌̓̎͛̃̀ͅd̴̨̰̱̈́̃Ḩ̵͙̻̹͗̉̅͗̑ en";
const NOISE_CHARS = "01ΛΨ₪⧉⟟ᚠᚱᚨᛉ∴⊕⊗◇◆▣▢▓░≡≜☲☵☳";
const CHARS = LEGION_CHARS + NOISE_CHARS;

type MatrixRainProps = {
  density?: number; // 0.3–1.0 (más alto = más columnas)
  maxColumnWidth?: number; // px
};

export default function MatrixRain({ density = 0.7, maxColumnWidth = 24 }: MatrixRainProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = containerRef.current;
    if (!el) return;

    const createColumns = () => {
      if (!el) return;
      el.innerHTML = "";

      const width = window.innerWidth;
      const baseColWidth = maxColumnWidth;
      const maxCols = Math.floor(width / baseColWidth);
      const cols = Math.max(8, Math.floor(maxCols * density));

      for (let i = 0; i < cols; i++) {
        const col = document.createElement("div");
        col.className = "matrix-col";

        // Posición y tamaño variable para que no parezca grid rígido
        const colWidth = baseColWidth * (0.7 + Math.random() * 0.6);
        const x = Math.random() * (width - colWidth);

        col.style.left = `${x}px`;
        col.style.fontSize = `${11 + Math.random() * 6}px`;
        col.style.animationDuration = `${6 + Math.random() * 10}s`;
        col.style.animationDelay = `${-Math.random() * 12}s`;
        col.style.opacity = `${0.18 + Math.random() * 0.5}`;

        // 10–40 símbolos por columna
        const len = 10 + Math.floor(Math.random() * 30);
        let s = "";
        for (let j = 0; j < len; j++) {
          const char = CHARS[Math.floor(Math.random() * CHARS.length)];
          s += char;
        }

        // De vez en cuando, insertar la marca “ANUBIS / ALPHA” oculta
        if (Math.random() > 0.8) {
          const brand = Math.random() > 0.5 ? "⟟⟟ANUBIS⟟⟟" : "αLPHAͶET";
          const insertAt = Math.floor(len / 2);
          s = s.slice(0, insertAt) + brand + s.slice(insertAt);
        }

        col.textContent = s;
        el.appendChild(col);
      }
    };

    createColumns();

    // Recalcular al cambiar tamaño de ventana
    let resizeTimeout: number | undefined;
    const handleResize = () => {
      if (resizeTimeout) window.clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        createColumns();
      }, 250);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [density, maxColumnWidth]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 overflow-hidden"
      style={{ zIndex: 0, opacity: 0.45 }}
      aria-hidden="true"
    />
  );
}
