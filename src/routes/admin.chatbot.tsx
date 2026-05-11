import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import {
  MessageCircle,
  RefreshCw,
  LogOut,
  CheckCircle2,
  Loader2,
  QrCode,
  Send,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchBotStatus,
  logoutBot,
  notifyWhatsApp,
  getBotLogs,
  clearBotLogs,
  type BotStatus,
  type BotNotificationLog,
  WHATSAPP_BOT_BASE_URL,
} from "@/lib/whatsappBot";

export const Route = createFileRoute("/admin/chatbot")({
  head: () => ({ meta: [{ title: "Chatbot WhatsApp — Admin" }] }),
  component: Page,
});

function Page() {
  const [status, setStatus] = useState<BotStatus>("UNKNOWN");
  const [qrcode, setQrcode] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);
  const [logs, setLogs] = useState<BotNotificationLog[]>(() => getBotLogs());

  // Test sender
  const [testNumber, setTestNumber] = useState("");
  const [testMessage, setTestMessage] = useState(
    "Olá! Mensagem de validação da Princesa de Laços 💖",
  );
  const [sending, setSending] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const poll = async () => {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      const r = await fetchBotStatus(ac.signal);
      setStatus(r.status);
      setQrcode(r.qrcode);
      setError(null);
      setLastUpdate(Date.now());
    } catch (e) {
      if ((e as any)?.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Falha ao consultar o bot");
      setStatus("UNKNOWN");
    }
  };

  useEffect(() => {
    poll();
    const id = setInterval(poll, 5000);
    return () => {
      clearInterval(id);
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    const onUpd = () => setLogs(getBotLogs());
    window.addEventListener("whatsapp-bot-logs-updated", onUpd);
    return () => window.removeEventListener("whatsapp-bot-logs-updated", onUpd);
  }, []);

  const handleLogout = async () => {
    if (
      !confirm(
        "Tem certeza que deseja desconectar o WhatsApp? A sessão será encerrada.",
      )
    )
      return;
    setLoadingLogout(true);
    try {
      await logoutBot();
      toast.success("Sessão encerrada. Reiniciando bot...");
      setTimeout(poll, 1500);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao desconectar");
    } finally {
      setLoadingLogout(false);
    }
  };

  const handleSendTest = async () => {
    const numero = testNumber.replace(/\D/g, "");
    if (numero.length < 10) {
      toast.error("Informe um número válido com DDD");
      return;
    }
    if (!testMessage.trim()) {
      toast.error("Mensagem vazia");
      return;
    }
    setSending(true);
    try {
      const r = await notifyWhatsApp(numero, testMessage.trim());
      if (r.ok) toast.success("Notificação enviada");
      else toast.error(`Falha (${r.status})`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao enviar");
    } finally {
      setSending(false);
    }
  };

  const qrSrc = qrcode
    ? qrcode.startsWith("data:")
      ? qrcode
      : `data:image/png;base64,${qrcode}`
    : undefined;

  return (
    <AdminLayout title="Chatbot WhatsApp">
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Header card */}
        <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4 shadow-card">
          <div className="h-12 w-12 rounded-xl bg-primary/10 grid place-items-center text-primary">
            <MessageCircle className="h-6 w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display text-xl">
              Princesa de Laços · WhatsApp
            </div>
            <div className="text-xs text-muted-foreground truncate">
              Endpoint: {WHATSAPP_BOT_BASE_URL}
            </div>
          </div>
          <button
            onClick={poll}
            className="h-9 px-3 rounded-full bg-muted hover:bg-muted/70 text-sm font-medium flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" /> Atualizar
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Status / QR */}
          <div className="bg-card rounded-2xl border border-border p-5 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">Conexão</h2>
              <StatusBadge status={status} />
            </div>

            <div className="min-h-[280px] grid place-items-center bg-muted/30 rounded-xl p-4">
              {error ? (
                <div className="text-center text-sm text-destructive flex flex-col items-center gap-2">
                  <AlertCircle className="h-8 w-8" />
                  <div className="font-semibold">
                    Não foi possível conectar à API
                  </div>
                  <div className="text-xs text-muted-foreground max-w-xs">
                    {error}
                  </div>
                </div>
              ) : status === "CONNECTED" ? (
                <div className="text-center flex flex-col items-center gap-2">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                  <div className="font-semibold text-lg">
                    ✅ WhatsApp Conectado
                  </div>
                  <div className="text-xs text-muted-foreground">
                    O bot está pronto para enviar e receber mensagens.
                  </div>
                </div>
              ) : status === "QR_READY" && qrSrc ? (
                <div className="text-center flex flex-col items-center gap-3">
                  <img
                    src={qrSrc}
                    alt="QR Code WhatsApp"
                    className="w-56 h-56 rounded-lg bg-white p-2"
                  />
                  <div className="text-xs text-muted-foreground max-w-xs">
                    Abra o WhatsApp → Configurações → Aparelhos conectados →
                    Conectar aparelho
                  </div>
                </div>
              ) : status === "CONNECTING" ? (
                <div className="text-center flex flex-col items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <div className="font-semibold">⏳ Iniciando conexão...</div>
                </div>
              ) : (
                <div className="text-center flex flex-col items-center gap-2 text-muted-foreground">
                  <QrCode className="h-10 w-10" />
                  <div className="text-sm">Aguardando status do bot...</div>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-[11px] text-muted-foreground">
                {lastUpdate
                  ? `Atualizado às ${new Date(lastUpdate).toLocaleTimeString("pt-BR")}`
                  : "—"}
              </div>
              <button
                onClick={handleLogout}
                disabled={loadingLogout || status === "UNKNOWN"}
                className="h-9 px-3 rounded-full bg-destructive/10 text-destructive text-sm font-semibold flex items-center gap-2 hover:bg-destructive/20 disabled:opacity-50"
              >
                {loadingLogout ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                Desconectar WhatsApp
              </button>
            </div>
          </div>

          {/* Envio teste */}
          <div className="bg-card rounded-2xl border border-border p-5 shadow-card">
            <h2 className="font-bold mb-4">Enviar notificação de teste</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Número (com DDD)
                </label>
                <input
                  value={testNumber}
                  onChange={(e) => setTestNumber(e.target.value)}
                  placeholder="5511999999999"
                  className="mt-1 w-full h-10 px-3 rounded-xl border border-border bg-background text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">
                  Mensagem
                </label>
                <textarea
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  rows={5}
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-border bg-background text-sm resize-none"
                />
              </div>
              <button
                onClick={handleSendTest}
                disabled={sending || status !== "CONNECTED"}
                className="w-full h-11 rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Enviar
              </button>
              {status !== "CONNECTED" && (
                <div className="text-[11px] text-muted-foreground text-center">
                  Conecte o WhatsApp para enviar mensagens.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Logs */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold">Histórico de envios</h2>
            <button
              onClick={() => {
                clearBotLogs();
                setLogs([]);
              }}
              className="h-8 px-3 rounded-full bg-muted text-xs font-medium flex items-center gap-1 hover:bg-muted/70"
            >
              <Trash2 className="h-3.5 w-3.5" /> Limpar
            </button>
          </div>
          {logs.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-6">
              Nenhuma notificação enviada ainda.
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {logs.map((l) => (
                <li key={l.id} className="py-3 flex items-start gap-3">
                  <div
                    className={`mt-0.5 h-7 w-7 rounded-full grid place-items-center shrink-0 ${l.ok ? "bg-green-100 text-green-700" : "bg-destructive/10 text-destructive"}`}
                  >
                    {l.ok ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold">{l.numero}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${l.ok ? "bg-green-100 text-green-700" : "bg-destructive/10 text-destructive"}`}
                      >
                        {l.ok ? `OK ${l.status}` : `ERRO ${l.status || "—"}`}
                      </span>
                      <span className="text-[11px] text-muted-foreground ml-auto">
                        {new Date(l.at).toLocaleString("pt-BR")}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {l.mensagem}
                    </div>
                    {l.error && (
                      <div className="text-[11px] text-destructive mt-1 break-all">
                        {l.error}
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

function StatusBadge({ status }: { status: BotStatus }) {
  const map: Record<BotStatus, { label: string; cls: string }> = {
    CONNECTED: { label: "Conectado", cls: "bg-green-100 text-green-700" },
    QR_READY: { label: "Aguardando QR", cls: "bg-amber-100 text-amber-700" },
    CONNECTING: { label: "Conectando", cls: "bg-blue-100 text-blue-700" },
    DISCONNECTED: {
      label: "Desconectado",
      cls: "bg-muted text-muted-foreground",
    },
    UNKNOWN: { label: "Desconhecido", cls: "bg-muted text-muted-foreground" },
  };
  const m = map[status];
  return (
    <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold ${m.cls}`}>
      {m.label}
    </span>
  );
}
