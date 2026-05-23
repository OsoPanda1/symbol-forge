import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function appendOwnershipEvent(input: {
  symbolId: number;
  ownerKey: string;
  eventType: "minted" | "unlocked" | "transferred";
  sourceRef: string;
  metadata?: Record<string, unknown>;
}) {
  const { error } = await (supabaseAdmin as any).from("ownership_ledger").insert({
    symbol_id: input.symbolId,
    owner_key: input.ownerKey.toLowerCase(),
    event_type: input.eventType,
    source_ref: input.sourceRef,
    metadata: input.metadata ?? {},
  });

  if (error) throw error;
}
