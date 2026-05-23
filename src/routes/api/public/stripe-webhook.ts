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

        if (event.type === "checkout.session.completed") {
          const session = event.data.object as Stripe.Checkout.Session;
          const orderId = session.metadata?.order_id;
          if (orderId) {
            await supabaseAdmin
              .from("orders")
              .update({ status: "paid", paid_at: new Date().toISOString() })
              .eq("id", orderId);
            // Release all sigils for this order so the buyer can copy them.
            await supabaseAdmin
              .from("sigils")
              .update({ released: true })
              .eq("order_id", orderId);
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
