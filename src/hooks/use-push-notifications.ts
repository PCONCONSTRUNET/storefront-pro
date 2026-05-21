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
      allowLocalhostAsSecureOrigin: true,
      // Service Worker em scope padrão (raiz) — arquivo já existe em /public/
      autoRegister: false,
      autoResubscribe: true,
      welcomeNotification: { disable: true },
      notifyButton: { enable: false },
    } as unknown as Parameters<typeof OneSignal.init>[0]);
    console.log('[push] OneSignal init OK');
  })();

  return oneSignalInitPromise;
}

/**
 * Aguarda o player_id (subscription ID) aparecer após optIn.
 * Usa event listener + polling para máxima confiabilidade no iOS/Android.
 */
function waitForPlayerId(timeoutMs = 12000): Promise<string | null> {
  const existing = (OneSignal as any).User?.PushSubscription?.id ?? null;
  if (existing) return Promise.resolve(existing);

  return new Promise((resolve) => {
    let resolved = false;
    const finish = (id: string | null) => {
      if (resolved) return;
      resolved = true;
      resolve(id);
    };

    // Event listener — dispara imediatamente quando o token APNs/FCM chega
    try {
      (OneSignal as any).User?.PushSubscription?.addEventListener(
        'change',
        (event: { current: { id: string | null; optedIn: boolean } }) => {
          if (event.current.id) finish(event.current.id);
        }
      );
    } catch {/* noop */}

    // Polling a cada 100ms como fallback
    const start = Date.now();
    const poll = () => {
      if (resolved) return;
      const id = (OneSignal as any).User?.PushSubscription?.id ?? null;
      if (id) {
        console.log(`[push] player_id em ${Date.now() - start}ms`);
        finish(id);
        return;
      }
      if (Date.now() - start > timeoutMs) { finish(null); return; }
      setTimeout(poll, 100);
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
        const id = OS.User?.PushSubscription?.id ?? null;
        setSubscribed(isOptedIn);
        setPlayerId(id);

        // Escuta mudanças futuras (ex: usuário revoga permissão)
        OS.User?.PushSubscription?.addEventListener(
          'change',
          (event: { current: { optedIn: boolean; id: string | null } }) => {
            setSubscribed(event.current.optedIn);
            setPlayerId(event.current.id);
          }
        );

        // Se já tem permissão mas não está subscrito, tenta optIn silencioso
        if (Notification.permission === 'granted' && !isOptedIn) {
          console.log('[push] Permissão já concedida mas não inscrito — optIn silencioso');
          try {
            await OS?.User?.PushSubscription?.optIn?.();
            const pid = await waitForPlayerId(5000);
            if (pid) {
              setPlayerId(pid);
              setSubscribed(true);
              // Login no OneSignal com o ID correto
              const osUserId = role === 'admin' ? 'admin-user' : userId;
              if (osUserId) {
                await OS?.login?.(osUserId);
                OS?.User?.addTag?.('role', role);
              }
            }
          } catch {/* noop */}
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

      // OptIn imediato + aguarda o token chegar
      OS?.User?.PushSubscription?.optIn?.().catch(() => {/* noop */});
      const pid = await waitForPlayerId(12000);

      if (pid) {
        setPlayerId(pid);
        setSubscribed(true);

        // Vincula ao usuário correto no OneSignal
        const osUserId = role === 'admin' ? 'admin-user' : userId;
        if (osUserId) {
          await OS?.login?.(osUserId);
          OS?.User?.addTag?.('role', role);
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
              externalUserIds: [osUserId ?? pid],
            },
          }).catch(e => console.warn('[push] welcome push falhou:', e));
        }, 1500);

        return true;
      }

      console.error('[push] ❌ player_id não chegou após 12s');
      return false;
    } catch (err) {
      console.error('[push] enable error:', err);
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
