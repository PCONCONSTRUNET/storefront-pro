import { useEffect, useState, useCallback, useRef } from 'react';
import OneSignal from 'react-onesignal';
import { supabase } from '@/integrations/supabase/client';

type Role = 'admin' | 'cliente';

interface UsePushOptions {
  role: Role;
  userId?: string | null;
  autoInit?: boolean;
}

// Singleton — init só acontece uma vez por sessão
let oneSignalInitPromise: Promise<void> | null = null;

export const ONESIGNAL_APP_ID = "63b84a50-f1ec-4940-97aa-a72bfc1f9a2e";

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
      safari_web_id: 'web.onesignal.auto.34e4584e-b851-4129-9188-f0d7c790d3df',
      allowLocalhostAsSecureOrigin: true,
      autoResubscribe: true,
      welcomeNotification: { disable: true },
      notifyButton: { enable: false },
    } as unknown as Parameters<typeof OneSignal.init>[0]);
    console.log('[push] OneSignal init OK');
  })();

  return oneSignalInitPromise;
}

/** Vincula o dispositivo ao usuário no OneSignal e seta a tag de role */
async function linkUser(OS: any, role: Role, userId: string | null | undefined) {
  try {
    const osUserId = role === 'admin' ? 'admin-user' : userId;
    if (osUserId) {
      await OS?.login?.(osUserId);
      await OS?.User?.addTags?.({
        role,
        ...(osUserId !== 'admin-user' ? { customer_id: osUserId } : {}),
      });
      console.log('[push] usuario vinculado:', osUserId, 'role:', role);
    }
  } catch (e) {
    console.warn('[push] linkUser falhou:', e);
  }
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

        // Pequena espera para o OneSignal restaurar estado do IndexedDB (importante no reload)
        await new Promise(r => setTimeout(r, 300));

        const OS = OneSignal as any;
        const sub = OS.User?.PushSubscription;
        const isOptedIn: boolean = sub?.optedIn ?? false;
        const currentId: string | null = sub?.id ?? null;

        // Atualiza estado com o que temos AGORA (pode ser local- ou real)
        setSubscribed(isOptedIn);
        setPlayerId(currentId);

        console.log('[push] setup — optedIn:', isOptedIn, 'id:', currentId);


        // Escuta mudanças futuras (FCM sync, revogação de permissão, etc.)
        sub?.addEventListener(
          'change',
          (event: { current: { optedIn: boolean; id: string | null } }) => {
            console.log('[push] subscription change:', event.current);
            setSubscribed(event.current.optedIn);
            setPlayerId(event.current.id);
          }
        );

        // Se já tem permissão mas não está inscrito, faz optIn silencioso
        if (Notification.permission === 'granted' && !isOptedIn) {
          console.log('[push] permissão concedida mas não inscrito — optIn silencioso');
          try {
            await sub?.optIn?.();
            const newOptedIn = OS.User?.PushSubscription?.optedIn ?? false;
            const newId = OS.User?.PushSubscription?.id ?? null;
            setSubscribed(newOptedIn);
            setPlayerId(newId);
            if (newOptedIn) {
              await linkUser(OS, role, userId);
            }
          } catch (e) {
            console.warn('[push] optIn silencioso falhou:', e);
          }
        }

        // Se já inscrito mas sem vinculação de usuário, tenta vincular
        if (isOptedIn) {
          await linkUser(OS, role, userId);
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

      // Pede permissão nativa — DEVE ser chamado sem await antes (gesto do usuário)
      OS.Notifications.requestPermission().catch(() => {/* noop */});

      // Poll até permissão mudar (máx 10s)
      const waitForPermission = async (): Promise<NotificationPermission> => {
        const start = Date.now();
        while (Date.now() - start < 10000) {
          const p = 'Notification' in window ? Notification.permission : 'default';
          if (p !== 'default') return p;
          await new Promise(r => setTimeout(r, 100));
        }
        return Notification.permission;
      };
      const perm = await waitForPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        console.warn('[push] permissão não concedida:', perm);
        return false;
      }

      // Faz optIn — o OneSignal vai registrar com FCM
      try {
        await OS?.User?.PushSubscription?.optIn?.();
      } catch {/* noop */}

      // Aguarda até 5s para o optedIn ser confirmado
      const start = Date.now();
      while (Date.now() - start < 5000) {
        const optedIn = OS?.User?.PushSubscription?.optedIn ?? false;
        if (optedIn) break;
        await new Promise(r => setTimeout(r, 200));
      }

      const optedIn = OS?.User?.PushSubscription?.optedIn ?? false;
      const currentId = OS?.User?.PushSubscription?.id ?? null;

      setSubscribed(optedIn);
      setPlayerId(currentId);

      if (!optedIn) {
        console.error('[push] ❌ optedIn não confirmado após 5s');
        return false;
      }

      console.log('[push] ✅ inscrito! optedIn:', optedIn, 'id:', currentId);

      // Vincula usuário e seta tags
      await linkUser(OS, role, userId);

      // Push de boas-vindas usando audience (tag-based) — funciona mesmo com local- ID
      setTimeout(() => {
        supabase.functions.invoke('send-push', {
          body: {
            title: '🔔 Notificações ativadas!',
            message: role === 'admin'
              ? 'Admin: você receberá avisos de pedidos e pagamentos 💰'
              : 'Você vai receber avisos dos seus pedidos 💖',
            audience: role === 'admin' ? 'admin' : 'customer',
          },
        }).catch(e => console.warn('[push] welcome push falhou:', e));
      }, 2000);

      return true;
    } catch (err) {
      console.error('[push] enable error:', err);
      const el = document.getElementById('os-debug-log');
      if (el) {
        el.style.display = 'block';
        el.innerText = `Erro Push:\n${(err as Error)?.message || String(err)}`;
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
