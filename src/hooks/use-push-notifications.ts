import { useEffect, useState } from "react";
import OneSignal from "react-onesignal";

export const ONESIGNAL_APP_ID = "63b84a50-f1ec-4940-97aa-a72bfc1f9a2e";

let isInitialized = false;
let initPromise: Promise<void> | null = null;

async function runOneSignalInit() {
  if (isInitialized) return;
  if (initPromise) return initPromise;
  
  initPromise = OneSignal.init({
    appId: ONESIGNAL_APP_ID,
    allowLocalhostAsSecureOrigin: true,
  }).then(() => {
    isInitialized = true;
  });

  return initPromise;
}

export function usePushNotifications() {
  const [isReady, setIsReady] = useState(isInitialized);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);

  useEffect(() => {
    // Only init if supported
    if (!("Notification" in window)) return;
    setPermission(Notification.permission);

    runOneSignalInit().then(() => {
      setIsReady(true);
      
      const updateState = () => {
        setPermission(Notification.permission);
        const sub = OneSignal.User?.PushSubscription;
        setIsSubscribed(sub?.optedIn ?? false);
        setPlayerId(sub?.id ?? null);
      };

      updateState();
      
      // Listen to subscription changes
      OneSignal.User.PushSubscription.addEventListener("change", updateState);
      return () => {
        OneSignal.User.PushSubscription.removeEventListener("change", updateState);
      };
    });
  }, []);

  const requestPermission = async () => {
    if (!isReady) return false;
    try {
      // Show the native browser prompt (or OneSignal slide prompt)
      await OneSignal.Slidedown.promptPush();
      
      const sub = OneSignal.User?.PushSubscription;
      if (sub && !sub.optedIn) {
         await sub.optIn(); // Force opt-in if they previously opted out but now granted permission
      }

      setPermission(Notification.permission);
      setIsSubscribed(OneSignal.User?.PushSubscription?.optedIn ?? false);
      setPlayerId(OneSignal.User?.PushSubscription?.id ?? null);
      return true;
    } catch (e) {
      console.error("Push Request Error:", e);
      return false;
    }
  };

  const loginUser = async (role: "admin" | "affiliate", id: string) => {
    if (!isReady) return;
    try {
      await OneSignal.login(id);
      await OneSignal.User.addTag("role", role);
      console.log(`[OneSignal] User logged in as ${role} with id ${id}`);
    } catch (e) {
      console.error("[OneSignal] Login error:", e);
    }
  };

  const logoutUser = async () => {
    if (!isReady) return;
    try {
      await OneSignal.logout();
    } catch (e) {
      console.error("[OneSignal] Logout error:", e);
    }
  };

  return {
    isReady,
    permission,
    isSubscribed,
    playerId,
    requestPermission,
    loginUser,
    logoutUser,
  };
}
