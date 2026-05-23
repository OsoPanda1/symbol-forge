import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { STYLES } from "@/lib/aesthetics";
import { assertRateLimit, cleanTextInput, makeRateLimitKey, sanitizeSvg } from "@/lib/security";
import { getRequest } from "@tanstack/react-start/server";
import { fraudScore } from "@/lib/antifraud";
import { logEvent, incrementMetric } from "@/lib/observability";

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
    const request = getRequest();
    if (request) assertRateLimit(makeRateLimitKey("forge-text", request));
    const prompt = cleanTextInput(data.prompt);
    const contact = cleanTextInput(data.contact);
    const risk = fraudScore({
      email: contact,
      amountMxn: data.plan === "legion" ? 150000 : 30000,
      prompt,
      ip: request ? (request.headers.get("x-forwarded-for") ?? "unknown") : "unknown",
      userAgent: request?.headers.get("user-agent") ?? "unknown",
      recentAttempts: 0,
    });
    if (risk.blocked) {
      await incrementMetric("abuse.blocked", 1, { flow: "forge-text" });
      await logEvent("warn", "forge_text_blocked", { reasons: risk.reasons, score: risk.score });
      throw new Error("Solicitud bloqueada por controles antiabuso");
    }
    const amount = data.plan === "legion" ? 15000 : 3000; // centavos MXN
    const hash = forgeHash(`${data.plan}|text|${prompt}|${Date.now()}`);

    const { data: order, error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({
        plan: data.plan,
        amount_mxn: amount,
        mode: "text",
        prompt,
        contact,
        hash,
      })
      .select()
      .single();

    if (orderErr || !order) throw new Error(orderErr?.message ?? "No se pudo crear la orden");

    const candidates = await buildCandidates(prompt, data.plan);

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
  if (mime === "image/svg+xml") {
    const sanitized = sanitizeSvg(buf.toString("utf8"));
    return { mime, bytes: new TextEncoder().encode(sanitized) };
  }
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
    const request = getRequest();
    if (request) assertRateLimit(makeRateLimitKey("forge-image", request));
    const prompt = cleanTextInput(data.prompt);
    const contact = cleanTextInput(data.contact);
    const risk = fraudScore({
      email: contact,
      amountMxn: data.plan === "legion" ? 150000 : 30000,
      prompt,
      ip: request ? (request.headers.get("x-forwarded-for") ?? "unknown") : "unknown",
      userAgent: request?.headers.get("user-agent") ?? "unknown",
      recentAttempts: 0,
    });
    if (risk.blocked) {
      await incrementMetric("abuse.blocked", 1, { flow: "forge-text" });
      await logEvent("warn", "forge_text_blocked", { reasons: risk.reasons, score: risk.score });
      throw new Error("Solicitud bloqueada por controles antiabuso");
    }
    const { mime, bytes } = parseDataUrl(data.imageDataUrl);
    const ext = mime.split("/")[1].replace("+xml", "");
    const amount = data.plan === "legion" ? 15000 : 3000;
    const hash = forgeHash(`${data.plan}|image|${prompt}|${Date.now()}`);

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
        prompt,
        contact,
        hash,
        image_path: path,
      })
      .select()
      .single();

    if (orderErr || !order) throw new Error(orderErr?.message ?? "No se pudo crear la orden");

    const candidates = await buildCandidates(prompt, data.plan);

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

// ---------- SELECT SIGIL ----------
export const selectSigil = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ orderId: z.string().uuid(), sigilId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    const request = getRequest();
    if (request) assertRateLimit(makeRateLimitKey("select-sigil", request));
    const { error } = await supabaseAdmin
      .from("orders")
      .update({ selected_sigil_id: data.sigilId })
      .eq("id", data.orderId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- GET ORDER STATUS ----------
export const getOrderStatus = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ orderId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const request = getRequest();
    if (request) assertRateLimit(makeRateLimitKey("order-status", request));
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("id, status, selected_sigil_id, plan, hash")
      .eq("id", data.orderId)
      .single();
    if (!order) return null;
    const { data: sigils } = await supabaseAdmin
      .from("sigils")
      .select("id, idx, content, style_id, released")
      .eq("order_id", data.orderId)
      .order("idx");
    return { order, sigils: sigils ?? [] };
  });
