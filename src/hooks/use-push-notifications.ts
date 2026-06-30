import { useEffect, useState, useCallback, useRef } from 'react';
import OneSignal from 'react-onesignal';
import { supabase } from '@/integrations/supabase/client';

type Role = 'admin' | 'cliente';

interface UsePushOptions {
  role: Role;
  userId?: string | null; // null/undefined para admin
  autoInit?: boolean;
}

// Singleton — init só acontece uma vez
let oneSignalInitPromise: Promise<void> | null = null;

const ONESIGNAL_APP_ID = '2daa3ed9-be86-4bc9-9819-4d641aea75d5';

function isInPreviewIframe(): boolean {
  try {
    const inIframe = window.self !== window.top;
    const host = window.location.hostname;
    const isPreviewHost =
      host.includes('id-preview--') || host.includes('lovableproject.com');
    return inIframe || isPreviewHost;
  } catch {
    return true;
  }
}

async function initOneSignal(): Promise<void> {
  if (oneSignalInitPromise) return oneSignalInitPromise;

  oneSignalInitPromise = (async () => {
    console.log('[push] Inicializando OneSignal:', ONESIGNAL_APP_ID);
    await OneSignal.init({
      appId: ONESIGNAL_APP_ID,
      safari_web_id: "web.onesignal.auto.47a2f439-afd3-4bb7-8cdd-92cc4f5ee46c",
      allowLocalhostAsSecureOrigin: true,
      autoResubscribe: true,
      welcomeNotification: { disable: true },
      notifyButton: { enable: false },
    } as unknown as Parameters<typeof OneSignal.init>[0]);
    console.log('[push] OneSignal init OK');
  })();

  return oneSignalInitPromise;
}

/**
 * Aguarda um player_id REAL (sem prefixo "local-") após optIn.
 * IDs "local-" são temporários gerados quando o FCM ainda não registrou.
 * Usa event listener + polling para máxima confiabilidade no Android/iOS.
 */
function waitForPlayerId(timeoutMs = 15000): Promise<string | null> {
  const existing = (OneSignal as any).User?.PushSubscription?.id ?? null;
  // Ignora IDs "local-" — eles são placeholders sem token FCM real
  if (existing && !existing.startsWith('local-')) return Promise.resolve(existing);

  return new Promise((resolve) => {
    let resolved = false;
    const finish = (id: string | null) => {
      if (resolved) return;
      resolved = true;
      resolve(id);
    };

    // Event listener — dispara quando o token FCM real chega do servidor
    try {
      (OneSignal as any).User?.PushSubscription?.addEventListener(
        'change',
        (event: { current: { id: string | null; optedIn: boolean } }) => {
          const newId = event.current.id;
          // Só aceita IDs reais (sem prefixo "local-")
          if (newId && !newId.startsWith('local-')) {
            console.log('[push] token FCM real recebido via evento:', newId);
            finish(newId);
          }
        }
      );
    } catch {/* noop */}

    // Polling a cada 200ms como fallback
    const start = Date.now();
    const poll = () => {
      if (resolved) return;
      const id = (OneSignal as any).User?.PushSubscription?.id ?? null;
      if (id && !id.startsWith('local-')) {
        console.log(`[push] token FCM real em ${Date.now() - start}ms:`, id);
        finish(id);
        return;
      }
      if (Date.now() - start > timeoutMs) {
        const finalId = (OneSignal as any).User?.PushSubscription?.id ?? null;
        console.warn('[push] timeout — ID final:', finalId);
        finish(null);
        return;
      }
      setTimeout(poll, 200);
    };
    poll();
  });
}

