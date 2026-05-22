import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { toast } from "sonner";
import { getAdminToken } from "@/lib/adminToken";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Eye, EyeOff, Copy, Check, X } from "lucide-react";

export const Route = createFileRoute("/admin/gateway")({
  component: Page,
});



const WEBHOOK_URL =
  "https://glezvjgtzplflzevclor.supabase.co/functions/v1/mp-webhook";

function defaultFees(max: number): Record<string, number> {
  const out: Record<string, number> = {};
  for (let i = 1; i <= max; i++) out[String(i)] = 0;
  return out;
}

function Page() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);

  const [accessToken, setAccessToken] = useState("");
  const [publicKey, setPublicKey] = useState("");
  
  const [maxInstallments, setMaxInstallments] = useState(3);
  const [fees, setFees] = useState<Record<string, number>>(defaultFees(3));

  useEffect(() => {
    (async () => {
      const token = getAdminToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await (supabase as any).rpc(
          "admin_get_payment_gateway",
          { _token: token },
        );
        if (error) throw new Error(error.message);
        const row = Array.isArray(data) ? data[0] : data;
        setAccessToken(row?.mp_access_token || "");
        setPublicKey(row?.mp_public_key || "");
        const maxInst = Number(row?.max_installments ?? 3);
        setMaxInstallments(maxInst);
        const merged = defaultFees(maxInst);
        Object.entries((row?.installment_fees as Record<string, number>) || {}).forEach(
          ([k, v]) => { merged[k] = Number(v) || 0; },
        );
        setFees(merged);
      } catch (e) {
        console.error("[gateway] load error", e);
        toast.error(e instanceof Error ? e.message : "Falha ao carregar configuração");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleMaxChange = (n: number) => {
    const v = Math.max(1, Math.min(12, n));
    setMaxInstallments(v);
    setFees((prev) => {
      const next = defaultFees(v);
      Object.entries(prev).forEach(([k, val]) => {
        if (Number(k) <= v) next[k] = val;
      });
      return next;
    });
  };

  const save = async () => {
    const token = getAdminToken();
    if (!token) return toast.error("Sessão admin expirada — faça login novamente");
    setSaving(true);
    try {
      const payload = {
        token,
        mp_access_token: accessToken.trim(),
        mp_public_key: publicKey.trim(),
        environment: "production" as const,
        max_installments: maxInstallments,
        installment_fees: fees,
      };
      console.log("[gateway] saving", { ...payload, token: "***", mp_access_token: payload.mp_access_token ? `len=${payload.mp_access_token.length}` : "(vazio)" });
      const res = await saveFn({ data: payload });
      console.log("[gateway] save response", res);
      if (res.ok) toast.success(res.message);
      else toast.error(res.message || "Erro ao salvar", { duration: 8000 });
    } catch (e) {
      console.error("[gateway] save error", e);
      toast.error(e instanceof Error ? e.message : "Erro ao salvar", { duration: 8000 });
    } finally {
      setSaving(false);
    }
  };

  const copyWebhook = async () => {
    await navigator.clipboard.writeText(WEBHOOK_URL);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <AdminLayout title="Gateway de pagamento">
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" /> Carregando…
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Gateway de pagamento">
      <div className="space-y-4 max-w-3xl">
        <Card title="Credenciais Mercado Pago">
          <p className="text-xs text-muted-foreground mb-3">
            Acesse{" "}
            <a
              href="https://www.mercadopago.com.br/developers/panel/app"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline"
            >
              Mercado Pago → Suas integrações
            </a>{" "}
            e cole as credenciais da sua aplicação.
          </p>

          <Field label="Access Token (APP_USR-...)">
            <div className="flex gap-2">
              <input
                type={showToken ? "text" : "password"}
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                onFocus={() => setShowToken(true)}
                placeholder="APP_USR-..."
                className="flex-1 h-11 px-3 rounded-xl bg-muted/70 border border-border text-sm font-mono"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setShowToken((v) => !v)}
                title={showToken ? "Ocultar" : "Mostrar"}
                className="h-11 w-11 grid place-items-center rounded-xl border border-border bg-muted/70 hover:bg-muted"
              >
                {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => { setAccessToken(""); setShowToken(true); }}
                title="Limpar para colar novo token"
                className="h-11 w-11 grid place-items-center rounded-xl border border-border bg-muted/70 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Clique no <strong>X</strong> para limpar e colar um novo token.
            </p>
          </Field>

          <Field label="Public Key (usada no Checkout do cartão)">
            <div className="flex gap-2">
              <input
                type="text"
                value={publicKey}
                onChange={(e) => setPublicKey(e.target.value)}
                placeholder="APP_USR-pub-..."
                className="flex-1 h-11 px-3 rounded-xl bg-muted/70 border border-border text-sm font-mono"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="button"
                onClick={() => setPublicKey("")}
                title="Limpar"
                className="h-11 w-11 grid place-items-center rounded-xl border border-border bg-muted/70 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </Field>
        </Card>

        <Card title="Webhook do Mercado Pago">
          <p className="text-xs text-muted-foreground mb-2">
            Cole esta URL em <strong>Notificações → Webhooks</strong> no painel do
            Mercado Pago e marque o evento <strong>Pagamentos</strong>:
          </p>
          <div className="flex gap-2">
            <input
              readOnly
              value={WEBHOOK_URL}
              className="flex-1 h-11 px-3 rounded-xl bg-muted/70 border border-border text-xs font-mono"
            />
            <button
              type="button"
              onClick={copyWebhook}
              className="h-11 px-3 rounded-xl border border-border bg-muted/70 hover:bg-muted flex items-center gap-1 text-sm"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
        </Card>

        <Card title="Parcelamento no cartão">
          <Field label="Nº máximo de parcelas (1 a 12)">
            <input
              type="number"
              min={1}
              max={12}
              value={maxInstallments}
              onChange={(e) => handleMaxChange(parseInt(e.target.value) || 1)}
              className="w-32 h-11 px-3 rounded-xl bg-muted/70 border border-border text-sm"
            />
          </Field>
          <p className="text-xs text-muted-foreground mt-2 mb-2">
            Defina a <strong>taxa em % por nº de parcelas</strong> que será somada
            ao total do pedido. Use <code>0</code> para "sem juros".
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {Array.from({ length: maxInstallments }, (_, i) => i + 1).map((n) => (
              <label key={n} className="block">
                <span className="text-[11px] font-medium text-muted-foreground">
                  {n}x
                </span>
                <div className="flex items-center gap-1 mt-1">
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    max={100}
                    value={fees[String(n)] ?? 0}
                    onChange={(e) =>
                      setFees((prev) => ({
                        ...prev,
                        [String(n)]: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-full h-10 px-2 rounded-lg bg-muted/70 border border-border text-sm"
                  />
                  <span className="text-xs text-muted-foreground">%</span>
                </div>
              </label>
            ))}
          </div>
        </Card>

        <div className="flex justify-end">
          <button
            onClick={save}
            disabled={saving}
            className="h-11 px-6 rounded-full gradient-primary text-primary-foreground font-semibold disabled:opacity-60 flex items-center gap-2"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Salvar configuração
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl p-5 shadow-card">
      <h3 className="font-semibold mb-3">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
