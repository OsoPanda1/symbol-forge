export default function TopStatusBar() {
  return (
    <div className="relative z-30 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-2 px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-2 animate-pulse rounded-full bg-terminal shadow-[0_0_8px_var(--terminal)]" />
            <span className="text-terminal">TAMV.ONLINE_NETWORK</span>
          </span>
          <span className="text-ash">//</span>
          <span>NODE: <span className="text-blood-glow">THE_ALPHA_RED_HAT</span></span>
        </div>
        <div className="flex items-center gap-3">
          <span>ACCESS: <span className="text-blood-glow">GUEST · READ-ONLY</span></span>
          <span className="text-ash">//</span>
          <span className="flicker">ENCRYPTED CHANNEL OPEN</span>
        </div>
      </div>
    </div>
  );
}
