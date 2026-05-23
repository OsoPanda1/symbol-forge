import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { FeatureNode } from "@/config/features-tree";
import { searchSymbolsHybrid } from "@/lib/ai.functions";
import { getOpsLogs } from "@/lib/ops.functions";

export const Route = createFileRoute("/landing")({ component: LandingPage });

function LandingPage() {
  const [features, setFeatures] = useState<FeatureNode[]>([]);
  const [q, setQ] = useState("umbral");
  const [search, setSearch] = useState<any[]>([]);
  const [opsTotal, setOpsTotal] = useState<number>(0);

  useEffect(() => {
    fetch("/api/public/features-tree")
      .then((r) => r.json())
      .then(setFeatures)
      .catch(() => setFeatures([]));

    getOpsLogs({ data: { page: 1, pageSize: 5 } })
      .then((r) => setOpsTotal(r.total))
      .catch(() => setOpsTotal(0));
  }, []);

  const runSearch = async () => {
    const res = await searchSymbolsHybrid({ data: { q, limit: 5 } });
    setSearch(res.items ?? []);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8 space-y-8">
      <section>
        <h1 className="text-3xl font-bold">RDM Digital / Symbol Forge</h1>
        <p>Sistema Operativo Territorial: Infraestructura + Identidad + Economía + IA + Gobernanza + Experiencia.</p>
      </section>
      <section>
        <h2 className="text-xl font-semibold">Roadmap Must/Should/Could</h2>
        <div className="space-y-3 mt-3">
          {features.map((f) => (
            <div key={f.id} className="border p-3 rounded">
              <div className="font-semibold">{f.title} · {f.priority.toUpperCase()} · {f.done ? "DONE" : "PENDING"}</div>
              <div className="text-sm opacity-80">{f.description}</div>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-xl font-semibold">Búsqueda híbrida simbólica</h2>
        <div className="flex gap-2 my-2">
          <input className="border px-2 py-1 bg-transparent" value={q} onChange={(e) => setQ(e.target.value)} />
          <button className="border px-3 py-1" onClick={runSearch}>Buscar</button>
        </div>
        <ul className="text-sm list-disc pl-5">
          {search.map((it, idx) => <li key={idx}>{it.symbol_name} ({it.pua_hex}) score {Number(it.final_score ?? 0).toFixed(3)}</li>)}
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold">Operaciones</h2>
        <p>Eventos operativos registrados: {opsTotal}</p>
      </section>
    </div>
  );
}
