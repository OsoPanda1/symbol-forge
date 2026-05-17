export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-border bg-background/80 px-4 py-10 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-blood-glow">
            // TAMV.ONLINE_NETWORK
          </div>
          <div className="mt-2 font-display text-lg font-bold uppercase tracking-tight">
            The Alpha Red Hat · Anubis Villaseñor
          </div>
          <p className="mt-1 max-w-md font-mono text-xs text-muted-foreground">
            Zona de hackeo simbólico latinoamericana. Sin trackers corporativos. Sin SaaS invasivos.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 font-mono text-xs uppercase tracking-widest text-ash md:text-right">
          <span>nodo: alpha</span>
          <span className="text-terminal">status: ok</span>
          <span>build: 0.1.alpha</span>
          <span className="text-blood-glow">acceso: público</span>
        </div>
      </div>
      <div className="mx-auto mt-8 max-w-6xl border-t border-border pt-4 font-mono text-[10px] uppercase tracking-widest text-ash">
        © {new Date().getFullYear()} TAMV · forjado en la deep web · todos los símbolos son tuyos
      </div>
    </footer>
  );
}
