type Props = { onStartFree: () => void; onStartAlpha: () => void };

export default function Hero({ onStartFree, onStartAlpha }: Props) {
  return (
    <section className="relative z-10 px-4 pt-16 pb-20 md:pt-24 md:pb-28">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 inline-flex items-center gap-2 border border-blood/40 bg-blood/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-blood-glow">
          <span className="inline-block size-1.5 animate-pulse rounded-full bg-blood-glow" />
          ZONA DE HACKEO SIMBÓLICO · DEEP WEB · NO INDEXADA
        </div>

        <h1
          className="glitch font-display text-4xl font-extrabold uppercase leading-[1.05] tracking-tight md:text-6xl lg:text-7xl"
          data-text="Legiones de una Leyenda Urbana Latinoamericana"
        >
          Legiones de una Leyenda Urbana Latinoamericana
        </h1>

        <p className="mt-6 max-w-2xl font-mono text-sm leading-relaxed text-muted-foreground md:text-base">
          Estás entrando en una capa de la deep web protegida por{" "}
          <span className="text-blood-glow">The Alpha Red Hat · Anubis Villaseñor</span>.
          Aquí no solo cambias fuentes:{" "}
          <span className="text-bone">forjas símbolos de resistencia y rebeldía</span> que no
          existen en generadores públicos.
        </p>

        <p className="mt-3 max-w-2xl font-mono text-xs italic text-ash md:text-sm">
          &gt; Si puedes leer esto, ya cruzaste un umbral que la mayoría ni siquiera sabe que existe.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <button onClick={onStartFree} className="btn-blood blood-pulse">
            ⌁ Entrar al Generador Aesthetics
          </button>
          <button onClick={onStartAlpha} className="btn-ghost">
            ⸸ Forjar Símbolo de Resistencia
          </button>
        </div>

        <div className="mt-12 grid max-w-2xl grid-cols-3 gap-px border border-border bg-border font-mono text-[10px] uppercase tracking-widest">
          {[
            { k: "NODO", v: "ACTIVO" },
            { k: "INTRUSIONES", v: "0 / 24h" },
            { k: "FORJAS", v: "∞ DISP." },
          ].map((s) => (
            <div key={s.k} className="bg-background/80 p-3">
              <div className="text-ash">{s.k}</div>
              <div className="mt-1 text-terminal">{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
