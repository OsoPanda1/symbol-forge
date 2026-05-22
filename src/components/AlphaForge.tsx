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

const INTRO_MESSAGE =
  "Bienvenido a la linea que divide a los usuarios de los elegidos, presiona enter para abrir las firewalls de la biomatrix";

async function requestMediaPermissions(): Promise<void> {
  if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) return;
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
  stream.getTracks().forEach((track) => track.stop());
}

function CinematicIntro({ onFinish }: { onFinish: () => void }) {
  const [typedText, setTypedText] = useState("");
  const [isTypingDone, setIsTypingDone] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setTypedText(INTRO_MESSAGE.slice(0, index));
      if (index >= INTRO_MESSAGE.length) {
        window.clearInterval(timer);
        setIsTypingDone(true);
      }
    }, 35);
    return () => window.clearInterval(timer);
  }, []);

  const handleEnter = async () => {
    if (isOpening) return;
    setPermissionError(null);
    setIsOpening(true);
    try {
      await requestMediaPermissions();
      setShowVideo(true);
    } catch {
      setPermissionError("No se concedieron permisos de audio/video. Puedes intentar nuevamente.");
      setIsOpening(false);
    }
  };

  return (
    <section className="fixed inset-0 z-50 grid place-items-center bg-black p-6">
      <div className="w-full max-w-4xl space-y-5 border border-red-900/50 bg-black/95 p-6 md:p-8">
        {!showVideo ? (
          <>
            <div className="font-mono text-base text-red-400 md:text-lg">
              {typedText}
              <span className="animate-pulse">▌</span>
            </div>
            {isTypingDone && (
              <div className="space-y-3">
                <p className="font-mono text-xs text-ash">Se solicitarán permisos de audio y video para abrir la transmisión.</p>
                <button
                  type="button"
                  onClick={handleEnter}
                  disabled={isOpening}
                  className="w-full border border-red-500 bg-red-700/80 px-6 py-3 font-mono text-sm font-bold uppercase tracking-[0.3em] text-bone shadow-[0_0_20px_rgba(255,0,50,0.45)] transition hover:bg-red-600 disabled:opacity-60"
                >
                  {isOpening ? "ABRIENDO..." : "ENTER"}
                </button>
                {permissionError && <p className="font-mono text-xs text-red-300">{permissionError}</p>}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <div className="aspect-video overflow-hidden border border-red-900/50 bg-black">
              <iframe
                title="La Biomatrix ha sido tomada"
                src="https://www.youtube.com/embed/aRgsTqreA_w?start=2&autoplay=1&rel=0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
            <button type="button" onClick={onFinish} className="btn-blood w-full">
              Continuar a la plataforma
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

const playSynthTone = (freq = 800, duration = 0.08) => {
  if (typeof window === "undefined") return;
  try {
    const AC = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
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

function SafeSigilRenderer({ content, isObfuscated = false }: { content: string; isObfuscated?: boolean }) {
  const sanitizedContent = useMemo(() => {
    let clean = content || "";
    clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    clean = clean.replace(/\son\w+\s*=\s*(["'][^"']*["']|[^\s>]+)/gi, "");
    clean = clean.replace(/href\s*=\s*["']\s*javascript:[^"']*["']/gi, 'href="#"');
    return clean;
  }, [content]);

  if (!sanitizedContent) return <div className="font-mono text-xs text-ash/50">SIN_SEÑAL</div>;

  return (
    <div className="relative h-full w-full">
      <div
        className={`h-full w-full [&>svg]:h-full [&>svg]:w-full ${isObfuscated ? "blur-[6px] opacity-35 pointer-events-none" : ""}`}
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
      {isObfuscated && <div className="absolute inset-0 grid place-items-center text-[9px] font-mono text-red-400">Muestra protegida</div>}
    </div>
  );
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
  const [isUnlocked, setIsUnlocked] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const selected = useMemo(() => PLANS.find((p) => p.id === selectedPlan)!, [selectedPlan]);
  const canForge = useMemo(
    () => prompt.trim().length >= 2 && contact.trim().length >= 3 && (mode === "text" || imageFile != null),
    [prompt, contact, mode, imageFile],
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
      // noop
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
    try {
      await navigator.clipboard.writeText(sigil.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setError("No fue posible copiar en el portapapeles.");
    }
  };

  const selectedSigil = useMemo(() => candidates.find((c) => c.id === selectedSigilId), [candidates, selectedSigilId]);

  if (!isUnlocked) return <CinematicIntro onFinish={() => setIsUnlocked(true)} />;

  return (
    <section id="forge" className="relative z-10 overflow-hidden px-4 py-24">
      <OptimizedVideo src={forgeBg} wrapperClassName="pointer-events-none absolute inset-0 -z-10 overflow-hidden" className="h-full w-full object-cover opacity-20" overlayClassName="absolute inset-0 bg-gradient-to-b from-black/85 via-black/80 to-black/95" />
      <div className="mx-auto max-w-6xl space-y-6">
        <header>
          <h2 className="font-display text-4xl text-bone uppercase">Forja de símbolos</h2>
          <p className="font-mono text-sm text-ash">Genera candidatos, selecciona uno y completa checkout para liberar el activo final.</p>
        </header>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="panel p-5 space-y-4">
            <div className="flex gap-2">
              <button className="btn-ghost" onClick={() => setMode("text")}>TEXT</button>
              <button className="btn-ghost" onClick={() => setMode("image")}>IMAGE</button>
            </div>
            <textarea value={prompt} onChange={(e)=>setPrompt(e.target.value)} className="w-full min-h-28 bg-black/60 border border-border p-3" />
            {mode === "image" && (
              <label className="block border border-dashed border-border p-3">
                <input ref={fileInputRef} type="file" className="sr-only" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={(e)=>handleImage(e.target.files?.[0])} />
                <span className="font-mono text-xs">Subir imagen base</span>
                {imagePreview && <img src={imagePreview} alt="preview" className="mt-2 h-20" />}
              </label>
            )}
            <input value={contact} onChange={(e)=>setContact(e.target.value)} placeholder="contacto" className="w-full bg-black/60 border border-border p-3" />
            <div className="font-mono text-xs text-ash">Hash: {hash ?? "—"}</div>
            <button onClick={onForge} disabled={!canForge || forging} className="btn-blood w-full">{forging ? "FORJANDO..." : "GENERAR"}</button>
            {error && <p className="text-red-400 text-xs font-mono">{error}</p>}
          </div>
          <div className="panel p-5 space-y-4">
            <div className="flex gap-2">
              {(["single", "legion"] as const).map((plan)=><button key={plan} onClick={()=>setSelectedPlan(plan)} className="btn-ghost">{plan}</button>)}
            </div>
            <h3 className="text-bone font-bold">{selected.name} · {selected.price}</h3>
            <p className="text-ash text-sm">{selected.desc}</p>
            <ul className="text-xs text-ash list-disc pl-4">{selected.perks.map((perk)=><li key={perk}>{perk}</li>)}</ul>
            <p className="text-terminal text-xs">{selected.delivery}</p>
          </div>
        </div>
        {candidates.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="panel p-5 grid gap-3 md:grid-cols-2">
              {candidates.map((c)=> (
                <button key={c.id} onClick={()=>onSelectSigil(c.id)} className="border border-border p-3 min-h-32">
                  <div className="text-xs font-mono mb-2">#{c.idx + 1}</div>
                  <div className="h-20"><SafeSigilRenderer content={c.content} isObfuscated={selectedSigilId !== c.id} /></div>
                </button>
              ))}
            </div>
            <div className="panel p-5 space-y-3">
              <div className="aspect-square border border-border p-4">{selectedSigil ? <SafeSigilRenderer content={selectedSigil.content} /> : <div className="text-xs text-ash">Selecciona un candidato</div>}</div>
              <button onClick={onCopy} className="btn-ghost w-full">{copied ? "Copiado" : "Copiar SVG"}</button>
              <button onClick={onCheckout} disabled={loading || !selectedSigil} className="btn-blood w-full">{loading ? "Procesando..." : `Pagar ${selected.price}`}</button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
