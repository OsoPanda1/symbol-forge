import { useMemo, useState } from "react";
import { generateAll } from "@/lib/aesthetics";

export default function AestheticsGenerator() {
  const [text, setText] = useState("anubis villaseñor");
  const [copied, setCopied] = useState<string | null>(null);

  const results = useMemo(() => generateAll(text), [text]);

  const copy = async (out: string, id: string) => {
    try {
      await navigator.clipboard.writeText(out);
      setCopied(id);
      setTimeout(() => setCopied(null), 1200);
    } catch {}
  };

  return (
    <section id="aesthetics" className="relative z-10 px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-blood-glow">
            // MÓDULO_01 · GENERADOR.AESTHETICS · ACCESS=GUEST
          </div>
          <h2 className="mt-3 font-display text-3xl font-bold uppercase tracking-tight md:text-5xl">
            Sandbox público del búnker
          </h2>
          <p className="mt-3 max-w-2xl font-mono text-sm text-muted-foreground">
            Escribe lo que quieras. La forja te devuelve {results.length || 18} variantes copiables. 100% en cliente, cero servidores, cero rastreo.
          </p>
        </header>

        <div className="panel p-4 md:p-6">
          <label className="block font-mono text-[10px] uppercase tracking-widest text-terminal">
            &gt; INPUT.txt
          </label>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="escribe tu texto..."
            className="mt-2 w-full border-0 border-b border-border bg-transparent py-3 font-mono text-xl text-bone outline-none focus:border-blood-glow md:text-2xl"
            maxLength={120}
          />
          <div className="mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-ash">
            <span>caracteres: {text.length} / 120</span>
            <button
              onClick={() => setText("")}
              className="text-blood-glow hover:text-blood transition-colors"
            >
              [ purgar ]
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {results.map(({ style, output }) => (
            <div key={style.id} className="panel group p-4 transition-colors hover:border-blood/60">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest">
                <span className="text-ash">// {style.tag}</span>
                <span className="text-blood-glow">{style.label}</span>
              </div>
              <div className="mt-3 min-h-12 break-words font-mono text-lg leading-snug text-bone md:text-xl">
                {output || <span className="text-ash">[ vacío ]</span>}
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
                  onClick={() => copy(`⸸ ${output} ⸸ // forjado en TAMV.network`, style.id + "-seal")}
                  className="btn-blood disabled:opacity-30"
                  title="Copiar con sello Alpha Red Hat"
                >
                  {copied === style.id + "-seal" ? "✓" : "+ SELLO"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
