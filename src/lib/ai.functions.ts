import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { assertRateLimit, makeRateLimitKey } from "@/lib/security";
import { getRequest } from "@tanstack/react-start/server";

export const searchSymbolsHybrid = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ q: z.string().min(2), limit: z.number().int().min(1).max(25).default(10) }).parse(input))
  .handler(async ({ data }) => {
    const request = getRequest();
    if (request) await assertRateLimit(makeRateLimitKey("ai-search", request));

    const { data: items, error } = await (supabaseAdmin as any).rpc("match_symbols_hybrid", {
      p_query: data.q,
      p_limit: data.limit,
    });
    if (error) throw new Error(error.message);
    return { items: items ?? [] };
  });
