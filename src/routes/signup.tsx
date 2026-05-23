import { createFileRoute } from "@tanstack/react-router";
import AuthForm from "@/components/AuthForm";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-6xl items-center px-4 py-16">
      <AuthForm mode="signup" />
    </main>
  );
}
