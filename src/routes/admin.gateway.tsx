import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { toast } from "sonner";
import { getAdminToken } from "@/lib/adminToken";
import {
  getGatewayConfigFn,
  saveGatewayConfigFn,
} from "@/lib/admin.functions";
import { useServerFn } from "@tanstack/react-start";
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
  const getFn = useServerFn(getGatewayConfigFn);
  const saveFn = useServerFn(saveGatewayConfigFn);

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
        const cfg = await getFn({ data: { token } });
        setAccessToken(cfg.mp_access_token || "");
        setPublicKey(cfg.mp_public_key || "");
        
        setMaxInstallments(cfg.max_installments);
        const merged = defaultFees(cfg.max_installments);
        Object.entries(cfg.installment_fees || {}).forEach(([k, v]) => {
          merged[k] = Number(v) || 0;
        });
        setFees(merged);
      } catch (e) {
        toast.error("Falha ao carregar configuração");
      } finally {
        setLoading(false);
      }
    })();
  }, [getFn]);

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
    if (!token) return toast.error("Sessão admin expirada");
    setSaving(true);
    try {
      const res = await saveFn({
        data: {
          token,
          mp_access_token: accessToken.trim(),
          mp_public_key: publicKey.trim(),
          environment: "production",
          max_installments: maxInstallments,
          installment_fees: fees,
        },
      });
      if (res.ok) toast.success(res.message);
      else toast.error(res.message || "Erro ao salvar");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao salvar");
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
                placeholder="APP_USR-..."
                className="flex-1 h-11 px-3 rounded-xl bg-muted/70 border border-border text-sm font-mono"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowToken((v) => !v)}
                className="h-11 w-11 grid place-items-center rounded-xl border border-border bg-muted/70 hover:bg-muted"
              >
                {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>

          <Field label="Public Key (usada no Checkout do cartão)">
            <input
              type="text"
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
              placeholder="APP_USR-pub-..."
              className="w-full h-11 px-3 rounded-xl bg-muted/70 border border-border text-sm font-mono"
              autoComplete="off"
            />
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
