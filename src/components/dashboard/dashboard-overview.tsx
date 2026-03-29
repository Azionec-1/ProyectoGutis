"use client";

import Link from "next/link";
import { AlertTriangle, ArrowUpRight, Package, UserCheck, UserCircle2 } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";

type DashboardOverviewProps = {
  total: number;
  active: number;
  inactive: number;
  recent: Array<{ id: string; fullName: string; district: string; createdAt: Date }>;
};

export function DashboardOverview({
  total,
  active,
  inactive,
  recent
}: DashboardOverviewProps) {
  const statsCards = [
    {
      title: "Clientes registrados",
      value: total,
      change: "Base activa del sistema",
      icon: UserCircle2,
      tone: "bg-blue-100 text-blue-600"
    },
    {
      title: "Clientes activos",
      value: active,
      change: "Disponibles para venta",
      icon: UserCheck,
      tone: "bg-emerald-100 text-emerald-600"
    },
    {
      title: "Clientes inactivos",
      value: inactive,
      change: "Pendientes de revision",
      icon: Package,
      tone: "bg-amber-100 text-amber-600"
    }
  ];

  const alerts = [
    { message: "Ventas y movimientos aun no muestran datos historicos completos.", type: "warning" },
    { message: "El tablero prioriza clientes mientras terminamos de conectar operación y producción.", type: "info" },
    { message: "Los bloques marcados como vista previa ya estan listos para una segunda fase visual.", type: "info" }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {statsCards.map((stat) => (
          <StatCard
            key={stat.title}
            label={stat.title}
            value={stat.value}
            hint={stat.change}
            icon={stat.icon}
            tone={stat.tone}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="ui-panel overflow-hidden p-0">
          <div className="border-b border-slate-200 bg-gradient-to-r from-white to-blue-50/70 px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Lectura rapida</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">Clientes recientes</h3>
              </div>
              <span className="ui-pill">Ultimos movimientos</span>
            </div>
          </div>
          <div className="grid gap-3 px-5 py-5 md:grid-cols-2">
            {recent.length ? (
              recent.map((client) => (
                <Link
                  key={client.id}
                  href={`/clients/${client.id}`}
                  className="ui-subtle-panel block px-4 py-4 transition hover:border-blue-200 hover:bg-blue-50/40"
                >
                  <p className="text-sm font-semibold text-slate-900">{client.fullName}</p>
                  <p className="mt-1 text-sm text-slate-500">{client.district}</p>
                  <div className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-blue-600">
                    Ver ficha
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </div>
                </Link>
              ))
            ) : (
              <div className="md:col-span-2 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                Aun no hay clientes recientes para mostrar.
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="ui-panel p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Vista previa</p>
            <h3 className="mt-2 text-lg font-semibold text-slate-900">Ventas semanales</h3>
            <div className="mt-4 flex h-[180px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm font-medium text-slate-500">
              En producción
            </div>
          </div>

          <div className="ui-panel p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Alertas</p>
            <h3 className="mt-2 text-lg font-semibold text-slate-900">Puntos a revisar</h3>
            <div className="mt-4 space-y-3">
              {alerts.map((alert, index) => (
                <div key={index} className="ui-subtle-panel flex items-start gap-3 px-4 py-3">
                  <AlertTriangle
                    className={`mt-0.5 h-4 w-4 ${alert.type === "warning" ? "text-amber-500" : "text-blue-500"}`}
                  />
                  <p className="text-sm text-slate-700">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
