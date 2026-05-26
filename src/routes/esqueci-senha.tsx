import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { createResetToken, buildResetUrl } from "@/lib/passwordReset";
import { toast } from "sonner";
import { Loader2, Copy, MessageCircle, Mail } from "lucide-react";

export const Route = createFileRoute("/esqueci-senha")({
  component: Page,
});

function Page() {
  const findAccountByEmail = useStore((s) => s.findAccountByEmail);
  const whatsapp = useStore((s) => s.settings.whatsapp);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [accountPhone, setAccountPhone] = useState<string | undefined>(
    undefined,
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      const account = findAccountByEmail(email);
      if (!account) {
        // Resposta uniforme: não revelar se o email existe
        toast.success(
          "Se este email estiver cadastrado, enviamos o link de recuperação.",
        );
        return;
      }
      const token = await createResetToken(account.kind, account.email);
      const url = buildResetUrl(token);
      setLink(url);
      setAccountPhone(account.phone);
      try {
        const { sendPasswordResetEmail } = await import("@/lib/emails");
        await sendPasswordResetEmail({ email: account.email, resetUrl: url });
        toast.success("Link enviado para seu e-mail! Válido por 30 minutos.");
      } catch {
        toast.success("Link de recuperação gerado! Válido por 30 minutos.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Erro ao gerar link de recuperação");
    } finally {
      setSubmitting(false);
    }
  };

  const copyLink = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    toast.success("Link copiado");
  };

  const whatsappShare = () => {
    if (!link) return;
    const phone = (accountPhone || whatsapp || "").replace(/\D/g, "");
    const msg = encodeURIComponent(
      `Olá! Use este link para redefinir sua senha (válido por 30 min):\n\n${link}`,
    );
    const base = phone
      ? `https://wa.me/${phone.startsWith("55") ? phone : "55" + phone}`
      : "https://wa.me/";
    window.open(`${base}?text=${msg}`, "_blank");
  };

  const emailShare = () => {
    if (!link) return;
    const subject = encodeURIComponent("Redefinição de senha");
    const body = encodeURIComponent(
      `Use este link para redefinir sua senha (válido por 30 min):\n\n${link}`,
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-br from-background via-rose/30 to-accent p-4">
      <div className="w-full max-w-sm bg-card rounded-3xl shadow-soft p-6">
        <h1 className="font-display text-2xl text-primary text-center">
          Recuperar senha
        </h1>
        <p className="text-xs text-muted-foreground text-center mt-1">
          Digite seu e-mail e geramos um link seguro de redefinição.
        </p>

        {!link ? (
          <form onSubmit={submit} className="mt-6 space-y-3">
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground">
                E-mail
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="mt-1 w-full h-11 px-3 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-primary/50"
              />
            </label>
            <button
              disabled={submitting}
              className="w-full h-12 rounded-full gradient-primary text-primary-foreground font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Gerar link de recuperação
            </button>
            <p className="text-[11px] text-muted-foreground text-center pt-2">
              <Link to="/login" className="text-primary underline">
                Voltar ao login
              </Link>
            </p>
          </form>
        ) : (
          <div className="mt-6 space-y-3">
            <div className="rounded-xl border border-border bg-background p-3">
              <p className="text-xs text-muted-foreground mb-1">
                Link gerado (válido por 30 minutos):
              </p>
              <p className="text-xs font-mono break-all text-foreground">
                {link}
              </p>
            </div>
            <button
              onClick={copyLink}
              className="w-full h-11 rounded-full bg-secondary text-secondary-foreground font-semibold inline-flex items-center justify-center gap-2"
            >
              <Copy className="h-4 w-4" /> Copiar link
            </button>
            <button
              onClick={whatsappShare}
              className="w-full h-11 rounded-full bg-[#25D366] text-white font-semibold inline-flex items-center justify-center gap-2"
            >
              <MessageCircle className="h-4 w-4" /> Enviar por WhatsApp
            </button>
            <button
              onClick={emailShare}
              className="w-full h-11 rounded-full bg-primary text-primary-foreground font-semibold inline-flex items-center justify-center gap-2"
            >
              <Mail className="h-4 w-4" /> Enviar por e-mail
            </button>
            <p className="text-[11px] text-muted-foreground text-center pt-2">
              Após redefinir, faça login normalmente.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
