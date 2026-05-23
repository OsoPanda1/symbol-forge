import { createFileRoute } from "@tanstack/react-router";
import Stripe from "stripe";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY no configurado");
  return new Stripe(key);
}

export const Route = createFileRoute("/api/public/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const stripe = getStripe();
        const sig = request.headers.get("stripe-signature");
        const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
        const rawBody = await request.text();

        if (!sig || !whSecret) {
          return new Response("Missing signature or secret", { status: 400 });
        }

        let event: Stripe.Event;
        try {
          event = await stripe.webhooks.constructEventAsync(rawBody, sig, whSecret);
        } catch (err) {
          console.error("[stripe-webhook] invalid signature", err);
          return new Response("Invalid signature", { status: 400 });
        }

        const eventId = event.id;
        const { data: alreadyProcessed } = await supabaseAdmin
          .from("webhook_events")
          .select("id")
          .eq("id", eventId)
          .maybeSingle();

        if (alreadyProcessed) {
          return new Response(JSON.stringify({ received: true, duplicate: true }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }

        await supabaseAdmin.from("webhook_events").insert({ id: event.id, type: event.type });

        if (event.type === "checkout.session.completed") {
          const session = event.data.object as Stripe.Checkout.Session;
          const orderId = session.metadata?.order_id;
          if (orderId) {
            const { data: order } = await supabaseAdmin
              .from("orders")
              .update({ status: "paid", paid_at: new Date().toISOString() })
              .eq("id", orderId)
              .select("id, contact")
              .single();
            // Release all sigils for this order and map them into private PUA symbols.
            const { data: releasedSigils } = await supabaseAdmin
              .from("sigils")
              .update({ released: true })
              .eq("order_id", orderId)
              .select("id, idx");

            if (releasedSigils?.length) {
              const { data: baseCollection } = await supabaseAdmin
                .from("collections")
                .select("id")
                .eq("name", "ALPHA CORE")
                .maybeSingle();

              for (const sigil of releasedSigils) {
                const puaHex = (0xe000 + (sigil.idx % 0x18ff)).toString(16);
                const { data: symbol } = await supabaseAdmin
                  .from("symbols")
                  .upsert({
                    sigil_id: sigil.id,
                    symbol_name: `sigil-${sigil.idx + 1}`,
                    pua_hex: puaHex,
                    collection_id: baseCollection?.id ?? null,
                  }, { onConflict: "sigil_id" })
                  .select("id")
                  .single();

                if (symbol?.id && order?.contact) {
                  await supabaseAdmin.from("user_unlocks").upsert({
                    user_key: String(order.contact).toLowerCase(),
                    symbol_id: symbol.id,
                  }, { onConflict: "user_key,symbol_id" });
                }
              }
            }
          }
        } else if (event.type === "checkout.session.expired") {
          const session = event.data.object as Stripe.Checkout.Session;
          const orderId = session.metadata?.order_id;
          if (orderId) {
            await supabaseAdmin.from("orders").update({ status: "expired" }).eq("id", orderId);
          }
        }

        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
