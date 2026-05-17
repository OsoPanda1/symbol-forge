const NOISE =
  "⧉⧉⧉ ⟟⟟⟟ ϞϞϞ 𓂀𓂀 ⦿⦿⦿ ᛉᛉᛉ ☰☲☷☵☳ ⋇⋇⋇ ⸸⸸⸸ ⛧⛧⛧ ⟁⟁⟁ ᚱᚦᛟ ▰▰▰ ◢◤◣◥ ░▒▓█ ϴΩΨΣ ⨂⨁⨀ ⊹⊹⊹ ✶✶✶ ☍☌☋ ⟁⟁⟁ ⸸⛧⸸";
const MSG = "[ZONA DE HACKEO SIMBÓLICO]";
const STR = (
  NOISE +
  " " +
  MSG +
  " " +
  NOISE +
  " [NO_INDEXADO_POR_MOTORES_DEL_STATUS_QUO] " +
  NOISE
).repeat(3);

export default function SymbolNoiseBand() {
  return (
    <div className="relative z-10 overflow-hidden border-y border-border bg-background/60 py-3 backdrop-blur-sm">
      <div className="marquee-track font-mono text-xl text-blood-glow/70" aria-hidden>
        {STR + "    " + STR}
      </div>
    </div>
  );
}
