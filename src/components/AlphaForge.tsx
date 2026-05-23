"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { forgeText, forgeImage, selectSigil, getOrderStatus } from "@/lib/forge.functions";
import { renderSymbolAccess } from "@/lib/symbol.functions";
import { createCheckoutSession } from "@/lib/stripe.functions";
import OptimizedVideo from "@/components/OptimizedVideo";
import forgeBg from "@/assets/100993-657759886_medium.mp4";
import coreBg from "@/assets/22449-327996264_medium.mp4";

type PlanId = "single" | "legion";
type ForgeMode = "text" | "image";

type SigilCandidate = {
  id: string;
  idx: number;
  content: string;
  style_id: string | null;
  released?: boolean;
};

const PLANS = [
  {
    id: "single" as const,
    name: "Forja individual",
    price: "$30 MXN",
    desc: "Un símbolo final con validación y entrega inmediata.",
    perks: ["4 candidatos", "1 sigilo final", "Hash de orden", "Checkout seguro"],
    delivery: "1 sigilo desbloqueado",
  },
  {
    id: "legion" as const,
    name: "Protocolo legión",
    price: "$150 MXN",
    desc: "Lote de 10 firmas para branding de proyecto, equipo o comunidad.",
    perks: ["10 candidatos", "Hash por orden", "Entrega automática", "Historial en consola"],
    delivery: "10 firmas + manifiesto",
  },
];

const DEFAULT_PROMPT = "legión jaguar de frontera";

const playSynthTone = (freq = 800, duration = 0.08) => {
  if (typeof window === "undefined") return;
  try {
    const AC =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // noop
  }
};

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("No se pudo procesar la imagen."));
    reader.readAsDataURL(file);
  });
}

function SigilGlyph({ content }: { content: string }) {
  // Sigils are Unicode strings, not raw SVG. Render as styled mono text.
  if (!content) return <span className="font-mono text-xs text-ash/50">SIN_SEÑAL</span>;
  return (
    <div className="flex h-full w-full items-center justify-center p-2 text-center">
      <span
        className="break-all font-mono text-lg leading-snug text-bone md:text-xl"
        style={{
          textShadow:
            "0 0 10px oklch(0.7 0.3 25 / 0.6), 0 0 24px oklch(0.78 0.2 150 / 0.25)",
          letterSpacing: "0.02em",
        }}
      >
        {content}
      </span>
    </div>
  );
}

