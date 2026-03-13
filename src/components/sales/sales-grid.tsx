import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { updateSaleStatusAction } from "@/app/sales/actions";
import { SaleStatusSelect } from "@/components/sales/sale-status-select";
import { currency, shortDate } from "@/lib/utils";

type SaleRow =
  Awaited<ReturnType<typeof import("@/lib/data/sale-service").listSalesPaginated>>["items"][number];

export function SalesGrid({ sales }: { sales: SaleRow[] }) {
  return (
    <div className="grid gap-4">
      {sales.map((sale) => (
        <div key={sale.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {sale.client.code} - {sale.client.fullName}
              </p>
              <p className="text-sm text-slate-500">{sale.client.district}</p>
            </div>
            <Badge active={sale.status !== "CANCELADO"}>{sale.status}</Badge>
          </div>

          <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-4">
            <p>Programado: <span className="font-medium text-slate-900">{shortDate(sale.scheduledAt)}</span></p>
            <p>Pago: <span className="font-medium text-slate-900">{sale.paymentMethod}</span></p>
            <p>Items: <span className="font-medium text-slate-900">{sale.items.length}</span></p>
            <p>Total: <span className="font-semibold text-slate-900">{currency(Number(sale.totalAmount))}</span></p>
          </div>

          <div className="mt-4 flex gap-2">
            <Link
              href={`/sales/${sale.id}`}
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
            >
              Ver detalle
            </Link>
            <SaleStatusSelect
              saleId={sale.id}
              defaultStatus={sale.status}
              action={updateSaleStatusAction}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