export function usePushNotifications({ role, userId, autoInit = true }: UsePushOptions) {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'default'>('default');
  const [loading, setLoading] = useState(true);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const initStartedRef = useRef(false);

  useEffect(() => {
    if (!autoInit) { setLoading(false); return; }
    if (initStartedRef.current) return;
    initStartedRef.current = true;

    const setup = async () => {
      try {
        if (isInPreviewIframe()) { setSupported(false); setLoading(false); return; }

        if (!('Notification' in window) || !('serviceWorker' in navigator)) {
          setSupported(false); setLoading(false); return;
        }

        setSupported(true);
        setPermission(Notification.permission);

        await initOneSignal();
        setInitialized(true);

        const OS = OneSignal as any;
        const isOptedIn = OS.User?.PushSubscription?.optedIn ?? false;
        const rawId = OS.User?.PushSubscription?.id ?? null;
        // IDs com prefixo "local-" são placeholders — o FCM ainda não registrou
        const isRealId = rawId && !rawId.startsWith('local-');
        setSubscribed(isOptedIn && isRealId);
        setPlayerId(isRealId ? rawId : null);

        // Escuta mudanças futuras (ex: usuário revoga permissão ou FCM registra)
        OS.User?.PushSubscription?.addEventListener(
          'change',
          (event: { current: { optedIn: boolean; id: string | null } }) => {
            const newId = event.current.id;
            const newIsReal = newId && !newId.startsWith('local-');
            setSubscribed(event.current.optedIn && !!newIsReal);
            setPlayerId(newIsReal ? newId : null);
          }
        );

        // Se tem permissão mas ID é local- ou não está inscrito, força re-registro
        if (Notification.permission === 'granted' && (!isOptedIn || !isRealId)) {
          console.log('[push] Permissão concedida mas sem token FCM real — forçando re-registro');
          try {
            // Ciclo optOut → optIn para forçar novo registro com FCM
            if (isOptedIn && !isRealId) {
              await OS?.User?.PushSubscription?.optOut?.();
              await new Promise(r => setTimeout(r, 500));
            }
            await OS?.User?.PushSubscription?.optIn?.();
            const pid = await waitForPlayerId(15000);
            if (pid) {
              setPlayerId(pid);
              setSubscribed(true);
              const osUserId = role === 'admin' ? 'admin-user' : userId;
              if (osUserId) {
                await OS?.login?.(osUserId);
                OS?.User?.addTags?.({ role, ...(osUserId !== 'admin-user' ? { customer_id: osUserId } : {}) });
              }
              console.log('[push] ✅ re-registro silencioso OK, pid=', pid);
            } else {
              console.warn('[push] re-registro silencioso: token FCM não chegou em 15s');
            }
          } catch (e) { console.warn('[push] re-registro silencioso falhou:', e); }
        }
      } catch (err) {
        console.error('[push] setup error:', err);
      } finally {
        setLoading(false);
      }
    };

    setup();
  }, [autoInit, role, userId]);

  const enable = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    console.log('[push] enable() iniciado, role=', role);
    try {
      if (!initialized) {
        await initOneSignal();
        setInitialized(true);
      }

      const OS = OneSignal as any;

      if ('Notification' in window && Notification.permission === 'denied') {
        setPermission('denied');
        return false;
      }

      // Pede permissão (não esperamos o await — só o estado de Notification.permission)
      OS.Notifications.requestPermission().catch(() => {/* noop */});

      // Poll até permissão mudar (máx 8s)
      const waitForPermission = async (): Promise<NotificationPermission> => {
        const start = Date.now();
        while (Date.now() - start < 8000) {
          const p = 'Notification' in window ? Notification.permission : 'default';
          if (p !== 'default') return p;
          await new Promise(r => setTimeout(r, 50));
        }
        return Notification.permission;
      };
      const perm = await waitForPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        console.warn('[push] permissão não concedida');
        return false;
      }

      // Verifica se já existe um ID local- (precisa de re-registro)
      const currentId = OS?.User?.PushSubscription?.id ?? null;
      const hasLocalId = currentId && currentId.startsWith('local-');

      if (hasLocalId) {
        console.log('[push] ID local- detectado, forçando optOut → optIn para obter token FCM real');
        try {
          await OS?.User?.PushSubscription?.optOut?.();
          await new Promise(r => setTimeout(r, 800));
        } catch {/* noop */}
      }

      // OptIn + aguarda token FCM REAL (sem prefixo local-)
      OS?.User?.PushSubscription?.optIn?.().catch(() => {/* noop */});
      const pid = await waitForPlayerId(20000);

      if (pid) {
        setPlayerId(pid);
        setSubscribed(true);

        // Vincula ao usuário correto no OneSignal
        const osUserId = role === 'admin' ? 'admin-user' : userId;
        if (osUserId) {
          await OS?.login?.(osUserId);
          await OS?.User?.addTags?.({ role, ...(osUserId !== 'admin-user' ? { customer_id: osUserId } : {}) });
        }

        console.log('[push] ✅ inscrição completa, pid=', pid);

        // Push de boas-vindas (fire-and-forget)
        setTimeout(() => {
          supabase.functions.invoke('send-push', {
            body: {
              title: '🔔 Notificações ativadas!',
              message: role === 'admin'
                ? 'Admin: você receberá avisos de pedidos e pagamentos 💰'
                : 'Você vai receber avisos dos seus pedidos 💖',
              subscriptionIds: [pid],
            },
          }).catch(e => console.warn('[push] welcome push falhou:', e));
        }, 2000);

        return true;
      }

      console.error('[push] ❌ token FCM real não chegou após 20s. ID atual:', OS?.User?.PushSubscription?.id);
      return false;
    } catch (err) {
      console.error('[push] enable error:', err);
      const el = document.getElementById("os-debug-log");
      if (el) {
        el.style.display = "block";
        el.innerText = `Erro Push:\n${err?.toString() || "Desconhecido"}`;
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, [initialized, role, userId]);

  const disable = useCallback(async (): Promise<boolean> => {
    if (!initialized) return false;
    try {
      setLoading(true);
      await (OneSignal as any)?.User?.PushSubscription?.optOut?.();
      setSubscribed(false);
      setPlayerId(null);
      return true;
    } catch (err) {
      console.error('[push] disable error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [initialized]);

  return { supported, subscribed, permission, loading, playerId, enable, disable };
}
