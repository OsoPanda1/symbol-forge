import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { STYLES } from "@/lib/aesthetics";

const INTENTS = ["memoria", "frontera", "legión", "sombra", "fuego", "nodo", "resistencia", "fractura", "umbral"];

function hashSeed(value: string) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function forgeHash(seed: string) {
  return `ALPHA-${hashSeed(seed).toString(16).toUpperCase().padStart(8, "0")}`;
}

// Deterministic + AI-augmented candidate generation.
// Falls back to deterministic Unicode transforms if AI is unavailable.
async function generateAICandidates(prompt: string, count: number): Promise<string[]> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) return [];

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: [
              "Eres The Alpha Red Hat, forjador de sigils para una leyenda urbana latinoamericana.",
              "Generas estandartes textuales únicos usando solo Unicode (Fraktur, runas, ocultismo, símbolos especiales como ⸸ ⛧ ⟁ ⟡ 𓂀 ᚱ).",
              "Cada sigil es una línea corta (máx 70 chars), con apertura/cierre simétrico y el prompt embebido transformado.",
              "Estilo: deep web, oscuro, intencional. Nada de emoji corporativo. Nada de explicaciones.",
            ].join(" "),
          },
          {
            role: "user",
            content: `Genera ${count} sigils distintos para el prompt: "${prompt}". Devuelve solo los sigils, uno por línea, sin numeración ni comentarios.`,
          },
        ],
        temperature: 0.95,
      }),
    });

    if (!res.ok) return [];
    const data = await res.json();
    const text: string = data.choices?.[0]?.message?.content ?? "";
    return text
      .split("\n")
      .map((l) => l.replace(/^[\s\d.\-•⸸*]+/, "").trim())
      .filter((l) => l.length > 3 && l.length < 140)
      .slice(0, count);
  } catch {
    return [];
  }
}

function deterministicCandidates(prompt: string, count: number): { content: string; styleId: string }[] {
  return Array.from({ length: count }, (_, i) => {
    const style = STYLES[(hashSeed(prompt + i) + i) % STYLES.length];
    const intent = INTENTS[(hashSeed(prompt + style.id) + i) % INTENTS.length];
    return {
      content: `⸸ ${style.transform(prompt)} ⟡ ${intent.toUpperCase()}-${i + 1} ⸸`,
      styleId: style.id,
    };
  });
}

async function buildCandidates(prompt: string, plan: "single" | "legion") {
  const total = plan === "legion" ? 10 : 4;
  const aiCount = Math.min(total, plan === "legion" ? 6 : 3);
  const deterministic = deterministicCandidates(prompt, total);

  const aiLines = await generateAICandidates(prompt, aiCount);
  const merged: { content: string; styleId: string }[] = [];

  for (let i = 0; i < total; i++) {
    if (i < aiLines.length) {
      merged.push({ content: aiLines[i], styleId: "ai-gemini" });
    } else {
      merged.push(deterministic[i]);
    }
  }
  return merged;
}

// ---------- TEXT FORGE ----------
export const forgeText = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        prompt: z.string().trim().min(2).max(220),
        contact: z.string().trim().min(3).max(200),
        plan: z.enum(["single", "legion"]),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const amount = data.plan === "legion" ? 15000 : 3000; // centavos MXN
    const hash = forgeHash(`${data.plan}|text|${data.prompt}|${Date.now()}`);

    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({
        plan: data.plan,
        amount_mxn: amount,
        mode: "text",
        prompt: data.prompt,
        contact: data.contact,
        hash,
      })
      .select()
      .single();

    if (orderErr || !order) throw new Error(orderErr?.message ?? "No se pudo crear la orden");

    const candidates = await buildCandidates(data.prompt, data.plan);

    const { data: sigils, error: sigilsErr } = await supabaseAdmin
      .from("sigils")
      .insert(
        candidates.map((c, i) => ({
          order_id: order.id,
          idx: i,
          content: c.content,
          style_id: c.styleId,
        })),
      )
      .select();

    if (sigilsErr) throw new Error(sigilsErr.message);

    return { orderId: order.id, hash, sigils: sigils ?? [] };
  });

// ---------- IMAGE FORGE ----------
// Image arrives as a base64 data URL. We validate, normalize, upload to storage, then generate candidates.
const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml"]);
const MAX_BYTES = 4 * 1024 * 1024; // 4 MB

function parseDataUrl(dataUrl: string): { mime: string; bytes: Uint8Array } {
  const m = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!m) throw new Error("Imagen inválida (esperaba data URL base64)");
  const mime = m[1].toLowerCase();
  if (!ALLOWED_MIME.has(mime)) throw new Error(`Formato no permitido: ${mime}`);
  const buf = Buffer.from(m[2], "base64");
  if (buf.byteLength > MAX_BYTES) throw new Error("La imagen supera 4 MB");
  return { mime, bytes: new Uint8Array(buf) };
}

export const forgeImage = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        prompt: z.string().trim().min(2).max(220),
        contact: z.string().trim().min(3).max(200),
        plan: z.enum(["single", "legion"]),
        imageDataUrl: z.string().min(32),
        imageName: z.string().max(200).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { mime, bytes } = parseDataUrl(data.imageDataUrl);
    const ext = mime.split("/")[1].replace("+xml", "");
    const amount = data.plan === "legion" ? 15000 : 3000;
    const hash = forgeHash(`${data.plan}|image|${data.prompt}|${Date.now()}`);

    // upload to private bucket
    const path = `${hash.toLowerCase()}/${Date.now()}.${ext}`;
    const { error: upErr } = await supabaseAdmin.storage
      .from("forge-uploads")
      .upload(path, bytes, { contentType: mime, upsert: false });
    if (upErr) throw new Error(`No se pudo subir la imagen: ${upErr.message}`);

    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({
        plan: data.plan,
        amount_mxn: amount,
        mode: "image",
        prompt: data.prompt,
        contact: data.contact,
        hash,
        image_path: path,
      })
      .select()
      .