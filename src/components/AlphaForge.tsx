// src/components/AlphaForge.tsx
"use client"

import { useState } from "react"
import forgeBg from "@/assets/100993-657759886_medium.mp4"

type PlanId = "single" | "legion"

type Plan = {
  id: PlanId
  name: string
  price: string
  desc: string
  perks: string[]
  highlight?: boolean
  psychology: string
}

const PLANS: Plan[] = [
  {
    id: "single",
    name: "Forja Individual",
    price: "$30 MXN",
    desc: "Un símbolo para marcar territorio en un internet que nunca pensó en ti.",
    perks: [
      "1 símbolo especial (texto o imagen)",
      "Hash de forja único dentro del índice Alpha",
      "Sellado por The Alpha Red Hat",
      "Entrega instantánea tras pago",
    ],
    psychology: "Para el que entiende que un solo estandarte bien puesto vale más que mil posts.",
  },
  {
    id: "legion",
    name: "Paquete de Legión",
    price: "$150 MXN",
    desc: "10 símbolos. Suficiente para nombrar a una orden, un clan y sus sub‑nodos.",
    perks: [
      "10 símbolos especiales independientes",
      "Diseñados para clan, squad, comunidad o protocolo de proyecto",
      "Hashes de forja individuales por símbolo",
      "Mini‑manifiesto digital firmado para la legión",
      "Ingreso a lista de espera ALPHA+ (experimentos cerrados)",
    ],
    highlight: true,
    psychology: "Para quienes no vienen solos: vienen con tropa, con nombres de guerra y reglas propias.",
  },
]

