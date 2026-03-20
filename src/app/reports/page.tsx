import { AppShell } from "@/components/layout/app-shell";
import { ReportsPanel } from "@/components/reports/reports-panel";

export default function ReportsPage() {
  return (
    <AppShell
      title="Reportes"
      description="Consulta ventas y producción del sistema en el mismo panel operativo."
    >
      <ReportsPanel />
    </AppShell>
  );
}
