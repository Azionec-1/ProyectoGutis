import Link from "next/link";
import { CalendarDays, ChevronRight, CreditCard, Landmark, MapPin, Package2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { updateSaleStatusAction } from "@/app/sales/actions";
import { SaleStatusSelect } from "@/components/sales/sale-status-select";
import { currency, shortDate } from "@/lib/utils";

type SaleRow =
  Awaited<ReturnType<typeof import("@/lib/data/sale-service").listSalesPaginated>>["items"][number];

function operationLabel(value: string) {
  return value === "RECARGA" ? "Recarga" : "Venta";
}

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

export function SalesGrid({ sales }: { sales: SaleRow[] }) {
  return (
    <div className="grid gap-4">
      {sales.map((sale) => (
        <article key={sale.id} className="ui-panel overflow-hidden p-0">
          <div className="border-b border-slate-200 bg-gradient-to-r from-white via-white to-blue-50/70 px-5 py-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                  {sale.client.code}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">{sale.client.fullName}</h3>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {sale.client.district}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {operationLabel(sale.operationType)}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Package2 className="h-4 w-4" />
                    {sale.items.length} items
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Total</p>
                  <p className="mt-1 text-xl font-semibold text-slate-900">
                    {currency(Number(sale.totalAmount))}
                  </p>
                </div>
                <Badge active={sale.status !== "CANCELADO"}>{sale.status}</Badge>
              </div>
            </div>
          </div>

          <div className="grid gap-5 px-5 py-5 xl:grid-cols-[1fr_auto] xl:items-end">
            <div className="grid gap-3 md:grid-cols-4">
              <div className="ui-subtle-panel px-4 py-3">
                <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Programado
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{shortDate(sale.scheduledAt)}</p>
              </div>

              <div className="ui-subtle-panel px-4 py-3">
                <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  <CreditCard className="h-3.5 w-3.5" />
                  Cobro
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{paymentStatusLabel(sale.paymentStatus)}</p>
                <p className="mt-1 text-xs text-slate-500">{sale.paymentMethod}</p>
              </div>

              <div className="ui-subtle-panel px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Cobrado</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{currency(Number(sale.amountPaid))}</p>
              </div>

              <div className="ui-subtle-panel px-4 py-3">
                <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  <Landmark className="h-3.5 w-3.5" />
                  Saldo
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{currency(Number(sale.amountDue))}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={`/sales/${sale.id}`} className="ui-btn-soft">
                Ver detalle
                <ChevronRight className="h-4 w-4" />
              </Link>
              <SaleStatusSelect
                saleId={sale.id}
                defaultStatus={sale.status}
                action={updateSaleStatusAction}
              />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
