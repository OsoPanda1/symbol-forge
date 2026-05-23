import { createHash } from "node:crypto";

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

export function assertRateLimit(key: string): void {
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

export function cleanTextInput(value: string): string {
  return value
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeSvg(svg: string): string {
  return svg
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s(?:href|xlink:href)\s*=\s*("|')\s*javascript:[\s\S]*?\1/gi, "");
}
