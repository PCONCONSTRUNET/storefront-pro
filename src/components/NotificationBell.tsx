import React, { useEffect, useRef, useState } from "react";
import { Bell, Package, Truck, CheckCircle2, X, BellOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useStore, selectCurrentCustomer } from "@/lib/store";
import { formatDate } from "@/lib/format";

interface Notification {
  id: string;
  order_id: string | null;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

const TYPE_ICON: Record<string, React.ReactElement> = {
  order_approved: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  status_update: <Truck className="h-4 w-4 text-blue-500" />,
  default: <Package className="h-4 w-4 text-primary" />,
};

export function NotificationBell() {
  const customer = useStore(selectCurrentCustomer);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Fetch notifications from Supabase
  const fetchNotifications = async () => {
    if (!customer?.email) return;
    setLoading(true);
    const { data } = await supabase
      .from("customer_notifications" as any)
      .select("*")
      .eq("customer_email", customer.email.toLowerCase().trim())
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setNotifications(data as Notification[]);
    setLoading(false);
  };

  useEffect(() => {
    if (!customer?.email) return;
    fetchNotifications();
    // Poll a cada 30s enquanto a página está aberta
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [customer?.email]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Mark all unread as read when opening
  const handleOpen = async () => {
    setOpen((v) => !v);
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    await supabase
      .from("customer_notifications" as any)
      .update({ read: true })
      .in("id", unreadIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  if (!customer) return null;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative h-9 w-9 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
        aria-label="Notificações"
      >
        <Bell className="h-5 w-5 text-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-bounce">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute right-0 top-11 w-[340px] max-w-[calc(100vw-1rem)] bg-background rounded-2xl shadow-2xl border border-border z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Notificações</span>
              {unreadCount > 0 && (
                <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
                  {unreadCount} nova{unreadCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 gap-2 text-muted-foreground">
                <BellOff className="h-10 w-10 opacity-30" />
                <span className="text-sm">Nenhuma notificação ainda</span>
              </div>
            ) : (
              <ul>
                {notifications.map((n, idx) => (
                  <li
                    key={n.id}
                    className={`flex gap-3 px-4 py-3 transition-colors ${
                      !n.read ? "bg-primary/5" : ""
                    } ${idx !== notifications.length - 1 ? "border-b border-border/50" : ""}`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {TYPE_ICON[n.type] ?? TYPE_ICON.default}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm leading-snug ${!n.read ? "font-semibold text-foreground" : "font-medium text-foreground/80"}`}>
                        {n.title}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {n.message}
                      </div>
                      <div className="text-[10px] text-muted-foreground/60 mt-1">
                        {formatDate(n.created_at)}
                      </div>
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
