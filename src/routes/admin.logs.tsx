import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { AdminLayout } from "@/components/AdminLayout";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Activity, Shield, User, Clock, Info } from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/admin/logs")({
  component: Page,
});

function Page() {
  const { activityLogs, sync } = useStore();

  useEffect(() => {
    sync();
  }, [sync]);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "auth":
        return <Shield className="h-4 w-4 text-primary" />;
      case "catalog":
        return <Activity className="h-4 w-4 text-success" />;
      case "order":
        return <Activity className="h-4 w-4 text-gold" />;
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <AdminLayout title="Logs de Auditoria">
      <div className="bg-card rounded-2xl shadow-card border border-border overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h2 className="font-bold flex items-center gap-2">
            <Clock className="h-4 w-4" /> Histórico de Atividades
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Acompanhe as ações realizadas no sistema por administradores e
            clientes.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 text-[11px] uppercase tracking-wider font-bold text-muted-foreground border-b border-border">
                <th className="px-4 py-3">Data/Hora</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Ação</th>
                <th className="px-4 py-3">Descrição</th>
                <th className="px-4 py-3">Usuário</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {activityLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-sm text-muted-foreground"
                  >
                    Nenhum log encontrado.
                  </td>
                </tr>
              ) : (
                activityLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-muted/20 transition-colors text-sm"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                      {format(new Date(log.createdAt), "dd/MM/yy HH:mm", {
                        locale: ptBR,
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(log.category)}
                        <span className="capitalize">{log.category}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold">{log.action}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {log.description}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3 w-3 opacity-50" />
                        <span className="text-xs">
                          {log.userId ? log.userId.slice(0, 8) : "Sistema"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
