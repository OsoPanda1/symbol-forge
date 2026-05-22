"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { forgeText, forgeImage, selectSigil } from "@/lib/forge.functions";
import { createCheckoutSession } from "@/lib/stripe.functions";
import OptimizedVideo from "@/components/OptimizedVideo";
import forgeBg from "@/assets/100993-657759886_medium.mp4";

type PlanId = "single" | "legion";
type ForgeMode = "text" | "image";

type SigilCandidate = {
  id: string;
  idx: number;
  content: string;
  style_id: string | null;
};

const PLANS = [
  {
    id: "single" as const,
    name: "Forja Individual",
    price: "$30 MXN",
    desc: "Un símbolo para marcar territorio en un internet que nunca pensó en ti.",
    perks: [
      "4 candidatos generados por IA",
      "Eliges 1 sigil final + sello copiable",
      "Hash único en el índice Alpha",
      "Liberación instantánea tras pago",
    ],
    delivery: "1 sigil validado · entrega inmediata",
  },
  {
    id: "legion" as const,
    name: "Paquete de Legión",
    price: "$150 MXN",
    desc: "10 símbolos. Suficiente para nombrar a una orden, un clan y sus sub‑nodos.",
    perks: [
      "10 sigils generados por IA + variaciones determinísticas",
      "Manifiesto digital firmado",
      "Hashes individuales por símbolo",
      "Acceso a lista ALPHA+",
    ],
    delivery: "10 variantes + manifiesto de legión",
  },
];

