import { createFileRoute, useSearch, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useServerFn } from "@tanstack/react-start";
import { getOrderStatus } from "@/lib/forge.functions";

export const Route = createFileRoute("/forge/success")({
  validateSearch: z.object({ order_id: z.string().uuid().optional() }),
  component: SuccessPage,
});

function SuccessPage() {
  const { order_id } = useSearch({ from: "/forge/success" });
  const fetchStatus = useServerFn(getOrderStatus);
  const [data, setData] = useState<Awaited<ReturnType<typeof getOrderStatus>>>(null);
  const [tries, setTries] = useState(0);

  useEffect(() => {
    if (!order_id) return;
    let alive = true;
    const tick = async () => {
      try {
        const res = await fetchStatus({ data: { orderId: order_id } });
        if (!alive) return;
        setData(res);
        if (res?.order.status !== "paid" && tries < 20) {
          setTries((t) => t + 1);
          setTimeout(tick, 1500);
        }
      } catch {
        /* ignore */
      }
    };
    tick();
    return () => {
      alive = false;
    };
  }, [order_id]); // eslint-disable-line

  if (!order_id) {
    return (
      <main className="min-h-screen bg-background p-10 font-mono text-bone">
        <p>Falta el order_id.</p>
      </main>
    );
  }

  const paid = data?.order.status === "paid";

  return (
    <main className="scanlines relative min-h-screen overflow-hidden bg-background px-4 py-16">
      <div
        className="pointer-events-none fixed inset-0"
        style={{ background: "var(--gradient-deep)", zIndex: 0 }}
      />
      <div className="relative z-10 mx-auto max-w-3xl">
        <div className="panel p-8">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-blood-glow">
            // forge.success · {paid ? "PAGO_VERIFICADO" : "ESPERANDO_CONFIRMACIÓN"}
          </div>
          <h1
            className="glitch mt-3 font-display text-3xl font-bold uppercase md:text-5xl"
            data-text={paid ? "Sigil liberado" : "Verificando pago..."}
          >
            {paid ? "Sigil liberado" : "Verificando pago..."}
          </h1>
          {!paid && (
            <p className="mt-4 font-mono text-sm text-ash">
              Consultando estado de la transacción · intento {tries + 1}/20
            </p>
          )}
          {paid && data && (
            <>
              <p className="mt-4 font-mono text-sm text-terminal">
                Hash: {data.order.hash} · Plan: {data.order.plan}
              </p>
              <div className="mt-6 grid gap-3">
                {data.sigils.map((s) => (
                  <div
                    key={s.id}
                    className={`border p-3 font-mono text-base text-bone ${
                      s.id === data.order.selected_sigil_id
                        ? "border-blood-glow bg-blood/10"
                        : "border-border bg-black/40"
                    }`}
                  >
                    <span className="mr-2 text-[10px] uppercase tracking-[0.2em] text-ash">
                      SIGIL.{s.idx + 1}
                    </span>
                    {s.content}
                  </div>
                ))}
              </div>
              <button
                className="btn-blood mt-6"
                onClick={() => {
                  navigator.clipboard.writeText(data.sigils.map((s) => s.content).join("\n"));
                }}
              >
                ⌘ COPIAR TODOS LOS SIGILS
              </button>
            </>
          )}
          <div className="mt-8">
            <Link to="/" className="btn-ghost">
              ← Volver al búnker
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
