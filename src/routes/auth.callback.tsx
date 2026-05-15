import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const loginWithGoogle = useStore((s) => s.loginWithGoogle);
  const [msg, setMsg] = useState("Concluindo login...");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Aguarda o Supabase processar o hash/code da URL
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        let session = data.session;

        // Se ainda não veio (pode estar processando), escuta uma vez
        if (!session) {
          session = await new Promise((resolve) => {
            const { data: sub } = supabase.auth.onAuthStateChange(
              (_evt, s) => {
                if (s) {
                  sub.subscription.unsubscribe();
                  resolve(s);
                }
              },
            );
            // timeout 5s
            setTimeout(() => {
              sub.subscription.unsubscribe();
              resolve(null);
            }, 5000);
          });
        }

        if (!session?.user) {
          throw new Error("Sessão não encontrada");
        }

        const email = session.user.email;
        const meta = session.user.user_metadata || {};
        const name =
          meta.full_name || meta.name || (email ? email.split("@")[0] : "Cliente");

        if (!email) throw new Error("E-mail não retornado pelo Google");

        const r = await loginWithGoogle(email, name);
        // Limpa a sessão Supabase — usamos só pra pegar identidade
        await supabase.auth.signOut();

        if (cancelled) return;
        if (r.ok) {
          toast.success(r.message);
          navigate({ to: "/perfil" });
        } else {
          toast.error(r.message);
          navigate({ to: "/login" });
        }
      } catch (e) {
        if (cancelled) return;
        const m = e instanceof Error ? e.message : "Falha ao logar";
        setMsg(m);
        toast.error(m);
        setTimeout(() => navigate({ to: "/login" }), 1500);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate, loginWithGoogle]);

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="text-center space-y-2">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground">{msg}</p>
      </div>
    </div>
  );
}
