// src/routes/__root.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router"

import appCss from "../styles.css?url"
import shellBg from "@/assets/96756-657131767.mp4"

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
  )
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error)
  const router = useRouter()

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
              router.invalidate()
              reset()
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
  )
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
    ],
    links: [
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
})

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body className="bg-background text-foreground">
        {/* Capa de video global: centro de monitoreo de la red */}
        <video
          className="fixed inset-0 h-full w-full object-cover opacity-20 pointer-events-none"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src={shellBg} type="video/mp4" />
        </video>
        <div className="fixed inset-0 bg-black/70 pointer-events-none" />

        {/* Capa de aplicación */}
        <div className="relative z-10 min-h-screen">
          {children}
          <Scripts />
        </div>
      </body>
    </html>
  )
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext()

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  )
}
