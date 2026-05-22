import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import Stripe from "stripe";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getRequestHost, getRequestHeader } from "@tanstack/react-start/server";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY no configurado");
  return new Stripe(key, { apiVersion: "2024-06-20" as Stripe.LatestApiVersion });
}

export const createCheckoutSession = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ orderId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    const stripe = getStripe();
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", data.orderId)
      .single();
    if (error || !order) throw new Error("Orden no encontrada");
    if (order.status === "paid") throw new Error("Esta orden ya está pagada");

    const proto = getRequestHeader("x-forwarded-proto") ?? "https";
    const host = getRequestHost();
    const origin = `${proto}://${host}`;

    const planName =
      order.plan === "legion" ? "Paquete de Legión · 10 sigils" : "Forja Individual · 1 sigil";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "mxn",
            unit_amount: order.amount_mxn,
            product_data: {
              name: `THE ALPHA RED HAT · ${planName}`,
              description: `Hash: ${order.hash} · Prompt: ${order.prompt.slice(0, 80)}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        order_id: order.id,
        hash: order.hash,
        plan: order.plan,
      },
      success_url: `${origin}/forge/success?order_id=${order.id}`,
      cancel_url: `${origin}/?canceled=1#forge`,
    });

    await supabaseAdmin
      .from("orders")
      .update({ stripe_session_id: session.id })
      .eq("id", order.id);

    return { url: session.url };
  });
