"use client";

import { AlertTriangle, Package, ShoppingCart, UserCheck, UserCircle2 } from "lucide-react";

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
      title: "Clientes Registrados",
      value: total,
      change: "Base actual",
      icon: UserCircle2,
      tone: "bg-blue-100 text-blue-600"
    },
    {
      title: "Clientes Activos",
      value: active,
      change: "Disponibles",
      icon: UserCheck,
      tone: "bg-green-100 text-green-600"
    },
    {
      title: "Pendientes",
      value: inactive,
      change: "Por revisar",
      icon: Package,
      tone: "bg-orange-100 text-orange-600"
    },
    {
      title: "Total General",
      value: total,
      change: "Base actual",
      icon: ShoppingCart,
      tone: "bg-slate-100 text-slate-600"
    }
  ];

  const alerts = [
    { message: "Ventas y movimientos aun no tienen datos conectados.", type: "warning" },
    { message: "El dashboard actual refleja solo el modulo de clientes.", type: "info" },
    { message: "Las siguientes vistas operativas quedaron marcadas como Proximamente.", type: "info" }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <div key={stat.title} className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.tone}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium text-slate-500">{stat.change}</span>
              </div>
              <h3 className="text-sm text-slate-500">{stat.title}</h3>
              <p className="mt-1 text-3xl font-bold text-slate-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Ventas Semanales</h2>
          <div className="flex h-[260px] items-center justify-center rounded-xl bg-slate-50 text-sm font-medium text-slate-500">
            En produccion
          </div>
        </div>

        <div className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Produccion Mensual</h2>
          <div className="flex h-[260px] items-center justify-center rounded-xl bg-slate-50 text-sm font-medium text-slate-500">
            En produccion
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Clientes Recientes</h2>
          <div className="space-y-4">
            {recent.map((client) => (
              <div key={client.id} className="rounded-xl bg-slate-50 p-4">
                <p className="font-medium text-slate-900">{client.fullName}</p>
                <p className="mt-1 text-sm text-slate-500">{client.district}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Entregas por Repartidor</h2>
          <div className="flex h-[260px] items-center justify-center rounded-xl bg-slate-50 text-sm font-medium text-slate-500">
            En produccion
          </div>
        </div>
      </div>

      <div className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Alertas Recientes</h2>
          <div className="space-y-4">
            {alerts.map((alert, index) => (
              <div key={index} className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                <AlertTriangle
                  className={`mt-0.5 h-5 w-5 ${
                    alert.type === "warning" ? "text-orange-500" : "text-blue-500"
                  }`}
                />
                <p className="text-sm text-slate-700">{alert.message}</p>
              </div>
            ))}
          </div>
      </div>
    </div>
  );
}
