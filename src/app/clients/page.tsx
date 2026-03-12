import Link from "next/link";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ClientFilters } from "@/components/clients/client-filters";
import { ClientsGrid } from "@/components/clients/clients-grid";
import { ClientStats } from "@/components/clients/client-stats";
import { EmptyState } from "@/components/ui/empty-state";
import { getClientMetrics, listClients } from "@/lib/data/client-service";

export default async function ClientsPage({
  searchParams
}: {
  searchParams?: Promise<{ search?: string; status?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const search = params.search?.trim() ?? "";
  const status = params.status ?? "all";

  const [metrics, clients] = await Promise.all([
    getClientMetrics(),
    listClients(search, status)
  ]);

  return (
    <AppShell
      title="Gestion de Clientes"
      description="Base centralizada de clientes con contacto, direccion y geolocalizacion."
      action={
        <Link
          href="/clients/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Registrar cliente
        </Link>
      }
    >
      <ClientStats
        total={metrics.total}
        active={metrics.active}
        inactive={metrics.inactive}
      />
      <ClientFilters search={search} status={status} />
      {clients.length ? <ClientsGrid clients={clients} /> : <EmptyState />}
    </AppShell>
  );
}
