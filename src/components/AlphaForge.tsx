// src/components/AlphaForge.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { STYLES } from "@/lib/aesthetics";
import OptimizedVideo from "@/components/OptimizedVideo";
import forgeBg from "@/assets/100993-657759886_medium.mp4";

type PlanId = "single" | "legion";
type ForgeMode = "text" | "image";

type Plan = {
  id: PlanId;
  name: string;
  price: string;
  desc: string;
  perks: string[];
  highlight?: boolean;
  psychology: string;
  delivery: string;
};

type ForgeOrder = {
  plan: Plan;
  mode: ForgeMode;
  prompt: string;
  contact: string;
  imageName?: string;
  symbol: string;
  hash: string;
  manifest: string;
};

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
    delivery: "1 símbolo validado + sello copiable",
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
    psychology:
      "Para quienes no vienen solos: vienen con tropa, con nombres de guerra y reglas propias.",
    delivery: "10 variantes + manifiesto de legión",
  },
];

const INTENTS = ["memoria", "frontera", "legión", "sombra", "fuego", "nodo", "resistencia"];
const DEFAULT_PROMPT = "legión jaguar de frontera";

function hashSeed(value: string) {
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function forgeHash(seed: string) {
  return `ALPHA-${hashSeed(seed).toString(16).toUpperCase().padStart(8, "0")}`;
}

function buildSymbol(seed: string, index: number) {
  const style = STYLES[(hashSeed(seed + index) + index) % STYLES.length];
  const intent = INTENTS[(hashSeed(seed + style.id) + index) % INTENTS.length];
  return `⸸ ${style.transform(seed || DEFAULT_PROMPT)} ⟡ ${intent.toUpperCase()}-${index + 1} ⸸`;
}

function buildManifest(order: ForgeOrder) {
  return [
    "THE ALPHA RED HAT · FORJA CONFIRMADA",
    `HASH: ${order.hash}`,
    `PLAN: ${order.plan.name} · ${order.plan.price}`,
    `MODO: ${order.mode === "text" ? "PROMPT → SIGIL" : "IMAGE → SIGIL"}`,
    `BASE: ${order.prompt}`,
    order.imageName ? `IMAGEN: ${order.imageName}` : undefined,
    `CONTACTO: ${order.contact}`,
    "SÍMBOLO:",
    order.symbol,
  ]
    .filter(Boolean)
    .join("\n");
}

function createCheckoutUrl(order: ForgeOrder) {
  const configuredUrl =
    order.plan.id === "single"
      ? import.meta.env.VITE_CHECKOUT_SINGLE_URL
      : import.meta.env.VITE_CHECKOUT_LEGION_URL;

  const payload = new URLSearchParams({
    plan: order.plan.id,
    hash: order.hash,
    mode: order.mode,
    prompt: order.prompt,
    contact: order.contact,
  });

  if (typeof configuredUrl === "string" && configuredUrl.startsWith("http")) {
    const url = new URL(configuredUrl);
    payload.forEach((value, key) => url.searchParams.set(key, value));
    return url.toString();
  }

  return `mailto:forja@tamv.network?subject=${encodeURIComponent(
    `Activar ${order.hash} · ${order.plan.name}`,
  )}&body=${encodeURIComponent(order.manifest)}`;
}

export default function AlphaForge() {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("legion");
  const [mode, setMode] = useState<ForgeMode>("text");
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [contact, setContact] = useState("");
  const [imageMeta, setImageMeta] = useState<{ name: string; size: number; url: string } | null>(
    null,
  );
  const [selectedCandidate, setSelectedCandidate] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(
    () => () => {
      if (imageMeta?.url) URL.revokeObjectURL(imageMeta.url);
    },
    [imageMeta?.url],
  );

  const selected = PLANS.find((plan) => plan.id === selectedPlan) ?? PLANS[0];
  const cleanPrompt = prompt.trim() || DEFAULT_PROMPT;
  const seed = `${selected.id}|${mode}|${cleanPrompt}|${imageMeta?.name ?? "no-image"}|${imageMeta?.size ?? 0}`;
  const candidates = useMemo(
    () =>
      Array.from({ length: selected.id === "legion" ? 10 : 4 }, (_, index) =>
        buildSymbol(cleanPrompt, index),
      ),
    [cleanPrompt, selected.id],
  );
  const hash = forgeHash(seed);
  const symbol = candidates[selectedCandidate] ?? candidates[0];
  const order = useMemo<ForgeOrder>(() => {
    const draft = {
      plan: selected,
      mode,
      prompt: cleanPrompt,
      contact: contact.trim() || "pendiente",
      imageName: imageMeta?.name,
      symbol,
      hash,
      manifest: "",
    };

    return { ...draft, manifest: buildManifest(draft) };
  }, [cleanPrompt, contact, hash, imageMeta?.name, mode, selected, symbol]);
  const checkoutUrl = createCheckoutUrl(order);
  const canActivate = contact.trim().length >= 5 && (mode === "text" || imageMeta != null);

  const copyManifest = async () => {
    await navigator.clipboard.writeText(order.manifest);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  const handleImage = (file?: File) => {
    if (!file) return;
    if (imageMeta?.url) URL.revokeObjectURL(imageMeta.url);
    setImageMeta({ name: file.name, size: file.size, url: URL.createObjectURL(file) });
    setMode("image");
  };

  return (
    <section id="forge" className="relative z-10 px-4 py-24">
      {/* Fondo de forja con video optimizado */}
      <OptimizedVideo
        src={forgeBg}
        wrapperClassName="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        className="h-full w-full object-cover opacity-28"
        overlayClassName="absolute inset-0 bg-gradient-to-b from-black/85 via-black/80 to-black/95"
      />

      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-blood-glow">
              // MÓDULO_02 · ALPHA.FORGE · ACCESS=PRODUCTION
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ash">
              checkout configurable · índice interno alpha.red · cero bloqueo visual
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
            proyectos. La forja ya genera candidatos reales, manifiesto, hash y enlace de activación
            listo para conectar a checkout externo desde Lovable.
          </p>
        </header>

        <div className="mb-12 grid gap-4 md:grid-cols-2">
          <ForgeMode
            active={mode === "text"}
            tag="MODE.TEXT → SIGIL"
            title="A partir de un prompt"
            onClick={() => setMode("text")}
            steps={[
              "Escribes qué quieres representar (legión, idea, rol, fractura).",
              "El núcleo local genera candidatos determinísticos sin latencia de servidor.",
              "Copias manifiesto o activas checkout con hash prellenado.",
            ]}
          />
          <ForgeMode
            active={mode === "image"}
            tag="MODE.IMAGE → SIGIL"
            title="A partir de una imagen"
            onClick={() => setMode("image")}
            steps={[
              "Subes un logo, dibujo o ícono simple (sin ruido).",
              "La forja incorpora nombre/tamaño al hash de pedido para trazabilidad.",
              "Recibes símbolo textual, manifiesto y enlace de activación.",
            ]}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="panel p-5 md:p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block font-mono text-xs uppercase tracking-[0.2em] text-ash">
                Prompt base
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  maxLength={220}
                  className="mt-2 min-h-28 w-full resize-y border border-border bg-black/50 p-3 text-sm normal-case tracking-normal text-bone outline-none transition-colors focus:border-blood-glow"
                  placeholder="Describe tu clan, causa, marca o rol simbólico..."
                />
              </label>

              <div className="font-mono text-xs uppercase tracking-[0.2em] text-ash">
                Imagen / contacto
                <label className="mt-2 flex min-h-28 cursor-pointer flex-col items-center justify-center border border-dashed border-border bg-black/50 p-3 text-center text-[11px] transition-colors hover:border-terminal">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="sr-only"
                    onChange={(event) => handleImage(event.target.files?.[0])}
                  />
                  {imageMeta ? (
                    <>
                      <img
                        src={imageMeta.url}
                        alt="Previsualización de imagen base"
                        className="mb-2 h-16 max-w-full object-contain"
                      />
                      <span className="text-terminal">{imageMeta.name}</span>
                      <span>{Math.ceil(imageMeta.size / 1024)} KB indexados</span>
                    </>
                  ) : (
                    <span>Arrastra desde Lovable o haz click para adjuntar imagen base</span>
                  )}
                </label>
                <input
                  value={contact}
                  onChange={(event) => setContact(event.target.value)}
                  className="mt-3 w-full border border-border bg-black/50 p-3 text-sm normal-case tracking-normal text-bone outline-none transition-colors focus:border-terminal"
                  placeholder="email, WhatsApp o usuario de entrega"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ash">
              <span>
                hash: <span className="text-terminal">{hash}</span>
              </span>
              <span>latencia: local · checkout: env configurable</span>
            </div>
          </div>

          <div className="panel p-5 md:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.26em] text-ash">
                // ELIGE TU CONFIGURACIÓN DE ATAQUE
              </div>
              <PlanSwitch selectedPlan={selectedPlan} onSelect={setSelectedPlan} />
            </div>

            <div className="rounded border border-border/70 bg-black/50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-bone">
                    {selected.name}
                  </h3>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">{selected.desc}</p>
                </div>
                <div className="text-right font-display text-3xl font-extrabold text-bone">
                  {selected.price}
                </div>
              </div>
              <p className="mt-3 font-mono text-[11px] text-terminal">
                Entrega: {selected.delivery}
              </p>
            </div>

            <ul className="mt-4 grid gap-2 font-mono text-sm text-bone">
              {selected.perks.map((perk) => (
                <li key={perk} className="flex items-start gap-2">
                  <span className="mt-0.5 text-blood-glow">▸</span>
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="panel p-5 md:p-6">
            <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-ash">
              <span>// candidatos.generados · selecciona salida</span>
              <span className="text-terminal">{candidates.length} activos</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {candidates.map((candidate, index) => (
                <button
                  key={`${candidate}-${index}`}
                  type="button"
                  onClick={() => setSelectedCandidate(index)}
                  className={`min-h-24 border p-3 text-left font-mono text-sm text-bone transition-colors ${
                    selectedCandidate === index
                      ? "border-blood-glow bg-blood/10"
                      : "border-border bg-black/40 hover:border-terminal"
                  }`}
                >
                  <span className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-ash">
                    SIGIL.{index + 1}
                  </span>
                  {candidate}
                </button>
              ))}
            </div>
          </div>

          <aside className="panel p-5 md:p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-ash">
              // manifiesto.final
            </div>
            <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap border border-border/70 bg-black/60 p-3 font-mono text-[11px] leading-relaxed text-terminal">
              {order.manifest}
            </pre>
            <div className="mt-4 grid gap-2">
              <button type="button" onClick={copyManifest} className="btn-ghost w-full">
                {copied ? "✓ MANIFIESTO COPIADO" : "⌘ COPIAR MANIFIESTO"}
              </button>
              <a
                className={`btn-blood w-full text-center ${!canActivate ? "pointer-events-none opacity-45" : ""}`}
                href={canActivate ? checkoutUrl : undefined}
                aria-disabled={!canActivate}
              >
                ⸸ Activar forja
              </a>
            </div>
            {!canActivate && (
              <p className="mt-3 font-mono text-[11px] text-ash">
                &gt; Añade contacto y, si eliges imagen, adjunta el archivo para activar el flujo de
                producción.
              </p>
            )}
            <p className="mt-4 border-l-2 border-blood/60 pl-3 font-mono text-[11px] italic text-ash">
              {selected.psychology}
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}

function PlanSwitch({
  selectedPlan,
  onSelect,
}: {
  selectedPlan: PlanId;
  onSelect: (plan: PlanId) => void;
}) {
  return (
    <div className="inline-flex overflow-hidden rounded-full border border-border bg-black/70 font-mono text-[10px] uppercase tracking-[0.22em]">
      <button
        type="button"
        onClick={() => onSelect("single")}
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
        onClick={() => onSelect("legion")}
        className={`px-3 py-1.5 transition-colors ${
          selectedPlan === "legion"
            ? "bg-terminal text-black"
            : "bg-transparent text-ash hover:text-bone"
        }`}
      >
        Legión Completa
      </button>
    </div>
  );
}

function ForgeMode({
  active,
  tag,
  title,
  steps,
  onClick,
}: {
  active: boolean;
  tag: string;
  title: string;
  steps: string[];
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`panel p-5 text-left transition-colors ${active ? "border-blood/70 bg-blood/10" : "hover:border-terminal"}`}
    >
      <div className="font-mono text-[10px] uppercase tracking-widest text-terminal">{tag}</div>
      <h4 className="mt-2 font-display text-xl font-bold uppercase tracking-tight">{title}</h4>
      <ol className="mt-4 space-y-2 font-mono text-sm text-muted-foreground">
        {steps.map((step, index) => (
          <li key={step} className="flex gap-3">
            <span className="text-blood-glow">0{index + 1}</span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </button>
  );
}
