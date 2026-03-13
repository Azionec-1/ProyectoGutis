import Link from "next/link";
import { Card } from "@/components/ui/card";

export function SalesEmptyState() {
  return (
    <Card className="flex flex-col items-center justify-center py-14 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-600">Ventas</p>
      <h3 className="mt-3 text-2xl font-semibold text-slate-900">Aún no hay ventas</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        Registra la primera venta para iniciar el control comercial de clientes, repartidores e items.
      </p>
      <Link
        href="/sales/new"
        className="mt-5 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        Registrar venta
      </Link>
    </Card>
  );
}
