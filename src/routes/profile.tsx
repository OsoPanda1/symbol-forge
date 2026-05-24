import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getMyHistory, type HistoryResponse } from "@/lib/history.functions";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export const Route = createFileRoute("/profile")({
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/login" });
    }
  },
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const fetchHistory = useServerFn(getMyHistory);
  const [user, setUser] = useState<{ email: string | null; name: string | null; avatar: string | null }>({
    email: null,
    name: null,
    avatar: null,
  });
  const [page, setPage] = useState(1);
  const [plan, setPlan] = useState<"all" | "free" | "30" | "150">("all");
  const [status, setStatus] = useState<"all" | "pending" | "paid" | "expired">("all");
  const pageSize = 8;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (!u) return;
      setUser({
        email: u.email ?? null,
        name: (u.user_metadata?.full_name as string) ?? (u.user_metadata?.name as string) ?? null,
        avatar: (u.user_metadata?.avatar_url as string) ?? null,
      });
    });
  }, []);

  const { data, isLoading } = useQuery<HistoryResponse>({
    queryKey: ["my-history", page, plan, status],
    queryFn: () => fetchHistory({ data: { page, pageSize, plan, status } }),
  });

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / pageSize));

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const releasedCount = (data?.rows ?? []).reduce(
    (acc, r) => acc + r.sigils.filter((s) => s.released).length,
    0,
  );

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12">
      <header className="panel mb-8 flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {user.avatar ? (
            <img src={user.avatar} alt="" className="h-14 w-14 rounded-full border border-border" />
          ) : (
            <div className="grid h-14 w-14 place-items-center rounded-full border border-border bg-black/60 font-display text-xl text-bone">
              {(user.name || user.email || "?").slice(0, 1).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="font-display text-2xl uppercase tracking-wide text-bone">
              {user.name ?? "Operador"}
            </h1>
            <p className="font-mono text-xs text-muted-foreground">{user.email ?? "—"}</p>
            <p className="mt-1 font-mono text-[10px] uppercase text-terminal">
              Acceso: {releasedCount > 0 ? `${releasedCount} sigilos liberados` : "Pendiente de forja"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate({ to: "/" })}>
            Ir a la forja
          </Button>
          <Button variant="destructive" onClick={logout}>
            Cerrar sesión
          </Button>
        </div>
      </header>

      <section className="panel p-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-lg uppercase tracking-wide text-bone">Historial</h2>
            <p className="font-mono text-[10px] uppercase text-muted-foreground">
              Ordenes y sigilos generados · ordenado por fecha
            </p>
          </div>
          <div className="flex flex-wrap gap-2 font-mono text-[10px] uppercase">
            <select
              value={plan}
              onChange={(e) => {
                setPlan(e.target.value as any);
                setPage(1);
              }}
              className="rounded border border-border bg-black/60 px-2 py-1 text-bone"
            >
              <option value="all">Plan: todos</option>
              <option value="free">Free</option>
              <option value="30">$30 MXN</option>
              <option value="150">$150 MXN</option>
            </select>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as any);
                setPage(1);
              }}
              className="rounded border border-border bg-black/60 px-2 py-1 text-bone"
            >
              <option value="all">Estado: todos</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <p className="font-mono text-xs text-muted-foreground">Cargando historial…</p>
        ) : (data?.rows.length ?? 0) === 0 ? (
          <p className="font-mono text-xs text-muted-foreground">Sin registros todavía. Forja tu primer sigilo.</p>
        ) : (
          <ul className="space-y-3">
            {data!.rows.map((r) => (
              <li key={r.orderId} className="rounded-md border border-border bg-black/40 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div className="font-mono text-xs text-bone">
                    <span className="uppercase text-terminal">{r.plan}</span> ·{" "}
                    <span className="text-muted-foreground">${r.amount_mxn} MXN</span> ·{" "}
                    <span
                      className={
                        r.status === "paid"
                          ? "text-terminal"
                          : r.status === "expired"
                            ? "text-red-400"
                            : "text-amber-400"
                      }
                    >
                      {r.status.toUpperCase()}
                    </span>
                  </div>
                  <time className="font-mono text-[10px] uppercase text-muted-foreground">
                    {new Date(r.created_at).toLocaleString()}
                  </time>
                </div>
                <p className="mt-2 line-clamp-2 font-mono text-xs text-ash">{r.prompt}</p>
                {r.sigils.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {r.sigils.map((s) => (
                      <span
                        key={s.id}
                        className={`rounded border px-2 py-1 font-mono text-[11px] ${
                          s.released
                            ? "border-terminal/60 bg-terminal/10 text-terminal"
                            : "border-border bg-black/60 text-muted-foreground blur-[1.5px]"
                        }`}
                        title={s.released ? "Liberado" : "Bloqueado · pago pendiente"}
                      >
                        {s.content.slice(0, 12)}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <Pagination className="mt-6">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={page === 1 ? "pointer-events-none opacity-40" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={page === i + 1}
                    onClick={() => setPage(i + 1)}
                    className="cursor-pointer"
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={page === totalPages ? "pointer-events-none opacity-40" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </section>
    </main>
  );
}
