import Link from "next/link";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ClientFilters } from "@/components/clients/client-filters";
import { ClientsGrid } from "@/components/clients/clients-grid";
import { ClientStats } from "@/components/clients/client-stats";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { getClientMetrics, listClientsPaginated } from "@/lib/data/client-service";

export default async function ClientsPage({
  searchParams
}: {
  searchParams?: Promise<{ search?: string; status?: string; page?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const search = params.search?.trim() ?? "";
  const status = params.status ?? "all";
  const page = Number(params.page ?? "1");
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;

  const [metrics, clientsResult] = await Promise.all([
    getClientMetrics(),
    listClientsPaginated({ search, status, page: safePage, pageSize: 8 })
  ]);

  return (
    <AppShell
      title="Gestión de Clientes"
      description="Base centralizada de clientes con contacto, dirección y geolocalización."
      action={
        <Link
          href="/clients/new"
          className="ui-btn-primary"
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
      {clientsResult.items.length ? (
        <>
          <ClientsGrid clients={clientsResult.items} />
          <Pagination
            pathname="/clients"
            page={clientsResult.page}
            totalPages={clientsResult.totalPages}
            query={{ search, status: status === "all" ? undefined : status }}
          />
        </>
      ) : (
        <EmptyState />
      )}
    </AppShell>
  );
}
