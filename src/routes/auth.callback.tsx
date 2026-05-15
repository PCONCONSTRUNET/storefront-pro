import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import type { Session } from "@supabase/supabase-js";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

const GOOGLE_OAUTH_RETRY_KEY = "princesa_google_oauth_retry";

function cleanAuthCallbackUrl() {
  const cleanUrl = `${window.location.origin}/auth/callback`;
  window.history.replaceState(window.history.state, "", cleanUrl);
}

function isPkceVerifierMissing(error: unknown) {
  return (
    error instanceof Error &&
    error.message.toLowerCase().includes("code verifier")
  );
}

function getStoredPkceVerifier() {
  for (const storage of [window.localStorage, window.sessionStorage]) {
    try {
      for (let i = 0; i < storage.length; i += 1) {
        const key = storage.key(i);
        if (key?.includes("code-verifier") && storage.getItem(key)) return true;
      }
    } catch {}
  }
  return false;
}

function clearStoredPkceVerifier() {
  for (const storage of [window.localStorage, window.sessionStorage]) {
    try {
      for (let i = storage.length - 1; i >= 0; i -= 1) {
        const key = storage.key(i);
        if (key?.includes("code-verifier")) storage.removeItem(key);
      }
    } catch {}
  }
}

function AuthCallback() {
  const navigate = useNavigate();
  const loginWithGoogle = useStore((s) => s.loginWithGoogle);
  const [msg, setMsg] = useState("Concluindo login...");

  useEffect(() => {
    let cancelled = false;

    const waitForSession = async () => {
      const url = new URL(window.location.href);
      const urlError =
        url.searchParams.get("error_description") ||
        url.searchParams.get("error") ||
        new URLSearchParams(url.hash.replace(/^#/, "")).get(
          "error_description",
        );
      if (urlError) throw new Error(decodeURIComponent(urlError));

      // PKCE flow: troca o ?code=... por sessão
      const code = url.searchParams.get("code");
      if (code) {
        if (!getStoredPkceVerifier()) {
          throw new Error("GOOGLE_PKCE_RETRY");
        }
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (isPkceVerifierMissing(error)) {
          throw new Error("GOOGLE_PKCE_RETRY");
        }
        if (error) throw error;
        if (data.session) return data.session;
      }

      const first = await supabase.auth.getSession();
      if (first.error) throw first.error;
      if (first.data.session) return first.data.session;

      return await new Promise<Session | null>((resolve) => {
        let settled = false;
        let subscription: { unsubscribe: () => void } | null = null;
        const finish = (session: Session | null) => {
          if (settled) return;
          settled = true;
          window.clearTimeout(timeout);
          subscription?.unsubscribe();
          resolve(session);
        };
        const timeout = window.setTimeout(() => finish(null), 8000);
        const { data: sub } = supabase.auth.onAuthStateChange(
          (_evt, session) => {
            if (session) finish(session);
          },
        );
        subscription = sub.subscription;
      });
    };

    (async () => {
      try {
        const session = await waitForSession();

        if (!session?.user) {
          throw new Error("Sessão não encontrada");
        }

        const email = session.user.email;
        const meta = session.user.user_metadata || {};
        const name =
          meta.full_name ||
          meta.name ||
          (email ? email.split("@")[0] : "Cliente");

        if (!email) throw new Error("E-mail não retornado pelo Google");

        const r = await loginWithGoogle(email, name);
        // Limpa a sessão Supabase — usamos só pra pegar identidade
        await supabase.auth.signOut();
        sessionStorage.removeItem(GOOGLE_OAUTH_RETRY_KEY);
        cleanAuthCallbackUrl();

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
        cleanAuthCallbackUrl();
        if (e instanceof Error && e.message === "GOOGLE_PKCE_RETRY") {
          clearStoredPkceVerifier();
          const hasRetried = sessionStorage.getItem(GOOGLE_OAUTH_RETRY_KEY);
          if (!hasRetried) {
            sessionStorage.setItem(GOOGLE_OAUTH_RETRY_KEY, "1");
            setMsg("Reconectando com Google...");
            const { error } = await supabase.auth.signInWithOAuth({
              provider: "google",
              options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                queryParams: { prompt: "select_account" },
              },
            });
            if (!error) return;
          }
          sessionStorage.removeItem(GOOGLE_OAUTH_RETRY_KEY);
          const m = "Não consegui concluir o login. Tente entrar com Google novamente.";
          setMsg(m);
          toast.error(m);
          setTimeout(() => navigate({ to: "/login" }), 1500);
          return;
        }
        const m =
          e instanceof Error && e.message.trim() ? e.message : "Falha ao logar";
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
