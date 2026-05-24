import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const QuerySchema = z.object({
  page: z.number().int().min(1).max(1000).default(1),
  pageSize: z.number().int().min(1).max(50).default(10),
  plan: z.enum(["all", "free", "30", "150"]).default("all"),
  status: z.enum(["all", "pending", "paid", "expired"]).default("all"),
});

export type HistoryRow = {
  orderId: string;
  plan: string;
  amount_mxn: number;
  status: string;
  mode: string;
  prompt: string;
  created_at: string;
  paid_at: string | null;
  sigils: Array<{ id: string; idx: number; content: string; released: boolean; style_id: string | null }>;
};

export type HistoryResponse = {
  rows: HistoryRow[];
  total: number;
  page: number;
  pageSize: number;
};

export const getMyHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => QuerySchema.parse(input))
  .handler(async ({ data, context }): Promise<HistoryResponse> => {
    const email = (context.claims as any)?.email as string | undefined;
    if (!email) return { rows: [], total: 0, page: data.page, pageSize: data.pageSize };

    const from = (data.page - 1) * data.pageSize;
    const to = from + data.pageSize - 1;

    let q = supabaseAdmin
      .from("orders")
      .select("id, plan, amount_mxn, status, mode, prompt, created_at, paid_at", { count: "exact" })
      .ilike("contact", email)
      .order("created_at", { ascending: false });

    if (data.plan !== "all") q = q.eq("plan", data.plan);
    if (data.status !== "all") q = q.eq("status", data.status);

    const { data: orders, count, error } = await q.range(from, to);
    if (error) throw new Error(error.message);

    const orderIds = (orders ?? []).map((o) => o.id);
    let sigils: any[] = [];
    if (orderIds.length) {
      const { data: s } = await supabaseAdmin
        .from("sigils")
        .select("id, order_id, idx, content, released, style_id")
        .in("order_id", orderIds)
        .order("idx", { ascending: true });
      sigils = s ?? [];
    }

    const rows: HistoryRow[] = (orders ?? []).map((o) => ({
      orderId: o.id,
      plan: o.plan,
      amount_mxn: o.amount_mxn,
      status: o.status,
      mode: o.mode,
      prompt: o.prompt,
      created_at: o.created_at,
      paid_at: o.paid_at,
      sigils: sigils
        .filter((x) => x.order_id === o.id)
        .map((x) => ({ id: x.id, idx: x.idx, content: x.content, released: x.released, style_id: x.style_id })),
    }));

    return { rows, total: count ?? 0, page: data.page, pageSize: data.pageSize };
  });
