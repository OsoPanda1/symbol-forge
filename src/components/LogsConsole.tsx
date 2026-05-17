import { useEffect, useState } from "react";

const MESSAGES = [
  { t: "ALERT", c: "blood", m: "intento de intrusión detectado en nodo 4..." },
  { t: "OK", c: "terminal", m: "The Alpha Red Hat ha neutralizado el ataque." },
  { t: "LOG", c: "ash", m: "deep web status: estable · anonimato operativo." },
  { t: "ALERT", c: "blood", m: "rastreo publicitario bloqueado en tiempo real." },
  { t: "OK", c: "terminal", m: "tus símbolos viajan sin ser vendidos a corporaciones." },
  { t: "LOG", c: "ash", m: "forja simbólica disponible · cola: 0" },
  { t: "ALERT", c: "blood", m: "scraper corporativo identificado · honeypot activado." },
  { t: "OK", c: "terminal", m: "legión: +1 alma anónima cruzó el umbral." },
];

export default function LogsConsole() {
  const [lines, setLines] = useState<{ id: number; t: string; c: string; m: string }[]>([]);

  useEffect(() => {
    let id = 0;
    const tick = () => {
      const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
      id++;
      setLines((prev) => [...prev.slice(-4), { id, ...msg }]);
    };
    tick();
    const i = setInterval(tick, 3200);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-3 left-3 z-40 hidden w-[380px] md:block">
      <div className="border border-border bg-background/90 backdrop-blur">
        <div className="flex items-center justify-between border-b border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest">
          <span className="text-terminal">▸ tamv.log · live</span>
          <span className="flex items-center gap-1.5 text-ash">
            <span className="inline-block size-1.5 animate-pulse rounded-full bg-blood-glow" />
            stream
          </span>
        </div>
        <div className="space-y-1 px-3 py-2 font-mono text-[11px] leading-relaxed">
          {lines.map((l) => (
            <div key={l.id} className="flex gap-2">
              <span
                className={
                  l.c === "blood"
                    ? "text-blood-glow"
                    : l.c === "terminal"
                    ? "text-terminal"
                    : "text-ash"
                }
              >
                [{l.t}]
              </span>
              <span className="text-muted-foreground">{l.m}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
