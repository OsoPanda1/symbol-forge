"use client"

import { useEffect, useMemo, useState } from "react"

type AccessLevel = "GUEST" | "SYMBOL_FORGE"
type ModuleKey = "AESTHETICS" | "ALPHA_FORGE" | "BIOMATRIX" | "HASH" | "UTAMV"

type Props = {
  accessLevel: AccessLevel
  currentModule: ModuleKey
}

const MESSAGES_BASE = [
  "deep segment online · rastreo publicitario neutralizado",
  "verificando integridad del nodo… ok",
  "escaneo de intrusiones externas… sin compromiso",
  "simulando tráfico corporativo para camuflar tu sesión",
  "el núcleo Isabella está estabilizando el flujo de símbolos",
]

const MESSAGES_ALPHA = [
  "modo ALPHA activo · forja de sigils autorizada",
  "bloqueo adicional sobre scraping automatizado",
  "cualquier símbolo forjado aquí no se liberará en generadores públicos",
]

export default function TopStatusBar({ accessLevel, currentModule }: Props) {
  const [tick, setTick] = useState(0)
  const [timestamp, setTimestamp] = useState("")

  useEffect(() => {
    const t = setInterval(() => {
      setTick((x) => x + 1)
      const now = new Date()
      const time = now.toLocaleTimeString("es-MX", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      setTimestamp(time)
    }, 3000)
    return () => clearInterval(t)
  }, [])

  const message = useMemo(() => {
    const pool =
      accessLevel === "SYMBOL_FORGE"
        ? [...MESSAGES_BASE, ...MESSAGES_ALPHA]
        : MESSAGES_BASE
    return pool[tick % pool.length]
  }, [tick, accessLevel])

  const moduleLabel: Record<ModuleKey, string> = {
    AESTHETICS: "MODULE_01 · GENERADOR.AESTHETICS",
    ALPHA_FORGE: "MODULE_02 · ALPHA.SYMBOL_FORGE",
    BIOMATRIX: "MODULE_03 · BIOMATRIX.HEPTAGON",
    HASH: "MODULE_04 · HASH.IDENTIDAD_CIENTÍFICA",
    UTAMV: "MODULE_05 · PORTAL.ACADÉMICO.UTAMV",
  }

  return (
    <div className="relative z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-2 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
        {/* LADO IZQUIERDO: NODO + MÓDULO ACTUAL */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2 animate-pulse rounded-full bg-terminal shadow-[0_0_8px_var(--terminal)]" />
            <span className="text-terminal">TAMV.ONLINE_NETWORK</span>
          </span>
          <span className="text-ash">//</span>
          <span>
            NODE: <span className="text-blood-glow">THE_ALPHA_RED_HAT</span>
          </span>
          <span className="hidden items-center gap-1 text-ash md:inline-flex">
            <span>//</span>
            <span className="text-[10px] text-ash/80">{moduleLabel[currentModule]}</span>
          </span>
        </div>

        {/* LADO DERECHO: ACCESS + MENSAJE DINÁMICO + HORA */}
        <div className="flex flex-wrap items-center gap-3">
          <span>
            ACCESS:{" "}
            <span className={accessLevel === "GUEST" ? "text-terminal" : "text-blood-glow"}>
              {accessLevel === "GUEST"
                ? "GUEST · READ-ONLY"
                : "SYMBOL-FORGE · RESTRICTED"}
            </span>
          </span>
          <span className="text-ash">//</span>
          <span className="flicker text-[10px] text-terminal">
            {message}
          </span>
          <span className="hidden text-ash md:inline">
            //
          </span>
          <span className="hidden text-[10px] text-ash md:inline">
            {timestamp || "syncing_time…"}
          </span>
        </div>
      </div>
    </div>
  )
}
