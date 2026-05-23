import { supabaseAdmin } from "@/integrations/supabase/client.server";

type LedgerKind = "symbol_purchase" | "refund";

type LedgerEntryInput = {
  accountExternalRef: string;
  accountType: "user" | "symbol" | "system";
  direction: "debit" | "credit";
  amount: number;
  currency: string;
};

export async function createLedgerTransaction(input: {
  stripePaymentIntent?: string;
  orderId?: string;
  kind: LedgerKind;
  entries: LedgerEntryInput[];
  metadata?: Record<string, unknown>;
}) {
  const { data: txn, error: txnError } = await (supabaseAdmin as any)
    .from("ledger_transactions")
    .insert({
      stripe_payment_intent: input.stripePaymentIntent ?? null,
      order_id: input.orderId ?? null,
      kind: input.kind,
      metadata: input.metadata ?? {},
    })
    .select("id")
    .single();
  if (txnError || !txn) throw new Error(txnError?.message ?? "ledger tx create failed");

  const txnId = txn.id as string;
  const accountMap = new Map<string, string>();

  for (const e of input.entries) {
    const key = `${e.accountType}:${e.accountExternalRef}`;
    if (accountMap.has(key)) continue;
    const { data: existing } = await (supabaseAdmin as any).from("accounts").select("id").eq("external_ref", key).maybeSingle();
    if (existing?.id) accountMap.set(key, existing.id);
    else {
      const { data: created, error: createErr } = await (supabaseAdmin as any)
        .from("accounts")
        .insert({ external_ref: key, account_type: e.accountType, currency: e.currency })
        .select("id")
        .single();
      if (createErr || !created) throw new Error(createErr?.message ?? "account create failed");
      accountMap.set(key, created.id);
    }
  }

  const { error: entErr } = await (supabaseAdmin as any).from("ledger_entries").insert(
    input.entries.map((e) => ({
      txn_id: txnId,
      account_id: accountMap.get(`${e.accountType}:${e.accountExternalRef}`),
      direction: e.direction,
      amount: e.amount,
      currency: e.currency,
    })),
  );
  if (entErr) throw new Error(entErr.message);

  const { data: balanced } = await (supabaseAdmin as any).rpc("is_txn_balanced", { p_txn_id: txnId });
  if (!balanced) throw new Error("ledger invariant violation: unbalanced transaction");

  return { txnId };
}
