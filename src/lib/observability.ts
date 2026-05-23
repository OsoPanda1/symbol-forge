import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type LogLevel = "debug" | "info" | "warn" | "error";

export async function logEvent(level: LogLevel, event: string, payload: Record<string, unknown> = {}) {
  const record = {
    level,
    event,
    payload,
    created_at: new Date().toISOString(),
  };

  const { error } = await (supabaseAdmin as any).from("app_logs").insert(record);
  if (error) {
    console.error("[observability] failed to persist log", error);
  }

  const line = `[${level}] ${event}`;
  if (level === "error") console.error(line, payload);
  else if (level === "warn") console.warn(line, payload);
  else console.log(line, payload);
}

export async function incrementMetric(name: string, value = 1, dimensions: Record<string, string> = {}) {
  const { error } = await (supabaseAdmin as any).from("app_metrics").insert({
    metric_name: name,
    metric_value: value,
    dimensions,
  });

  if (error) {
    console.error("[observability] metric insert failed", error);
  }
}
