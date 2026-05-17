type Plan = {
  id: string;
  name: string;
  price: string;
  desc: string;
  perks: string[];
  highlight?: boolean;
};

const PLANS: Plan[] = [
  {
    id: "single",
    name: "Forja Individual",
    price: "$30 MXN",
    desc: "Un símbolo de resistencia. Tu estandarte personal.",
    perks: [
      "1 símbolo especial (texto o imagen)",
      "Hash de forja único · no se duplica",
      "Sellado por The Alpha Red Hat",
      "Entrega instantánea tras pago",
    ],
  },
  {
    id: "legion",
    name: "Paquete de Legión",
    price: "$150 MXN",
    desc: "10 símbolos. La base simbólica de una orden completa.",
    perks: [
      "10 símbolos especiales",
      "Para clan, squad, comunidad o proyecto",
      "Hashes de forja individuales",
      "Manifiesto digital firmado",
      "Acceso a lista de espera ALPHA+",
    ],
    highlight: true,
  },
];

export default function AlphaForge() {
  return (
    <section id="forge" className="relative z-10 px-4 py-24">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12">
          <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-blood-glow">
            // MÓDULO_02 · ALPHA.FORGE · ACCESS=RESTRICTED
          </div>
          <h2
            className="glitch mt-3 font-display text-3xl font-bold uppercase tracking-tight md:text-5xl"
            data-text="Forja tu símbolo de resistencia"
          >
            Forja tu símbolo de resistencia
          </h2>
          <p className="mt-4 max-w-2xl font-mono text-sm text-muted-foreground">
            Con una imagen o una idea escrita, creas tu estandarte digital para bios, firmas, comunidades y proyectos. Los símbolos forjados aquí están vinculados a la forja Alpha Red Hat y{" "}
            <span className="text-bone">no se liberan en generadores públicos</span>.
          </p>
        </header>

        <div className="mb-12 grid gap-4 md:grid-cols-2">
          <ForgeMode
            tag="MODE.TEXT → SIGIL"
            title="A partir de un prompt"
            steps={[
              "Escribes lo que quieres representar.",
              "La IA forja 3–5 símbolos candidatos.",
              "Eliges, pagas, copias tu estandarte.",
            ]}
          />
          <ForgeMode
            tag="MODE.IMAGE → SIGIL"
            title="A partir de una imagen"
            steps={[
              "Subes un logo, dibujo o ícono simple.",
              "Visión IA extrae su esencia.",
              "Recibes su versión textual forjada.",
            ]}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {PLANS.map((p) => (
            <div
              key={p.id}
              className={`panel relative p-6 md:p-8 ${
                p.highlight ? "border-blood/60 shadow-[var(--shadow-blood)]" : ""
              }`}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-6 border border-blood bg-background px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-blood-glow">
                  ⸸ recomendado por la forja
                </div>
              )}
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-ash">
                {p.id === "single" ? "TIER.SOLO" : "TIER.LEGION"}
              </div>
              <h3 className="mt-2 font-display text-2xl font-bold uppercase tracking-tight md:text-3xl">
                {p.name}
              </h3>
              <div className="mt-4 font-display text-5xl font-extrabold text-bone">
                {p.price}
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
              <button
                className={`mt-8 w-full ${p.highlight ? "btn-blood blood-pulse" : "btn-ghost"}`}
                onClick={() =>
                  alert(
                    "La forja Alpha estará disponible en la próxima fase. Pasarela de pagos en integración."
                  )
                }
              >
                {p.highlight ? "⸸ Forjar la Legión" : "⌁ Forjar 1 símbolo"}
              </button>
            </div>
          ))}
        </div>

        <p className="mt-10 max-w-3xl border-l-2 border-blood/60 pl-4 font-mono text-xs italic text-ash md:text-sm">
          &gt; No te prometemos que este símbolo cambiará el mundo. Pero sí te prometemos algo:
          no salió de un generador genérico. Lo forjaste tú en la zona de hackeo de The Alpha Red Hat.
        </p>
      </div>
    </section>
  );
}

function ForgeMode({ tag, title, steps }: { tag: string; title: string; steps: string[] }) {
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
  );
}
