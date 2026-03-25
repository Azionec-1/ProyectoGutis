import Link from "next/link";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SalesFilters } from "@/components/sales/sales-filters";
import { SalesGrid } from "@/components/sales/sales-grid";
import { SalesStats } from "@/components/sales/sales-stats";
import { SalesEmptyState } from "@/components/sales/sales-empty-state";
import { Pagination } from "@/components/ui/pagination";
import { getSalesMetrics, listSalesPaginated } from "@/lib/data/sale-service";

export default async function SalesPage({
  searchParams
}: {
  searchParams?: Promise<{ search?: string; status?: string; page?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const search = params.search?.trim() ?? "";
  const status = params.status ?? "all";
  const page = Number(params.page ?? "1");
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const [metrics, salesResult] = await Promise.all([
    getSalesMetrics(),
    listSalesPaginated({ search, status, page: safePage, pageSize: 8 })
  ]);

  return (
    <AppShell
      title="Gestion de ventas"
      showTopSearch={false}
      description="Registra pedidos, asigna repartidor y controla la salida de productos con una lectura mas ejecutiva del flujo."
      action={
        <Link href="/sales/new" className="ui-btn-primary">
          <Plus className="h-4 w-4" />
          Nueva venta
        </Link>
      }
    >
      <SalesStats {...metrics} />

      <div className="ui-panel flex flex-col gap-3 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Consolidado</p>
          <p className="mt-2 text-base font-semibold text-slate-900">Reporte consolidado de ventas</p>
          <p className="mt-1 text-sm text-slate-500">
            Esta opcion se conectara con exportaciones directas cuando el flujo quede cerrado.
          </p>
        </div>
        <button
          type="button"
          disabled
          className="inline-flex cursor-not-allowed items-center rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-500"
        >
          Generar reporte de ventas
        </button>
      </div>

      <SalesFilters search={search} status={status} />

      {salesResult.items.length ? (
        <>
          <SalesGrid sales={salesResult.items} />
          <Pagination
            pathname="/sales"
            page={salesResult.page}
            totalPages={salesResult.totalPages}
            query={{ search, status: status === "all" ? undefined : status }}
          />
        </>
      ) : (
        <SalesEmptyState />
      )}
    </AppShell>
  );
}
