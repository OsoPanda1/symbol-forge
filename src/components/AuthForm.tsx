import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Mode = "login" | "signup";

export default function AuthForm({ mode }: { mode: Mode }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const action = mode === "login" ? supabase.auth.signInWithPassword : supabase.auth.signUp;
    const { error } = await action({ email, password });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage(
      mode === "signup"
        ? "Cuenta creada. Revisa tu correo para confirmar tu cuenta si tu proyecto lo requiere."
        : "Sesión iniciada correctamente.",
    );
    setLoading(false);
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
    </form>
  );
}