const DEFAULT_PROMPT = "legión jaguar de frontera";

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AlphaForge() {
  const forgeTextFn = useServerFn(forgeText);
  const forgeImageFn = useServerFn(forgeImage);
  const selectSigilFn = useServerFn(selectSigil);
  const checkoutFn = useServerFn(createCheckoutSession);

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const selected = PLANS.find((p) => p.id === selectedPlan)!;
  const canForge =
    prompt.trim().length >= 2 &&
    contact.trim().length >= 3 &&
    (mode === "text" || imageFile != null);

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
  };

  const onForge = async () => {
    setError(null);
    setForging(true);
    setCandidates([]);
    setSelectedSigilId(null);
    try {
      let result;
      if (mode === "image" && imageFile) {
        const dataUrl = await fileToDataUrl(imageFile);
        result = await forgeImageFn({
          data: {
            prompt: prompt.trim(),
            contact: contact.trim(),
            plan: selectedPlan,
            imageDataUrl: dataUrl,
            imageName: imageFile.name,
          },
        });
      } else {
        result = await forgeTextFn({
          data: { prompt: prompt.trim(), contact: contact.trim(), plan: selectedPlan },
        });
      }
      setOrderId(result.orderId);
      setHash(result.hash);
      setCandidates(result.sigils as SigilCandidate[]);
      if (result.sigils.length) setSelectedSigilId((result.sigils[0] as SigilCandidate).id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al forjar");
    } finally {
      setForging(false);
    }
  };

  const onSelectSigil = async (sigilId: string) => {
    setSelectedSigilId(sigilId);
    if (!orderId) return;
    try {
      await selectSigilFn({ data: { orderId, sigilId } });
    } catch {
      /* silent */
    }
  };

  const onCheckout = async () => {
    if (!orderId) return;
    setLoading(true);
    setError(null);
    try {
      const { url } = await checkoutFn({ data: { orderId } });
      if (url) window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al abrir checkout");
    } finally {
      setLoading(false);
    }
  };

  const onCopy = async () => {
    const sigil = candidates.find((c) => c.id === selectedSigilId);
    if (!sigil) return;
    await navigator.clipboard.writeText(sigil.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const selectedSigil = useMemo(
    () => candidates.find((c) => c.id === selectedSigilId),
    [candidates, selectedSigilId],
  );

  return (
    <section id="forge" className="relative z-10 overflow-hidden px-4 py-24">
      <OptimizedVideo
        src={forgeBg}
        wrapperClassName="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        className="h-full w-full object-cover opacity-30"
        overlayClassName="absolute inset-0 bg-gradient-to-b from-black/85 via-black/80 to-black/95"
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-[radial-gradient(ellipse_at_top,_rgba(255,0,60,0.18)_0,_transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(transparent_95%,rgba(255,0,60,0.06)_95%)] bg-[length:100%_4px]" />

      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-blood-glow">
              // MÓDULO_02 · ALPHA.FORGE · ACCESS=PRODUCTION
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-ash">
              IA + Stripe · liberación tras pago verificado
            </div>
          </div>
          <h2
            className="glitch mt-4 font-display text-3xl font-bold uppercase tracking-tight md:text-5xl"
            data-text="Forja tu símbolo de resistencia"
          >
            Forja tu símbolo de resistencia
          </h2>
          <p className="mt-4 max-w-2xl font-mono text-sm text-muted-foreground md:text-base">
            Describe una idea o sube una imagen base. La forja genera{" "}
            <span className="text-bone">candidatos únicos con IA</span>, los guarda con tu hash, y
            tras pagar por Stripe se liberan los sigils finales para ti.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          {/* LEFT: input */}
          <div className="panel relative overflow-hidden p-5 md:p-6">
            <div className="absolute -top-px left-1/2 h-px w-1/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-blood-glow to-transparent" />

            <div className="mb-4 flex gap-2">
              <ModePill active={mode === "text"} onClick={() => setMode("text")} label="TEXT → SIGIL" />
              <ModePill
                active={mode === "image"}
                onClick={() => setMode("image")}
                label="IMAGE → SIGIL"
              />
            </div>

            <label className="block font-mono text-[10px] uppercase tracking-[0.22em] text-ash">
              Prompt base
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                maxLength={220}
                placeholder="Describe tu clan, causa, marca o rol simbólico..."
                className="mt-2 min-h-28 w-full resize-y border border-border bg-black/60 p-3 text-sm normal-case tracking-normal text-bone outline-none transition-colors focus:border-blood-glow"
              />
            </label>

            {mode === "image" && (
              <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-ash">
                Imagen base (PNG/JPG/WebP/SVG · máx 4 MB)
                <label className="mt-2 flex min-h-28 cursor-pointer flex-col items-center justify-center border border-dashed border-border bg-black/60 p-3 text-center text-[11px] transition-colors hover:border-terminal">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="sr-only"
                    onChange={(e) => handleImage(e.target.files?.[0])}
                  />
                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt="preview"
                        className="mb-2 h-20 max-w-full object-contain"
                      />
                      <span className="text-terminal">{imageFile?.name}</span>
                      <span>{Math.ceil((imageFile?.size ?? 0) / 1024)} KB · listo</span>
                    </>
                  ) : (
                    <span>Arrastra o haz click para adjuntar tu imagen base</span>
                  )}
                </label>
              </div>
            )}

            <label className="mt-4 block font-mono text-[10px] uppercase tracking-[0.22em] text-ash">
              Contacto (email / WhatsApp / handle)
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                maxLength={200}
                className="mt-2 w-full border border-border bg-black/60 p-3 text-sm normal-case tracking-normal text-bone outline-none transition-colors focus:border-terminal"
                placeholder="anubis@tamv.network"
              />
            </label>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-ash">
              <span>
                hash: <span className="text-terminal">{hash ?? "—"}</span>
              </span>
              <span>motor: lovable AI · stripe</span>
            </div>

            <button
              onClick={onForge}
              disabled={!canForge || forging}
              className="btn-blood mt-5 w-full disabled:opacity-40"
            >
              {forging ? "▮▯▮▯ FORJANDO CANDIDATOS..." : "⸸ GENERAR CANDIDATOS"}
            </button>
            {error && (
              <p className="mt-3 border-l-2 border-blood pl-3 font-mono text-[11px] text-blood-glow">
                {error}
              </p>
            )}
          </div>

          {/* RIGHT: plan */}
          <div className="panel relative p-5 md:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="font-mono text-[10px] uppercase tracking-[0.26em] text-ash">
                // ELIGE TU CONFIGURACIÓN DE ATAQUE
              </div>
              <PlanSwitch selectedPlan={selectedPlan} onSelect={setSelectedPlan} />
            </div>

            <div className="relative overflow-hidden rounded border border-border/70 bg-black/60 p-4">
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_rgba(255,0,60,0.18),_transparent_60%)]" />
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
              <p className="mt-3 font-mono text-[11px] text-terminal">{selected.delivery}</p>
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

        {/* CANDIDATES */}
        {candidates.length > 0 && (
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="panel p-5 md:p-6">
              <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-ash">
                <span>// candidatos.forjados · selecciona tu salida</span>
                <span className="text-terminal">{candidates.length} activos</span>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {candidates.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onSelectSigil(c.id)}
                    className={`group relative min-h-24 overflow-hidden border p-3 text-left font-mono text-sm text-bone transition-all ${
                      selectedSigilId === c.id