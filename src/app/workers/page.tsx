import Link from "next/link";
import { Plus, Truck, UserCheck, UserX } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { prisma } from "@/lib/prisma";

export default async function WorkersPage() {
  const workers = await prisma.worker.findMany({
    orderBy: { fullName: "asc" }
  });

  const active = workers.filter((worker) => worker.isActive).length;
  const inactive = workers.length - active;

  return (
    <AppShell
      title="Repartidores"
      description="Administra los repartidores que luego podrán asignarse a las ventas."
      action={
        <Link href="/workers/new" className="ui-btn-primary">
          <Plus className="h-4 w-4" />
          Nuevo repartidor
        </Link>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="ui-panel p-5">
          <p className="text-sm text-slate-500">Total registrados</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{workers.length}</p>
        </div>
        <div className="ui-panel p-5">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <UserCheck className="h-4 w-4 text-green-600" />
            Activos
          </div>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{active}</p>
        </div>
        <div className="ui-panel p-5">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <UserX className="h-4 w-4 text-rose-600" />
            Inactivos
          </div>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{inactive}</p>
        </div>
      </div>

      <div className="ui-panel p-6">
        <div className="space-y-4">
          {workers.length ? (
            workers.map((worker) => (
              <div
                key={worker.id}
                className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-[1.2fr_0.8fr_0.8fr_auto]"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{worker.fullName}</p>
                      <p className="text-sm text-slate-500">Documento: {worker.documentId}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Teléfono</p>
                  <p className="mt-1 font-medium text-slate-900">{worker.phone}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Estado</p>
                  <p className={`mt-1 font-medium ${worker.isActive ? "text-green-600" : "text-rose-600"}`}>
                    {worker.isActive ? "Activo" : "Inactivo"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{worker.vehicleNote || "Sin detalle de vehículo"}</p>
                </div>

                <div className="flex items-end justify-end">
                  <Link href={`/workers/${worker.id}/edit`} className="ui-btn-secondary">
                    Editar
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
              Aún no hay repartidores registrados.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
