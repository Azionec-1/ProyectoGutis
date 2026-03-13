import Link from "next/link";
import { Plus } from "lucide-react";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { AppShell } from "@/components/layout/app-shell";
import { getClientDashboardData } from "@/lib/data/client-service";

export default async function HomePage() {
  const dashboard = await getClientDashboardData();

  return (
    <AppShell
      title="Dashboard"
      description="Resumen operativo del sistema con enfoque actual en el módulo de clientes."
      action={
        <Link
          href="/clients/new"
          className="ui-btn-primary"
        >
          <Plus className="h-4 w-4" />
          Nuevo cliente
        </Link>
      }
    >
      <DashboardOverview {...dashboard} />
    </AppShell>
  );
}
