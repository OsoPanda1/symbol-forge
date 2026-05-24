// src/routes/__root.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import OptimizedVideo from "@/components/OptimizedVideo";
import shellBg from "@/assets/96756-657131767.mp4";

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "The Alpha Red Hat",
      alternateName: "Symbol Forge",
      url: "https://anubis-legions.lovablle.app",
      logo: "https://anubis-legions.lovablle.app/logo.png",
      sameAs: ["https://x.com/TAMV_Online"],
      description:
        "Servicio de identidad simbólica y generación de sigilos con enfoque cinematográfico e inmersivo.",
    },
    {
      "@type": "WebSite",
      name: "Symbol Forge",
      url: "https://anubis-legions.lovablle.app",
      description:
        "Plataforma de generación simbólica, experimentación visual y forja procedural de identidades.",
      inLanguage: "es",
      publisher: {
        "@type": "Organization",
        name: "The Alpha Red Hat",
      },
      potentialAction: {
        "@type": "SearchAction",
        target: "https://anubis-legions.lovablle.app/?q={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Symbol Forge · The Alpha Red Hat" },
      {
        name: "description",
        content:
          "Zona de hackeo simbólico · Legiones de una leyenda urbana latinoamericana · Forja de símbolos Alpha.",
      },
      { name: "author", content: "The Alpha Red Hat · Anubis Villaseñor" },
      { property: "og:title", content: "Symbol Forge · The Alpha Red Hat" },
      {
        property: "og:description",
        content:
          "Generador Aesthetics y forja Alpha de símbolos de resistencia · TAMV Online Network.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@TAMV_Online" },
      { name: "twitter:title", content: "Symbol Forge · The Alpha Red Hat" },
      { name: "description", content: "Symbol Forge is a unique application for creating and selling custom digital symbols and fonts." },
      { property: "og:description", content: "Symbol Forge is a unique application for creating and selling custom digital symbols and fonts." },
      { name: "twitter:description", content: "Symbol Forge is a unique application for creating and selling custom digital symbols and fonts." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/98a608a9-4d7e-42ff-bd77-37e31cb46a57/id-preview-dc1fd3a3--f3e5aca8-3365-456b-92a6-1217bc284383.lovable.app-1779597239232.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/98a608a9-4d7e-42ff-bd77-37e31cb46a57/id-preview-dc1fd3a3--f3e5aca8-3365-456b-92a6-1217bc284383.lovable.app-1779597239232.png" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@400;500;700&family=Cinzel:wght@600;800&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </head>
      <body className="bg-background text-foreground">
        {/* Capa de video global: se activa en idle y respeta ahorro de datos/movimiento. */}
        <OptimizedVideo
          src={shellBg}
          eager
          wrapperClassName="pointer-events-none fixed inset-0"
          className="h-full w-full object-cover opacity-20"
          overlayClassName="absolute inset-0 bg-black/70"
        />

        {/* Capa de aplicación */}
        <div className="relative z-10 min-h-screen">
          {children}
          <Scripts />
        </div>
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}
