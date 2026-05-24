import { createFileRoute } from "@tanstack/react-router";
import Stripe from "stripe";
import { requireEnv } from "@/lib/env";
import { captureError, logEvent } from "@/lib/observability";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

import { env } from "@/lib/env";
import { captureError, logEvent } from "@/lib/observability";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

export const Route = createFileRoute("/api/public/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const sig = request.headers.get("stripe-signature");
        const rawBody = await request.text();

        if (!sig) {
          return new Response("Missing stripe signature", { status: 400 });
        }


        let stripe: Stripe;
        let stripeWebhookSecret: string;
        try {
          const required = requireEnv(["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"]);
          stripe = new Stripe(required.STRIPE_SECRET_KEY);
          stripeWebhookSecret = required.STRIPE_WEBHOOK_SECRET;
        } catch (error) {
          await captureError(error, { module: "stripe_webhook", stage: "env_validation" });
          return new Response("Server misconfiguration: missing Stripe env", { status: 503 });
        }

        let event: Stripe.Event;
        try {
          event = await stripe.webhooks.constructEventAsync(rawBody, sig, stripeWebhookSecret);
          event = await stripe.webhooks.constructEventAsync(rawBody, sig, env.STRIPE_WEBHOOK_SECRET);
        } catch (error) {
          await captureError(error, { module: "stripe_webhook", stage: "signature_validation" });
          return new Response("Invalid signature", { status: 400 });
        }

        const { error: dedupeError } = await (supabaseAdmin as any)
          .from("webhook_events")
          .insert({ id: event.id, type: event.type });

        if (dedupeError && String(dedupeError.message || "").toLowerCase().includes("duplicate")) {
          await logEvent("info", "stripe_webhook_duplicate", { eventId: event.id, type: event.type });
          return new Response(JSON.stringify({ received: true, duplicate: true }), { status: 200 });
        }

        if (dedupeError) {
          await captureError(dedupeError, { module: "stripe_webhook", stage: "dedupe_insert", eventId: event.id });
          return new Response("Webhook persistence error", { status: 500 });
        }

        try {
          if (event.type === "checkout.session.completed") {
            const session = event.data.object as Stripe.Checkout.Session;
            const orderId = session.metadata?.order_id;
            if (orderId) {
              await (supabaseAdmin as any)
                .from("orders")
                .update({ status: "paid", paid_at: new Date().toISOString() })
                .eq("id", orderId);

              await (supabaseAdmin as any)
                .from("sigils")
                .update({ released: true })
                .eq("order_id", orderId);
            }
          } else if (event.type === "checkout.session.expired") {
            const session = event.data.object as Stripe.Checkout.Session;
            const orderId = session.metadata?.order_id;
            if (orderId) {
              await (supabaseAdmin as any).from("orders").update({ status: "expired" }).eq("id", orderId);
            }
          }

          await logEvent("info", "stripe_event_processed", { eventId: event.id, type: event.type });
        } catch (error) {
          await captureError(error, { module: "stripe_webhook", stage: "processing", eventId: event.id, type: event.type });
          return new Response("Processing error", { status: 500 });
        }

        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      },
    },
  },
});
