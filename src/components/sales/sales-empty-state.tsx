import Link from "next/link";
import { Card } from "@/components/ui/card";

export function SalesEmptyState() {
  return (
    <Card className="flex flex-col items-center justify-center py-14 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-blue-600">Ventas</p>
      <h3 className="mt-3 text-2xl font-semibold text-slate-900">Aún no hay ventas</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        Registra la primera venta para iniciar el control comercial de clientes, repartidores e ítems.
      </p>
      <Link href="/sales/new" className="ui-btn-primary mt-5">
        Registrar venta
      </Link>
    </Card>
  );
}
