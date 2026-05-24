import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useNavigate, Link } from "@tanstack/react-router";

type Mode = "login" | "signup";

export default function AuthForm({ mode }: { mode: Mode }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo:
                typeof window !== "undefined" ? `${window.location.origin}/profile` : undefined,
            },
          });

    setLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    if (mode === "login") {
      navigate({ to: "/profile" });
    } else {
      setMessage("Cuenta creada. Revisa tu correo si la verificación está activa.");
    }
  };

  const google = async () => {
    setLoading(true);
    setMessage("");
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri:
        typeof window !== "undefined" ? `${window.location.origin}/profile` : undefined,
    });
    if (result.error) {
      setMessage(result.error.message ?? "Error con Google");
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/profile" });
  };

  return (
    <form onSubmit={submit} className="panel mx-auto flex w-full max-w-md flex-col gap-4 p-6">
      <h1 className="font-display text-3xl uppercase tracking-wide text-bone">
        {mode === "login" ? "Login" : "Sign Up"}
      </h1>
      <p className="font-mono text-xs text-muted-foreground">
        {mode === "login"
          ? "Accede a tu bóveda simbólica y continúa tu forja."
          : "Regístrate para guardar y evolucionar tus símbolos."}
      </p>

      <button
        type="button"
        onClick={google}
        disabled={loading}
        className="flex items-center justify-center gap-2 rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90 disabled:opacity-60"
      >
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.8l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.6l6.2 5.2C41 35.1 44 30 44 24c0-1.3-.1-2.4-.4-3.5z"/>
        </svg>
        Continuar con Google
      </button>

      <div className="flex items-center gap-2 text-[10px] uppercase text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> o con email <span className="h-px flex-1 bg-border" />
      </div>

      <label className="font-mono text-xs uppercase text-ash">
        Email
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border border-border bg-black/60 px-3 py-2 text-sm text-bone"
        />
      </label>

      <label className="font-mono text-xs uppercase text-ash">
        Password
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-md border border-border bg-black/60 px-3 py-2 text-sm text-bone"
        />
      </label>

      <button type="submit" disabled={loading} className="btn-blood disabled:opacity-60">
        {loading ? "Procesando..." : mode === "login" ? "Entrar" : "Crear cuenta"}
      </button>

      {message ? <p className="font-mono text-xs text-terminal">{message}</p> : null}

      <p className="text-center font-mono text-[10px] uppercase text-muted-foreground">
        {mode === "login" ? (
          <>¿Sin cuenta? <Link to="/signup" className="text-bone underline">Crear</Link></>
        ) : (
          <>¿Ya tienes cuenta? <Link to="/login" className="text-bone underline">Entrar</Link></>
        )}
      </p>
    </form>
  );
}