function ModePill({
  active,
  label,
  hint,
  onClick,
}: {
  active: boolean;
  label: string;
  hint: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative flex-1 overflow-hidden border px-4 py-3 text-left transition-all ${
        active
          ? "border-blood bg-blood/10 text-bone"
          : "border-border bg-black/40 text-ash hover:border-blood/50"
      }`}
    >
      {active && <span className="absolute inset-y-0 left-0 w-[3px] bg-blood shadow-[0_0_12px_var(--blood-glow)]" />}
      <div className="font-mono text-[10px] uppercase tracking-[0.28em]">{label}</div>
      <div className="mt-1 font-mono text-[10px] text-ash/80">{hint}</div>
    </button>
  );
}

function PlanSwitch({
  value,
  onChange,
}: {
  value: PlanId;
  onChange: (id: PlanId) => void;
}) {
  return (
    <div className="relative grid grid-cols-2 overflow-hidden border border-border bg-black/50">
      <span
        className="pointer-events-none absolute inset-y-0 w-1/2 bg-gradient-to-r from-blood/30 to-blood/5 transition-transform duration-300"
        style={{ transform: value === "legion" ? "translateX(100%)" : "translateX(0%)" }}
      />
      {PLANS.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onChange(p.id)}
          className={`relative z-10 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.22em] transition-colors ${
            value === p.id ? "text-bone" : "text-ash hover:text-bone"
          }`}
        >
          {p.id === "legion" ? "LEGIÓN · $150" : "INDIVIDUAL · $30"}
        </button>
      ))}
    </div>
  );
}

function Embers({ count = 22 }: { count?: number }) {
  const embers = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: `${(i * 97) % 100}%`,
        dx: `${((i * 53) % 80) - 40}px`,
        delay: `${(i * 0.37) % 6}s`,
        duration: `${5 + ((i * 1.3) % 6)}s`,
        size: 2 + ((i * 7) % 4),
      })),
    [count],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {embers.map((e, i) => (
        <span
          key={i}
          className="ember"
          style={{
            left: e.left,
            bottom: "-20px",
            width: `${e.size}px`,
            height: `${e.size}px`,
            animationDelay: e.delay,
            animationDuration: e.duration,
            // @ts-expect-error custom prop
            "--dx": e.dx,
          }}
        />
      ))}
    </div>
  );
}

export default function AlphaForge() {
  const forgeTextFn = useServerFn(forgeText);
  const forgeImageFn = useServerFn(forgeImage);
  const selectSigilFn = useServerFn(selectSigil);
  const getOrderStatusFn = useServerFn(getOrderStatus);
  const checkoutFn = useServerFn(createCheckoutSession);
  const renderSymbolAccessFn = useServerFn(renderSymbolAccess);

  const [selectedPlan, setSelectedPlan] = useState<PlanId>("legion");
  const [mode, setMode] = useState<ForgeMode>("text");
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [contact, setContact] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forging, setForging] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [hash, setHash] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<SigilCandidate[]>([]);
  const [selectedSigilId, setSelectedSigilId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [symbolAccess, setSymbolAccess] = useState<{ status: "locked" | "unlocked"; puaHex?: string } | null>(null);
  const [orderStatus, setOrderStatus] = useState<string>("pending");
  const [statusLoading, setStatusLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  // Poll order status (handles the post-checkout return)
  useEffect(() => {
    if (!orderId) return;
    let stop = false;
    const tick = async () => {
      if (stop) return;
      try {
        setStatusLoading(true);
        const r = await getOrderStatusFn({ data: { orderId } });
        if (r) {
          setOrderStatus(r.order.status);
          if (r.order.selected_sigil_id) setSelectedSigilId(r.order.selected_sigil_id);
          if (r.sigils?.length) setCandidates(r.sigils as SigilCandidate[]);
        }
      } catch {
        /* ignore */
      } finally {
        setStatusLoading(false);
      }
    };
    tick();
    const id = setInterval(tick, 7000);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, [orderId, getOrderStatusFn]);

  const selected = useMemo(() => PLANS.find((p) => p.id === selectedPlan)!, [selectedPlan]);
  const canForge = useMemo(
    () => prompt.trim().length >= 2 && contact.trim().length >= 3 && (mode === "text" || imageFile != null),
    [prompt, contact, mode, imageFile],
  );
  const isPaid = orderStatus === "paid";
  const selectedSigil = useMemo(
    () => candidates.find((c) => c.id === selectedSigilId),
    [candidates, selectedSigilId],
  );

  const handleImage = (file?: File) => {
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      setError("La imagen supera 4 MB. Redúcela e intenta de nuevo.");
      return;
    }
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setMode("image");
    setError(null);
    playSynthTone(900);
  };

  const onForge = async () => {
    setError(null);
    setForging(true);
    setCandidates([]);
    setSelectedSigilId(null);
    setOrderStatus("pending");
    try {
      const result =
        mode === "image" && imageFile
          ? await forgeImageFn({
              data: {
                prompt: prompt.trim(),
                contact: contact.trim(),
                plan: selectedPlan,
                imageDataUrl: await fileToDataUrl(imageFile),
                imageName: imageFile.name,
              },
            })
          : await forgeTextFn({ data: { prompt: prompt.trim(), contact: contact.trim(), plan: selectedPlan } });

      const sigils = result.sigils as SigilCandidate[];
      setOrderId(result.orderId);
      setHash(result.hash);
      setCandidates(sigils);
      if (sigils.length > 0) setSelectedSigilId(sigils[0].id);
      playSynthTone(1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al forjar.");
    } finally {
      setForging(false);
    }
  };

  const onSelectSigil = async (sigilId: string) => {
    setSelectedSigilId(sigilId);
    playSynthTone(750);
    if (!orderId) return;
    try {
      await selectSigilFn({ data: { orderId, sigilId } });
    } catch {
      /* noop */
    }
  };

  const onCheckout = async () => {
    if (!orderId || !selectedSigilId) return;
    setLoading(true);
    setError(null);
    try {
      // ensure server has the selection
      await selectSigilFn({ data: { orderId, sigilId: selectedSigilId } });
      const { url } = await checkoutFn({ data: { orderId } });
      if (url) window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al abrir checkout");
    } finally {
      setLoading(false);
    }
  };

  const onCopy = async () => {
    if (!selectedSigil || !isPaid) return;
    try {
      const access = await renderSymbolAccessFn({ data: { sigilId: selectedSigil.id } });
      setSymbolAccess(access);
      if (access.status !== "unlocked") {
        setError("Este símbolo está bloqueado para tu identidad. Inicia sesión con el contacto de compra.");
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("No se pudo renderizar el asset.");

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#f6f6f6";
      ctx.font = "600 76px JetBrains Mono, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(selectedSigil.content, canvas.width / 2, canvas.height / 2, canvas.width - 120);

      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `sigil-${selectedSigil.idx + 1}.png`;
      link.click();
      setCopied(true);
      playSynthTone(1500);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setError("No fue posible exportar el asset.");
    }
  };

  return (
    <section id="forge" className="relative z-10 overflow-hidden px-4 py-24">
      {/* Ambient deep-web background */}
      <OptimizedVideo
        src={forgeBg}
        wrapperClassName="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        className="h-full w-full object-cover opacity-20"
        overlayClassName="absolute inset-0 bg-gradient-to-b from-black/85 via-black/80 to-black/95"
      />
      <Embers count={28} />

      <div className="mx-auto max-w-6xl space-y-8">
        {/* HEADER */}
        <header className="relative">
          <div className="mb-3 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.28em] text-blood-glow">
            <span className="inline-block size-1.5 animate-pulse rounded-full bg-blood shadow-[0_0_10px_var(--blood-glow)]" />
            module_02 · alpha.forge · ceremonial pipeline
            <span className="h-[1px] flex-1 bg-blood/30" />
            <span className="text-ash">channel://anubis</span>
          </div>
          <h2
            className="glitch font-display text-4xl uppercase leading-tight md:text-6xl"
            data-text="Forja de Símbolos Soberanos"
          >
            Forja de Símbolos Soberanos
          </h2>
          <p className="mt-3 max-w-3xl font-mono text-sm text-ash">
            Invoca, selecciona y libera. Cada sigilo se sella con un hash único y se desbloquea al
            confirmar el pago. La forja no produce decoración — produce identidad.
          </p>
        </header>

        {/* INPUT + PLAN */}
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* INPUT PANEL */}
          <div className="panel sheen relative overflow-hidden p-6">
            <div className="scan-bar" />
            <div className="mb-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.28em] text-ash">
              <span>// payload</span>
              <span className="text-terminal">hash: {hash ?? "—"}</span>
            </div>

            {/* MODE SELECTOR */}
            <div className="mb-4 flex gap-3">
              <ModePill
                active={mode === "text"}
                label="modo texto"
                hint="intención · concepto · arquetipo"
                onClick={() => setMode("text")}
              />
              <ModePill
                active={mode === "image"}
                label="modo imagen"
                hint="referencia visual · sello base"
                onClick={() => setMode("image")}
              />
            </div>

            {/* PROMPT */}
            <label className="mb-3 block">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.22em] text-ash">
                prompt simbólico
              </span>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                className="w-full resize-none border border-border bg-black/70 p-3 font-mono text-sm text-bone outline-none transition focus:border-blood focus:shadow-[0_0_18px_oklch(0.58_0.28_25/0.35)]"
                placeholder="legión jaguar de frontera..."
              />
            </label>

            {/* IMAGE UPLOAD */}
            {mode === "image" && (
              <label className="mb-3 flex cursor-pointer items-center gap-3 border border-dashed border-blood/40 bg-black/40 p-3 transition hover:border-blood">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="sr-only"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={(e) => handleImage(e.target.files?.[0])}
                />
                {imagePreview ? (
                  <img src={imagePreview} alt="ref" className="h-16 w-16 border border-border object-cover" />
                ) : (
                  <span className="grid h-16 w-16 place-items-center border border-border font-mono text-2xl text-blood">
                    ⌁
                  </span>
                )}
                <div className="flex-1 font-mono text-[10px] uppercase tracking-[0.22em] text-ash">
                  {imageFile ? imageFile.name : "subir referencia base · máx 4mb"}
                </div>
              </label>
            )}

            {/* CONTACT */}
            <label className="mb-3 block">
              <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.22em] text-ash">
                canal de contacto · entrega
              </span>
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="email · handle · canal de retorno"
                className="w-full border border-border bg-black/70 p-3 font-mono text-sm text-bone outline-none transition focus:border-terminal focus:shadow-[0_0_18px_oklch(0.78_0.2_150/0.3)]"
              />
            </label>

            {/* PLAN SWITCH */}
            <div className="mb-4">
              <PlanSwitch value={selectedPlan} onChange={setSelectedPlan} />
            </div>

            <button
              onClick={onForge}
              disabled={!canForge || forging}
              className="btn-blood blood-pulse w-full"
            >
              {forging ? "⌁ FORJANDO SIGILOS..." : `⸸ INVOCAR ${selectedPlan === "legion" ? "LEGIÓN" : "SIGILO"}`}
            </button>
            {error && <p className="mt-3 font-mono text-xs text-blood-glow">{error}</p>}
          </div>

          {/* CORE / PLAN INFO */}
          <div className="panel relative overflow-hidden p-6">
            <OptimizedVideo
              src={coreBg}
              wrapperClassName="pointer-events-none absolute inset-0 overflow-hidden"
              className="h-full w-full object-cover opacity-25"
              overlayClassName="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/85"
            />
            <div className="relative">
              <div className="mb-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.28em] text-terminal">
                <span>// núcleo</span>
                <span>{selected.price}</span>
              </div>

              {/* Pulsing core */}
              <div className="relative mx-auto mb-6 grid h-40 w-40 place-items-center">
                <div className="forge-core absolute inset-0 rounded-full border border-blood/60 bg-black/60" />
                <div className="forge-ring" style={{ animationDelay: "0s" }} />
                <div className="forge-ring" style={{ animationDelay: "1.1s" }} />
                <div className="forge-ring" style={{ animationDelay: "2.2s" }} />
                <span className="relative z-10 font-display text-3xl text-blood-glow">⸸</span>
              </div>

              <h3 className="font-display text-2xl uppercase text-bone">{selected.name}</h3>
              <p className="mt-1 font-mono text-xs text-ash">{selected.desc}</p>
              <ul className="mt-4 grid grid-cols-2 gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-ash">
                {selected.perks.map((perk) => (
                  <li key={perk} className="flex items-center gap-2">
                    <span className="text-blood">▸</span>
                    {perk}
                  </li>
                ))}
              </ul>
              <div className="mt-4 border-t border-border/60 pt-3 font-mono text-[10px] uppercase tracking-[0.22em] text-terminal">
                entrega · {selected.delivery}
              </div>
            </div>
          </div>
        </div>

        {/* CANDIDATES */}
        {candidates.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="panel sheen relative overflow-hidden p-5">
              <div className="mb-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.28em] text-ash">
                <span>// candidatos forjados</span>
                <span className="flex items-center gap-2 text-terminal">
                  <span
                    className={`inline-block size-1.5 rounded-full ${
                      isPaid
                        ? "bg-acid shadow-[0_0_10px_var(--acid)]"
                        : "bg-blood animate-pulse shadow-[0_0_10px_var(--blood)]"
                    }`}
                  />
                  status: {statusLoading ? "..." : orderStatus.toUpperCase()}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {candidates.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onSelectSigil(c.id)}
                    data-selected={selectedSigilId === c.id}
                    className="candidate-card group flex min-h-36 flex-col border border-border bg-black/70 p-3 text-left"
                  >
                    <div className="mb-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.22em] text-ash">
                      <span>sigil_{String(c.idx + 1).padStart(2, "0")}</span>
                      <span className="text-terminal">{c.style_id ?? "—"}</span>
                    </div>
                    <div className="flex-1 grid place-items-center overflow-hidden">
                      <SigilGlyph content={c.content} />
                    </div>
                    {selectedSigilId === c.id && (
                      <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.28em] text-blood-glow">
                        ▶ seleccionado
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* FINAL SIGIL */}
            <div className="panel relative overflow-hidden p-5">
              <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.28em] text-ash">
                // sigilo final
              </div>
              <div className="relative grid aspect-square place-items-center overflow-hidden border border-blood/40 bg-black/80">
                {!isPaid && (
                  <div className="pointer-events-none absolute inset-0 z-10 bg-[repeating-linear-gradient(45deg,transparent_0_8px,oklch(0_0_0/0.55)_8px_10px)]" />
                )}
                <div className="absolute inset-0 opacity-50">
                  <Embers count={10} />
                </div>
                <div className="relative z-0 h-full w-full">
                  {selectedSigil ? (
                    <SigilGlyph content={selectedSigil.content} />
                  ) : (
                    <div className="grid h-full place-items-center font-mono text-[10px] uppercase tracking-[0.28em] text-ash">
                      selecciona un candidato
                    </div>
                  )}
                </div>
                {!isPaid && selectedSigil && (
                  <div className="absolute bottom-2 left-2 right-2 z-20 border border-blood/60 bg-black/85 px-2 py-1 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-blood-glow">
                    ⸸ desbloqueo tras pago
                  </div>
                )}
              </div>

              <button
                onClick={onCopy}
                disabled={!selectedSigil || !isPaid}
                className="btn-ghost mt-3 w-full"
                title={isPaid ? "Copiar al portapapeles" : "Disponible tras pago"}
              >
                {copied ? "✓ asset descargado" : isPaid ? "descargar asset (png)" : "🔒 descarga bloqueada"}
              </button>
              {symbolAccess?.status === "unlocked" && symbolAccess.puaHex ? (
                <div className="mt-2 font-mono text-[9px] uppercase tracking-[0.2em] text-terminal">
                  pua unlock · U+{symbolAccess.puaHex.toUpperCase()}
                </div>
              ) : null}
              <button
                onClick={onCheckout}
                disabled={loading || !selectedSigil || isPaid}
                className="btn-blood mt-2 w-full"
              >
                {isPaid
                  ? "✓ orden pagada · liberado"
                  : loading
                  ? "abriendo checkout..."
                  : `pagar ${selected.price} ⟶ stripe`}
              </button>
              <div className="mt-3 font-mono text-[9px] uppercase tracking-[0.22em] text-ash/70">
                order_id · {orderId ? `${orderId.slice(0, 8)}…${orderId.slice(-4)}` : "—"}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
