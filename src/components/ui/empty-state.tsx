import Link from "next/link";
import { Card } from "@/components/ui/card";

export function EmptyState() {
  return (
    <Card className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-blue-600">Clientes</p>
      <h3 className="mt-3 text-2xl font-semibold text-ink">Aún no hay registros</h3>
      <p className="mt-3 max-w-md text-sm text-slate-500">
        Empieza creando el primer cliente para registrar dirección, referencia y enlace de ubicación.
      </p>
      <Link href="/clients/new" className="ui-btn-primary mt-6">
        Registrar cliente
      </Link>
    </Card>
  );
}
