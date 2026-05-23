import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Mode = "login" | "signup";

export default function AuthPanel() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setMessage("");

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo:
              typeof window !== "undefined" ? `${window.location.origin}/` : undefined,
          },
        });

        if (error) throw error;

        setMessage(
          "Cuenta creada. Revisa tu correo para confirmar la cuenta si la verificación está activa.",
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setMessage("Inicio de sesión exitoso.");
      }
    } catch (error) {
      const text = error instanceof Error ? error.message : "Error desconocido";
      setMessage(text);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto mt-6 w-full max-w-md rounded-lg border border-border/40 bg-card/80 p-4 shadow-xl backdrop-blur-sm">
      <h3 className="mb-3 text-lg font-semibold text-foreground">Acceso de Legión</h3>
      <div className="mb-3 grid grid-cols-2 gap-2">
        <Button
          type="button"
          variant={mode === "login" ? "default" : "outline"}
          onClick={() => setMode("login")}
        >
          Login
        </Button>
        <Button
          type="button"
          variant={mode === "signup" ? "default" : "outline"}
          onClick={() => setMode("signup")}
        >
          Sign up
        </Button>
      </div>
      <div className="space-y-2">
        <Input
          type="email"
          value={email}
          placeholder="email@dominio.com"
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <Input
          type="password"
          value={password}
          placeholder="Contraseña"
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
        />
      </div>
      <Button type="button" className="mt-3 w-full" disabled={loading} onClick={submit}>
        {loading ? "Procesando..." : mode === "signup" ? "Crear cuenta" : "Entrar"}
      </Button>
      {message ? <p className="mt-2 text-xs text-muted-foreground">{message}</p> : null}
    </section>
  );
}
