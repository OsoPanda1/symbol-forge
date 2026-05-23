import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { assertRateLimit, makeRateLimitKey } from "@/lib/security";
import { getRequest } from "@tanstack/react-start/server";

export const getOpsLogs = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z
      .object({
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(20),
        level: z.enum(["debug", "info", "warn", "error"]).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const request = getRequest();
    if (request) await assertRateLimit(makeRateLimitKey("ops-logs", request));

    let query = (supabaseAdmin as any)
      .from("app_logs")
      .select("id, level, event, payload, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((data.page - 1) * data.pageSize, data.page * data.pageSize - 1);

    if (data.level) query = query.eq("level", data.level);

    const { data: items, error, count } = await query;
    if (error) throw new Error(error.message);

    return { page: data.page, pageSize: data.pageSize, total: count ?? 0, items: items ?? [] };
  });

export const exportOpsLogsCsv = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z
      .object({
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(200).default(100),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const request = getRequest();
    if (request) await assertRateLimit(makeRateLimitKey("ops-logs-export", request));

    const { data: rows, error } = await (supabaseAdmin as any)
      .from("app_logs")
      .select("id, level, event, created_at")
      .order("created_at", { ascending: false })
      .range((data.page - 1) * data.pageSize, data.page * data.pageSize - 1);

    if (error) throw new Error(error.message);

    const header = "id,level,event,created_at\n";
    const body = (rows ?? [])
      .map((r: any) => `${r.id},${r.level},${String(r.event).replaceAll(",", " ")},${r.created_at}`)
      .join("\n");

    return header + body;
  });
