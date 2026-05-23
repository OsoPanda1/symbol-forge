import { createHash } from "node:crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW ?? "60") * 1000;
const MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX ?? "30");

const buckets = new Map<string, { count: number; resetAt: number }>();

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const cfConnectingIp = request.headers.get("cf-connecting-ip")?.trim();
  return cfConnectingIp || forwarded || "unknown";
}

export function makeRateLimitKey(scope: string, request: Request): string {
  const ip = getClientIp(request);
  const ua = request.headers.get("user-agent") ?? "na";
  return `${scope}:${createHash("sha256").update(`${ip}|${ua}`).digest("hex")}`;
}

function assertRateLimitLocal(key: string): void {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }

  if (current.count >= MAX_REQUESTS) {
    throw new Error("RATE_LIMITED");
  }

  current.count += 1;
  buckets.set(key, current);
}

export async function assertRateLimit(key: string): Promise<void> {
  try {
    const { data, error } = await (supabaseAdmin as any).rpc("rl_take", {
      p_key: key,
      p_window_seconds: Math.max(1, Math.round(WINDOW_MS / 1000)),
      p_max: MAX_REQUESTS,
    });

    if (error) throw error;
    if (data === false) throw new Error("RATE_LIMITED");
  } catch {
    assertRateLimitLocal(key);
  }
}

export async function assertIpReputation(request: Request): Promise<void> {
  const ip = getClientIp(request);
  if (ip === "unknown") return;

  const { data, error } = await (supabaseAdmin as any)
    .from("ip_reputation")
    .select("status, expires_at")
    .eq("ip", ip)
    .maybeSingle();

  if (error || !data) return;
  const isExpired = data.expires_at ? new Date(data.expires_at).getTime() < Date.now() : false;
  if (isExpired) return;

  if (data.status === "block") throw new Error("IP_BLOCKED");
}

export function cleanTextInput(value: string): string {
  return value
    .split("")
    .map((ch) => {
      const code = ch.charCodeAt(0);
      if ((code >= 0 && code <= 31) || code === 127) return " ";
      return ch;
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeSvg(svg: string): string {
  return svg
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s(?:href|xlink:href)\s*=\s*("|')\s*javascript:[\s\S]*?\1/gi, "");
}

export async function getUserEmailFromRequest(request: Request | undefined): Promise<string | null> {
  if (!request) return null;
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice("Bearer ".length);
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return null;

  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data } = await supabase.auth.getClaims(token);
  const email = data?.claims?.email;
  return typeof email === "string" ? email : null;
}