export default function AlphaForge() {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("legion")

  const handleForge = (plan: Plan) => {
    // Aquí luego cableas al checkout real
    alert(
      `La forja Alpha (${plan.id}) se activará en la siguiente fase.\n\nPlan: ${plan.name}\nPrecio: ${plan.price}`,
    )
  }

  return (
    <section id="forge" className="relative z-10 px-4 py-24">
      {/* Fondo de forja con video */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <video
          className="h-full w-full object-cover opacity-28"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src={forgeBg} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/80 to-black/95" />
      </div>

      <div className="mx-auto max-w-6xl">
        {/* HEADER MÓDULO ALPHA */}
        <header className="mb-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-blood-glow">
              // MÓDULO_02 · ALPHA.FORGE · ACCESS=RESTRICTED
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ash">
              zona de símbolos no replicables · índice interno alpha.red
            </div>
          </div>

          <h2
            className="glitch mt-4 font-display text-3xl font-bold uppercase tracking-tight md:text-5xl"
            data-text="Forja tu símbolo de resistencia"
          >
            Forja tu símbolo de resistencia
          </h2>

          <p className="mt-4 max-w-2xl font-mono text-sm text-muted-foreground md:text-base">
            Con una imagen o una idea escrita, creas tu{" "}
            <span className="text-bone">estandarte digital</span> para bios, firmas, comunidades y
            proyectos. Todo símbolo que pase por aquí queda indexado en la forja Alpha Red Hat y{" "}
            <span className="text-bone">
              no se libera en generadores genéricos ni catálogos públicos
            </span>
            .
          </p>

          <p className="mt-2 max-w-2xl font-mono text-[11px] text-ash">
            &gt; Esto no es un producto masivo. Es un taller clandestino de heráldica digital en una
            red que no está diseñada para reconocer tu existencia.
          </p>
        </header>

        {/* MODO DE FORJA: PROMPT / IMAGEN */}
        <div className="mb-12 grid gap-4 md:grid-cols-2">
          <ForgeMode
            tag="MODE.TEXT → SIGIL"
            title="A partir de un prompt"
            steps={[
              "Escribes qué quieres representar (legión, idea, rol, fractura).",
              "El núcleo IA genera 3–5 símbolos candidatos.",
              "Eliges uno, pagas, se registra en la forja y es tuyo.",
            ]}
          />
          <ForgeMode
            tag="MODE.IMAGE → SIGIL"
            title="A partir de una imagen"
            steps={[
              "Subes un logo, dibujo o ícono simple (sin ruido).",
              "Visión IA destila su forma y significado.",
              "Recibes una versión textual que puedes pegar en cualquier sistema.",
            ]}
          />
        </div>

        {/* SWITCH: ¿VIENES SOLO O CON LEGIÓN? */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.26em] text-ash">
            // ELIGE TU CONFIGURACIÓN DE ATAQUE
          </div>
          <div className="inline-flex overflow-hidden rounded-full border border-border bg-black/70 font-mono text-[10px] uppercase tracking-[0.22em]">
            <button
              type="button"
              onClick={() => setSelectedPlan("single")}
              className={`px-3 py-1.5 transition-colors ${
                selectedPlan === "single"
                  ? "bg-blood text-bone"
                  : "bg-transparent text-ash hover:text-bone"
              }`}
            >
              Operador Solo
            </button>
            <button
              type="button"
              onClick={() => setSelectedPlan("legion")}
              className={`px-3 py-1.5 transition-colors ${
                selectedPlan === "legion"
                  ? "bg-terminal text-black"
                  : "bg-transparent text-ash hover:text-bone"
              }`}
            >
              Legión Completa
            </button>
          </div>
        </div>

        {/* PLANES CON PSICOLOGÍA DE DECISIÓN */}
        <div className="grid gap-4 md:grid-cols-2">
          {PLANS.map((p) => {
            const selected = selectedPlan === p.id
            return (
              <div
                key={p.id}
                className={`panel relative flex flex-col p-6 md:p-8 ${
                  p.highlight ? "border-blood/60 shadow-[var(--shadow-blood)]" : ""
                } ${selected ? "ring-1 ring-blood" : ""}`}
              >
                {p.highlight && (
                  <div className="absolute -top-3 left-6 border border-blood bg-background px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-blood-glow">
                    ⸸ configuración recomendada por la forja
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-ash">
                    {p.id === "single" ? "TIER.SOLO" : "TIER.LEGION"}
                  </div>
                  {selected && (
                    <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-terminal">
                      &gt; seleccionado
                    </div>
                  )}
                </div>

                <h3 className="mt-2 font-display text-2xl font-bold uppercase tracking-tight md:text-3xl">
                  {p.name}
                </h3>

                <div className="mt-4 font-display text-5xl font-extrabold text-bone">
                  {p.price}
                  <span className="ml-2 align-middle font-mono text-xs text-ash">
                    {p.id === "single" ? "/ símbolo" : "/ 10 símbolos"}
                  </span>
                </div>

                <p className="mt-3 font-mono text-sm text-muted-foreground">{p.desc}</p>

                <ul className="mt-6 space-y-2 font-mono text-sm text-bone">
                  {p.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2">
                      <span className="mt-0.5 text-blood-glow">▸</span>
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-4 font-mono text-[11px] text-ash">{p.psychology}</p>

                <button
                  className={`mt-8 w-full ${
                    p.highlight ? "btn-blood blood-pulse" : "btn-ghost"
                  }`}
                  onClick={() => handleForge(p)}
                >
                  {p.highlight ? "⸸ Forjar la Legión" : "⌁ Forjar 1 símbolo"}
                </button>
              </div>
            )
          })}
        </div>

        {/* MENSAJE FINAL · MARCO MENTAL */}
        <p className="mt-10 max-w-3xl border-l-2 border-blood/60 pl-4 font-mono text-xs italic text-ash md:text-sm">
          &gt; No te prometemos que un símbolo cambie el mundo. Te prometemos algo más concreto:
          este símbolo{" "}
          <span className="text-bone">
            no salió de una app genérica ni de un catálogo para masas
          </span>
          . Lo forjaste tú, en una zona de hackeo que la mayoría nunca verá.
        </p>
      </div>
    </section>
  )
}

function ForgeMode({
  tag,
  title,
  steps,
}: {
  tag: string
  title: string
  steps: string[]
}) {
  return (
    <div className="panel p-5">
      <div className="font-mono text-[10px] uppercase tracking-widest text-terminal">{tag}</div>
      <h4 className="mt-2 font-display text-xl font-bold uppercase tracking-tight">{title}</h4>
      <ol className="mt-4 space-y-2 font-mono text-sm text-muted-foreground">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3">
            <span className="text-blood-glow">0{i + 1}</span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}
