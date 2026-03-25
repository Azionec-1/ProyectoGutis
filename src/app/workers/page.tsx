import Link from "next/link";
import { Plus, ShieldCheck, Truck, UserCheck, UserX, Clock3 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { StatCard } from "@/components/ui/stat-card";
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
      showTopSearch={false}
      description="Administra el equipo de reparto, aprueba cuentas pendientes y controla quien entra al sistema operativo."
      action={
        <Link href="/workers/new" className="ui-btn-primary">
          <Plus className="h-4 w-4" />
          Nuevo repartidor
        </Link>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total registrados" value={workers.length} hint="Base del equipo" icon={Truck} tone="bg-blue-100 text-blue-700" />
        <StatCard label="Activos" value={active} hint="Disponibles para reparto" icon={UserCheck} tone="bg-emerald-100 text-emerald-700" />
        <StatCard label="Con acceso" value={withAccess} hint="Usuarios creados" icon={ShieldCheck} tone="bg-sky-100 text-sky-700" />
        <StatCard label="Pendientes" value={pendingApproval} hint="Esperan aprobacion" icon={Clock3} tone="bg-amber-100 text-amber-700" />
      </div>

      <section className="ui-panel overflow-hidden p-0">
        <div className="border-b border-slate-200 bg-gradient-to-r from-white via-white to-blue-50/60 px-5 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Equipo</p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">Control del frente operativo</h2>
            </div>
            <span className="ui-pill">Despacho y acceso</span>
          </div>
        </div>

        <div className="space-y-4 px-5 py-5">
          {workers.length ? (
            workers.map((worker) => {
              const accountLabel = !worker.user
                ? "Sin acceso"
                : worker.user.isApproved
                  ? "Aprobada"
                  : "Esperando verificacion";

              return (
                <article
                  key={worker.id}
                  className="grid gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 lg:grid-cols-[1.1fr_0.75fr_0.9fr_1fr_auto]"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                      <Truck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-slate-900">{worker.fullName}</p>
                      <p className="mt-1 text-sm text-slate-500">Documento: {worker.documentId}</p>
                    </div>
                  </div>

                  <div className="ui-subtle-panel px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Telefono</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{worker.phone}</p>
                  </div>

                  <div className="ui-subtle-panel px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Estado operativo</p>
                    <p className={`mt-2 text-sm font-semibold ${worker.isActive ? "text-emerald-600" : "text-rose-600"}`}>
                      {worker.isActive ? "Activo" : "Inactivo"}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{worker.vehicleNote || "Sin detalle de vehiculo"}</p>
                  </div>

                  <div className="ui-subtle-panel px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Cuenta</p>
                    <p
                      className={`mt-2 text-sm font-semibold ${
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

                  <div className="flex flex-col items-stretch gap-2 lg:items-end">
                    {worker.user && !worker.user.isApproved ? <ApproveWorkerButton workerId={worker.id} /> : null}
                    <Link href={`/workers/${worker.id}/edit`} className="ui-btn-soft">
                      Editar
                    </Link>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
              Aun no hay repartidores registrados.
            </div>
          )}

          {inactive > 0 ? (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <UserX className="mr-2 inline h-4 w-4" />
              Hay repartidores inactivos que no podran recibir pedidos ni acceder al sistema.
            </div>
          ) : null}
        </div>
      </section>
    </AppShell>
  );
}
