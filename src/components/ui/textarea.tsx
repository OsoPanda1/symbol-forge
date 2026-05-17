"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { cn } from "@/lib/utils"

// Import dinámico del globo (evita SSR issues)
const Globe = dynamic(() => import("./AlphaGlobe"), { ssr: false })

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  maxChars?: number
}

type Alert = {
  id: number
  level: "INFO" | "WARN" | "CRIT"
  message: string
}

const ALERT_POOL: Alert[] = [
  {
    id: 1,
    level: "INFO",
    message: "Nuevo nodo observador conectado desde LATAM · tráfico camuflado como streaming.",
  },
  {
    id: 2,
    level: "WARN",
    message: "Intento de scraping detectado en endpoint público · firma bloqueada.",
  },
  {
    id: 3,
    level: "CRIT",
    message: "Anomalía simbólica detectada · posible sigil duplicado fuera de la forja.",
  },
  {
    id: 4,
    level: "INFO",
    message: "Canal de entrada encriptado · fingerprints de rastreo publicitario anulados.",
  },
  {
    id: 5,
    level: "WARN",
    message: "Actividad inusual en región EU-West · bots corporativos escaneando superficie.",
  },
]

export function AlphaMonitorConsole({ maxChars = 280, className, ...props }: Props) {
  const [value, setValue] = React.useState(props.value?.toString() ?? "")
  const [alerts, setAlerts] = React.useState<Alert[]>([])
  const [alertTick, setAlertTick] = React.useState(0)

  const length = value.length
  const overLimit = length > maxChars

  // Rotación de alertas tipo NOC
  React.useEffect(() => {
    const id = window.setInterval(() => {
      setAlertTick((t) => t + 1)
      setAlerts((prev) => {
        const pool = ALERT_POOL
        const next = pool[Math.floor(Math.random() * pool.length)]
        const withNew = [...prev.filter((a) => a.id !== next.id), next]
        return withNew.slice(-3) // máximo 3 banners visibles
      })
    }, 5000)
    return () => window.clearInterval(id)
  }, [])

  // Sincronizar value externo
  React.useEffect(() => {
    if (props.value !== undefined) {
      setValue(props.value.toString())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.value])

  const badgeForLevel = (level: Alert["level"]) => {
    if (level === "CRIT") return "bg-blood text-bone border-blood-glow"
    if (level === "WARN") return "bg-acid/20 text-acid border-acid/60"
    return "bg-terminal/10 text-terminal border-terminal/60"
  }

  return (
    <div className="panel grid gap-6 p-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] md:p-6">
      {/* COLUMNA IZQUIERDA: TEXTAREA + ESTADO */}
      <div className="flex flex-col gap-3">
        {/* Encabezado consola */}
        <div className="flex items-center justify-between">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-terminal">
            &gt; canal_de_entrada · prompt_central
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ash">
            <span className="inline-flex items-center gap-1">
              <span className="inline-block size-1.5 rounded-full bg-terminal shadow-[0_0_8px_var(--terminal)]" />
              <span>canales encriptados</span>
            </span>
          </div>
        </div>

        {/* Textarea tipo NOC */}
        <div className="relative">
          <textarea
            {...props}
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              props.onChange?.(e)
            }}
            className={cn(
              "flex min-h-[140px] w-full rounded-none border border-input bg-black/60 px-3 py-2",
              "font-mono text-sm text-bone shadow-sm placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blood-glow focus-visible:border-blood-glow",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "transition-colors duration-100",
              className,
            )}
            maxLength={undefined} // controlamos con mensaje, no hard limit
          />

          {/* esquinas marcadas */}
          <span className="pointer-events-none absolute -top-px -left-px h-3 w-3 border-l-2 border-t-2 border-blood" />
          <span className="pointer-events-none absolute -bottom-px -right-px h-3 w-3 border-b-2 border-r-2 border-blood" />
        </div>

        {/* Barra de estado bajo textarea */}
        <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ash">
          <span>
            longitud:
            <span className={cn("ml-1", overLimit && "text-blood-glow")}>
              {length} / {maxChars}
            </span>
          </span>
          <span className="text-ash/70">
            {overLimit
              ? "[ alerta: reduce ruído · la forja funciona mejor con intención concentrada ]"
              : "[ listo para enviar al núcleo de forja ]"}
          </span>
        </div>
      </div>

      {/* COLUMNA DERECHA: GLOBO + BANNERS DE ALERTA */}
      <div className="flex flex-col gap-3">
        {/* Subheader globo */}
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-ash">
          <span>// mapa_de_superficie · tráfico_simulado</span>
          <span className="text-terminal">nodos: latam · global</span>
        </div>

        {/* Contenedor del globo 3D */}
        <div className="heptagon-frame relative h-40 w-full overflow-hidden md:h-48">
          <Globe />
          {/* Overlay sutil */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.75)_80%)]" />
        </div>

        {/* Banners de alerta estilo NOC */}
        <div className="space-y-2">
          {alerts.map((a) => (
            <div
              key={`${a.id}-${alertTick}-${a.level}`}
              className={cn(
                "relative overflow-hidden border px-3 py-2 text-[10px] font-mono uppercase tracking-[0.18em] transition-all",
                "animate-in fade-in slide-in-from-right duration-300",
                badgeForLevel(a.level),
              )}
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center rounded-full border px-1.5 py-0.5 text-[9px]">
                  {a.level === "CRIT" ? "alerta_crítica" : a.level === "WARN" ? "alerta" : "log"}
                </span>
                <span className="line-clamp-2 normal-case text-[10px]">
                  {a.message}
                </span>
              </div>
              {/* barra inferior de progreso visual (fake) */}
              <span className="absolute inset-x-0 bottom-0 h-[1px] bg-gradient-to-r from-blood via-terminal to-blood/40" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
