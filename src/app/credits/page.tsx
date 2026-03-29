import Link from "next/link";
import { CreditCard, HandCoins, Landmark } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { StatCard } from "@/components/ui/stat-card";
import { Pagination } from "@/components/ui/pagination";
import { currency, shortDate } from "@/lib/utils";
import { getCreditMetrics, listCreditSales } from "@/lib/data/sale-service";

function paymentStatusLabel(value: string) {
  switch (value) {
    case "PAGADO":
      return "Pagado";
    case "PARCIAL":
      return "Parcial";
    case "CREDITO":
      return "Crédito";
    default:
      return value;
  }
}

export default async function CreditsPage({
  searchParams
}: {
  searchParams?: Promise<{ search?: string; page?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const search = params.search?.trim() ?? "";
  const page = Number(params.page ?? "1");
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;

  const [metrics, creditResult] = await Promise.all([
    getCreditMetrics(),
    listCreditSales({ search, page: safePage, pageSize: 8 })
  ]);

  return (
    <AppShell
      title="Créditos"
      showTopSearch={false}
      description="Controla deudas, abonos y ventas pendientes de cobro sin salir del flujo de ventas."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Créditos abiertos"
          value={metrics.openCredits}
          hint="Ventas con saldo pendiente"
          icon={CreditCard}
          tone="bg-orange-100 text-orange-700"
        />
        <StatCard
          label="Saldo pendiente"
          value={currency(metrics.amountDue)}
          hint="Monto total por cobrar"
          icon={Landmark}
          tone="bg-amber-100 text-amber-700"
        />
        <StatCard
          label="Cobros registrados"
          value={currency(metrics.amountCollected)}
          hint="Abonos acumulados"
          icon={HandCoins}
          tone="bg-emerald-100 text-emerald-700"
        />
      </div>

      <form className="ui-panel grid gap-4 p-4 lg:grid-cols-[minmax(0,1.7fr)_160px]">
        <input
          name="search"
          defaultValue={search}
          placeholder="Buscar por cliente, codigo o distrito"
          className="ui-input"
        />
        <button type="submit" className="ui-btn-primary">
          Filtrar
        </button>
      </form>

      {creditResult.items.length ? (
        <>
          <div className="grid gap-4">
            {creditResult.items.map((sale) => (
              <article key={sale.id} className="ui-panel overflow-hidden p-0">
                <div className="border-b border-slate-200 bg-gradient-to-r from-white via-white to-blue-50/70 px-5 py-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                        {sale.client.code}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-slate-900">{sale.client.fullName}</h3>
                      <p className="mt-2 text-sm text-slate-500">{sale.client.district}</p>
                    </div>

                    <div className="text-right">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Saldo pendiente</p>
                      <p className="mt-1 text-2xl font-semibold text-slate-900">
                        {currency(Number(sale.amountDue))}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 px-5 py-5 md:grid-cols-4">
                  <div className="ui-subtle-panel px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Total</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{currency(Number(sale.totalAmount))}</p>
                  </div>
                  <div className="ui-subtle-panel px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Cobrado</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{currency(Number(sale.amountPaid))}</p>
                  </div>
                  <div className="ui-subtle-panel px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Estado</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{paymentStatusLabel(sale.paymentStatus)}</p>
                  </div>
                  <div className="ui-subtle-panel px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Vence</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {sale.dueDate ? shortDate(sale.dueDate) : "Sin fecha"}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-200 px-5 py-4">
                  <Link href={`/sales/${sale.id}`} className="ui-btn-soft">
                    Ver detalle y registrar abono
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <Pagination
            pathname="/credits"
            page={creditResult.page}
            totalPages={creditResult.totalPages}
            query={{ search: search || undefined }}
          />
        </>
      ) : (
        <div className="ui-panel p-8 text-center text-sm text-slate-500">
          No hay créditos pendientes con los filtros actuales.
        </div>
      )}
    </AppShell>
  );
}
