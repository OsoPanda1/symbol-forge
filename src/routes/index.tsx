import { createFileRoute } from "@tanstack/react-router";
import MatrixRain from "@/components/MatrixRain";
import TopStatusBar from "@/components/TopStatusBar";
import Hero from "@/components/Hero";
import SymbolNoiseBand from "@/components/SymbolNoiseBand";
import AestheticsGenerator from "@/components/AestheticsGenerator";
import AlphaForge from "@/components/AlphaForge";
import LogsConsole from "@/components/LogsConsole";
import Footer from "@/components/Footer";
import CinematicIntro from "@/components/CinematicIntro";
import AuthPanel from "@/components/AuthPanel";
import AmbientAudio from "@/components/AmbientAudio";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Alpha Red Hat · Symbol Forge · TAMV Network" },
      {
        name: "description",
        content:
          "Zona de hackeo simbólico en la deep web latinoamericana. Generador de fuentes raras y forja de símbolos especiales de resistencia.",
      },
      { property: "og:title", content: "The Alpha Red Hat · Symbol Forge" },
      {
        property: "og:description",
        content:
          "Forja símbolos de resistencia y rebeldía que no existen en generadores públicos. Legiones de una leyenda urbana latinoamericana.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="scanlines relative min-h-screen overflow-hidden bg-background">
      <CinematicIntro />

      {/* Deep gradient backdrop */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{ background: "var(--gradient-deep)", zIndex: 0 }}
        aria-hidden
      />
      <MatrixRain />

      <div className="relative z-10">
        <TopStatusBar accessLevel="GUEST" currentModule="ALPHA_FORGE" />
        <Hero onStartFree={() => scrollTo("aesthetics")} onStartAlpha={() => scrollTo("forge")} />
        <AuthPanel />
        <SymbolNoiseBand />
        <AestheticsGenerator />
        <AlphaForge />
        <Footer />
      </div>

      <LogsConsole />
      <AmbientAudio />
    </div>
  );
}
