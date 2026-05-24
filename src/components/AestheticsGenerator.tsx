// src/components/AestheticsGenerator.tsx
"use client";

import { useMemo, useState } from "react";
import { generateAll } from "@/lib/aesthetics";
import { buildIdentitySigil, SYMBOL_ATLAS } from "@/lib/symbol-atlas";
import OptimizedVideo from "@/components/OptimizedVideo";
import aestheticsBg from "@/assets/246877_medium.mp4";
import forgeSeal from "@/assets/ChatGPT Image 23 may 2026, 05_11_38 a.m..png";

type Props = {
  initialText?: string;
};

export default function AestheticsGenerator({ initialText = "anubis villaseñor" }: Props) {
  const [text, setText] = useState(initialText);
  const [copied, setCopied] = useState<string | null>(null);

  const results = useMemo(() => generateAll(text), [text]);
  const identitySigil = useMemo(() => buildIdentitySigil(text), [text]);

  const copy = async (out: string, id: string) => {
    if (!out) return;
    try {
      await navigator.clipboard.writeText(out);
      setCopied(id);
      setTimeout(() => setCopied(null), 900);
    } catch {
      // opcional: log local
    }
  };

  return (
    <section id="aesthetics" className="relative z-10 px-4 py-20">
      <div className="mx-auto max-w-6xl">
        {/* HEADER TIPO CONSOLA/NODO */}
        <header className="mb-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-blood-glow">
              // MODULE_01 · GENERADOR.AESTHETICS · ACCESS=GUEST
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-ash">
              <span className="inline-flex items-center gap-1">
                <span className="inline-block size-1.5 rounded-full bg-terminal shadow-[0_0_8px_rgba(0,255,180,0.7)]" />
                <span>motor: cliente_local</span>
              </span>
              <span className="h-[1px] w-6 bg-border/60" />
              <span>trazabilidad: 0% · rastreo: anulado</span>
            </div>
          </div>

          <h2 className="mt-4 font-display text-3xl font-bold uppercase tracking-tight md:text-5xl">
            Sandbox público del búnker
          </h2>

          <p className="mt-3 max-w-2xl font-mono text-sm text-muted-foreground md:text-base">
            Este es tu laboratorio libre. Escribe cualquier cosa y el núcleo estético de TAMV
            generará{" "}
            <span className="text-bone">{results.length || 18} variaciones listas para copiar</span>{" "}
            sin hablar con ningún servidor externo. 100% en cliente, cero nubes corporativas, cero
            cookies de rastreo.
          </p>

          <p className="mt-2 max-w-2xl font-mono text-[11px] text-ash">
            &gt; Todo lo que forjes aquí es público. El modo ALPHA es donde los símbolos dejan de
            ser sandbox y pasan a ser estandartes.
          </p>
        </header>

        {/* BLOQUE INPUT + STATS */}
        <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
          {/* Panel de entrada con video de fondo */}
          <div className="panel relative overflow-hidden p-4 md:p-6">
            <OptimizedVideo
              src={aestheticsBg}
              wrapperClassName="pointer-events-none absolute inset-0"
              className="h-full w-full object-cover opacity-25"
              overlayClassName="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90"
            />

            <div className="relative">
              <div className="flex items-center justify-between">
                <label className="block font-mono text-[10px] uppercase tracking-[0.26em] text-terminal">
                  &gt; INPUT.txT
                </label>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ash">
                  sandbox · legiones
                </span>
              </div>

              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="escribe tu texto, alias o estandarte base..."
                className="mt-3 w-full border-0 border-b border-border bg-transparent pb-2 pt-1 font-mono text-xl text-bone outline-none focus:border-blood-glow md:text-2xl"
                maxLength={120}
              />

              <div className="mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-ash">
                <span>
                  caracteres: {text.length} / 120 · variaciones: {results.length || 18}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setText("anubis villaseñor")}
                    className="text-terminal hover:text-acid transition-colors"
                  >
                    [ cargar_demo ]
                  </button>
                  <button
                    onClick={() => setText("")}
                    className="text-blood-glow hover:text-blood transition-colors"
                  >
                    [ purgar ]
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Panel “lectura de sistema” */}
          <div className="panel flex flex-col justify-between p-4 md:p-6">
            <div>
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-ash">
                <span>// lectura.del.núcleo</span>
                <span className="text-terminal">estado: estable</span>
              </div>
              <div className="mt-4 overflow-hidden rounded border border-border/60 bg-black/60">
                <img src={forgeSeal} alt="Sello visual de forja" className="h-28 w-full object-cover opacity-80" loading="lazy" />
              </div>

              <p className="mt-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
                Cada variante que ves abajo es una posible cara de tu identidad digital. Úsalas como
                alias, firmas, separadores, headers de documentos o marcadores de territorio en
                plataformas corporativas.
              </p>
            </div>

            <div className="mt-4 rounded border border-border/70 bg-black/70 px-3 py-2 font-mono text-[10px] leading-relaxed text-terminal">
              <p>
                [LOG] Motor local operativo. Ningún input de este módulo abandona tu navegador.
                <span className="text-blood-glow">
                  {" "}
                  El rastreo publicitario y los perfiles de comportamiento están bloqueados en este
                  segmento.
                </span>
              </p>
            </div>
          </div>
        </div>


        <div className="mt-8 grid gap-4 md:grid-cols-[1.3fr_2fr]">
          <div className="panel p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ash">// identidad_sugerida</div>
            <div className="mt-3 break-words font-mono text-xl text-bone">{identitySigil || "[ sin semilla ]"}</div>
            <p className="mt-2 font-mono text-[11px] text-muted-foreground">Generación determinista para alias social / gamer con símbolos especiales listos para copiar.</p>
          </div>
          <div className="panel p-4">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ash">// atlas_de_símbolos</div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {SYMBOL_ATLAS.map((group) => (
                <div key={group.id} className="rounded border border-border/60 bg-black/40 px-2 py-2">
                  <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-terminal">{group.label}</div>
                  <div className="mt-1 break-words font-mono text-sm text-bone">{group.symbols.join(" ")}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RESULTADOS · TARJETAS DE SÍMBOLOS */}
        <div className="mt-10 border-t border-border/60 pt-6">
          <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-ash">
            <span>// salida_estética · click_para_inyectar_en_el_portapapapeles</span>
            <span className="text-terminal">
              símbolos activos: {results.length || 18} · modo: público
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {results.map(({ style, output }) => (
              <div
                key={style.id}
                className="panel group flex flex-col justify-between p-4 transition-colors hover:border-blood/60"
              >
                <div>
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em]">
                    <span className="text-ash">// {style.tag}</span>
                    <span className="text-blood-glow">{style.label}</span>
                  </div>
                  <div className="mt-3 min-h-12 break-words font-mono text-lg leading-snug text-bone md:text-xl">
                    {output ? (
                      output
                    ) : (
                      <span className="text-ash">[ vacío · alimenta el núcleo arriba ]</span>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    disabled={!output}
                    onClick={() => copy(output, style.id)}
                    className="btn-ghost flex-1 disabled:opacity-30"
                  >
                    {copied === style.id ? "✓ COPIADO" : "⌘ COPIAR"}
                  </button>
                  <button
                    disabled={!output}
                    onClick={() =>
                      copy(
                        `⸸ ${output} ⸸ // forjado en TAMV.network · nodo The Alpha Red Hat`,
                        style.id + "-seal",
                      )
                    }
                    className="btn-blood flex-1 disabled:opacity-30"
                    title="Copiar con sello Alpha Red Hat"
                  >
                    {copied === style.id + "-seal" ? "✓ SELLADO" : "+ SELLO"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
