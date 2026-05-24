import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getRequest } from "@tanstack/react-start/server";
import { getUserEmailFromRequest } from "@/lib/security";

type AccessResponse = {
  status: "unlocked" | "locked";
  cssClass?: string;
  puaHex?: string;
};

export const renderSymbolAccess = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ sigilId: z.string().uuid() }).parse(input))
  .handler(async ({ data }): Promise<AccessResponse> => {
    const request = getRequest();
    const userEmail = await getUserEmailFromRequest(request);
    if (!userEmail) return { status: "locked" };

    const { data: symbol } = await (supabaseAdmin as any)
      .from("symbols")
      .select("id, pua_hex")
      .eq("sigil_id", data.sigilId)
      .eq("is_active", true)
      .maybeSingle();

    if (!symbol) return { status: "locked" };

    const { data: unlocked } = await (supabaseAdmin as any)
      .from("user_unlocks")
      .select("symbol_id")
      .eq("symbol_id", symbol.id)
      .eq("user_key", userEmail.toLowerCase())
      .maybeSingle();

    if (!unlocked) return { status: "locked" };

    const cssClass = `sym-${String(symbol.id).padStart(4, "0")}`;
    return { status: "unlocked", cssClass, puaHex: symbol.pua_hex };
  });
