import Link from "next/link";
import { Plus, ShieldCheck, Truck, UserCheck, UserX, Clock3 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { prisma } from "@/lib/prisma";
import { ApproveWorkerButton } from "@/components/workers/approve-worker-button";

export default async function WorkersPage() {
  const workers = await prisma.worker.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          isApproved: true,
          approvedAt: true
        }
      }
    }
  });

  const active = workers.filter((worker) => worker.isActive).length;
  const inactive = workers.length - active;
  const withAccess = workers.filter((worker) => worker.user).length;
  const pendingApproval = workers.filter((worker) => worker.user && !worker.user.isApproved).length;

  return (
    <AppShell
      title="Repartidores"
      description="Administra los repartidores, aprueba cuentas pendientes y define quién puede ingresar al sistema."
      action={
        <Link href="/workers/new" className="ui-btn-primary">
          <Plus className="h-4 w-4" />
          Nuevo repartidor
        </Link>
      }
    >
      <div className="grid gap-4 md:grid-cols-4">
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
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            Con acceso
          </div>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{withAccess}</p>
        </div>
        <div className="ui-panel p-5">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock3 className="h-4 w-4 text-amber-600" />
            Pendientes
          </div>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{pendingApproval}</p>
        </div>
      </div>

      <div className="ui-panel p-6">
        <div className="space-y-4">
          {workers.length ? (
            workers.map((worker) => {
              const accountLabel = !worker.user
                ? "Sin acceso"
                : worker.user.isApproved
                  ? "Aprobada"
                  : "Esperando verificación";

              return (
                <div
                  key={worker.id}
                  className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-[1.1fr_0.8fr_0.8fr_1fr_auto]"
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
                    <p className="text-sm text-slate-500">Estado operativo</p>
                    <p className={`mt-1 font-medium ${worker.isActive ? "text-green-600" : "text-rose-600"}`}>
                      {worker.isActive ? "Activo" : "Inactivo"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{worker.vehicleNote || "Sin detalle de vehículo"}</p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Cuenta</p>
                    <p
                      className={`mt-1 font-medium ${
                        !worker.user
                          ? "text-slate-500"
                          : worker.user.isApproved
                            ? "text-emerald-600"
                            : "text-amber-600"
                      }`}
                    >
                      {accountLabel}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{worker.user?.email ?? "No configurado"}</p>
                  </div>

                  <div className="flex flex-col items-end justify-between gap-3">
                    {worker.user && !worker.user.isApproved ? <ApproveWorkerButton workerId={worker.id} /> : null}
                    <Link href={`/workers/${worker.id}/edit`} className="ui-btn-soft">
                      Editar
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
              Aún no hay repartidores registrados.
            </div>
          )}
        </div>

        {inactive > 0 ? (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            <UserX className="mr-2 inline h-4 w-4 text-rose-500" />
            Hay repartidores inactivos que no podrán recibir pedidos ni acceder al sistema.
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
