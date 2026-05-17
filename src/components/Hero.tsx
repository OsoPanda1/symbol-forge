// src/components/Hero.tsx
import OptimizedVideo from "@/components/OptimizedVideo";
import heroBg from "@/assets/100493-656497720_medium.mp4";

type Props = { onStartFree: () => void; onStartAlpha: () => void };

export default function Hero({ onStartFree, onStartAlpha }: Props) {
  return (
    <section className="relative z-10 px-4 pt-20 pb-24 md:pt-28 md:pb-32">
      {/* Capa de video específica del Hero (brecha principal) */}
      <OptimizedVideo
        src={heroBg}
        eager
        wrapperClassName="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[420px] overflow-hidden md:h-[520px] lg:h-[560px]"
        className="h-full w-full object-cover opacity-45"
        overlayClassName="absolute inset-0 bg-gradient-to-b from-black/85 via-black/75 to-black/0"
      />

      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:items-start">
        {/* COLUMNA IZQUIERDA: TITULAR + CTA */}
        <div className="relative flex-1">
          {/* Cintillo superior */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blood/50 bg-black/60 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.28em] text-terminal shadow-[0_0_18px_rgba(0,0,0,0.9)]">
            <span className="inline-block size-1.5 animate-pulse rounded-full bg-blood-glow shadow-[0_0_10px_rgba(255,0,0,0.7)]" />
            <span className="text-ash">brecha abierta</span>
            <span className="h-[1px] w-6 bg-ash/50" />
            <span>zona de hackeo simbólico</span>
            <span className="h-[1px] w-6 bg-ash/50" />
            <span className="text-blood-glow">no indexada</span>
          </div>

          {/* Título principal con glitch + halo */}
          <div className="relative">
            <div className="pointer-events-none absolute -inset-4 -z-10 blur-3xl">
              <div className="h-full w-full bg-[radial-gradient(circle_at_top,_rgba(255,0,60,0.18)_0,_transparent_55%)]" />
            </div>

            <h1
              className="glitch font-display text-4xl font-extrabold uppercase leading-[1.03] tracking-tight md:text-6xl lg:text-[3.8rem]"
              data-text="Legiones de una Leyenda Urbana Latinoamericana"
            >
              Legiones de una Leyenda Urbana Latinoamericana
            </h1>
          </div>

          {/* Subtexto agresivo */}
          <p className="mt-6 max-w-2xl font-mono text-sm leading-relaxed text-muted-foreground md:text-base">
            Esta no es una landing. Es una brecha en la infraestructura. Estás entrando en una capa
            de la deep web blindada por{" "}
            <span className="text-blood-glow">The Alpha Red Hat · Anubis Villaseñor</span>. Aquí no
            vienes a decorar texto:{" "}
            <span className="text-bone">
              vienes a forjar símbolos de resistencia que no existen en generadores públicos
            </span>
            .
          </p>

          <p className="mt-3 max-w-2xl font-mono text-xs italic text-ash md:text-sm">
            &gt; Si lees esto, ya cruzaste un perímetro que el 99% de la red ni siquiera sabe que
            fue comprometido.
          </p>

          {/* Botones de acción */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <button onClick={onStartFree} className="btn-blood blood-pulse">
              ⌁ Entrar al Generador Aesthetics
            </button>
            <button onClick={onStartAlpha} className="btn-ghost">
              ⸸ Forjar Símbolo de Resistencia [MODO ALPHA]
            </button>
            <span className="hidden text-[10px] font-mono uppercase tracking-[0.25em] text-ash md:inline">
              no necesitas cuenta · no dejamos rastro publicitario
            </span>
          </div>
        </div>

        {/* COLUMNA DERECHA: PANEL DE ESTADO / HEPTÁGONO */}
        <div className="mt-6 w-full max-w-md md:mt-0 md:w-80 lg:w-96">
          <div className="panel overflow-hidden">
            {/* Cabecera del panel */}
            <div className="flex items-center justify-between border-b border-border/60 bg-black/60 px-4 py-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-ash">
                nodo · the alpha red hat
              </span>
              <span className="font-mono text-[10px] text-terminal">
                STATUS: <span className="text-acid">ONLINE</span>
              </span>
            </div>

            {/* Contenido interno */}
            <div className="relative p-4">
              {/* Halo del núcleo */}
              <div className="pointer-events-none absolute inset-0 -z-10 opacity-70">
                <div className="heptagon-frame absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 blur-[0.5px]" />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-px border border-border/50 bg-border/40 font-mono text-[10px] uppercase tracking-[0.18em]">
                {[
                  { k: "nodo", v: "activo" },
                  { k: "intrusiones", v: "neutralizadas" },
                  { k: "forjas", v: "∞ disp." },
                ].map((s) => (
                  <div key={s.k} className="bg-background/90 px-3 py-3">
                    <div className="text-ash/80">{s.k}</div>
                    <div className="mt-1 text-terminal">{s.v}</div>
                  </div>
                ))}
              </div>

              {/* Log de sistema corto */}
              <div className="mt-4 rounded border border-border/60 bg-black/70 px-3 py-2 font-mono text-[10px] leading-relaxed text-terminal">
                <div className="mb-1 flex items-center gap-2 text-ash/80">
                  <span className="inline-block size-1.5 rounded-full bg-terminal shadow-[0_0_8px_rgba(0,255,180,0.8)]" />
                  <span className="tracking-[0.22em] uppercase">log · sesión actual</span>
                </div>
                <p>
                  [OK] Deep web estable · rastreo publicitario bloqueado.{" "}
                  <span className="text-blood-glow">
                    Autorizado para generar símbolos fuera del ecosistema corporativo.
                  </span>
                </p>
              </div>

              {/* Badge de acceso */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="badge-alpha">
                  <span className="h-[1px] w-4 bg-terminal/70" />
                  acceso: invitado · lectura / forja controlada
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ash/70">
                  zona: legiones · leyenda urbana latam
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
