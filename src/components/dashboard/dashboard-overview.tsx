"use client";

import { AlertTriangle, Package, ShoppingCart, UserCheck, UserCircle2 } from "lucide-react";
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
      title: "Clientes Inactivos",
      value: inactive,
      change: "Por revisar",
      icon: Package,
      tone: "bg-orange-100 text-orange-600"
    }
  ];

  const alerts = [
    { message: "Ventas y movimientos aún no tienen datos conectados.", type: "warning" },
    { message: "El dashboard actual refleja solo el módulo de clientes.", type: "info" },
    { message: "Las siguientes vistas operativas quedaron marcadas como Próximamente.", type: "info" }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="ui-panel p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Ventas Semanales</h2>
          <div className="ui-subtle-panel flex h-[260px] items-center justify-center text-sm font-medium text-slate-500">
            En producción
          </div>
        </div>

        <div className="ui-panel p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Producción Mensual</h2>
          <div className="ui-subtle-panel flex h-[260px] items-center justify-center text-sm font-medium text-slate-500">
            En producción
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="ui-panel p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Clientes Recientes</h2>
          <div className="space-y-4">
            {recent.map((client) => (
              <div key={client.id} className="ui-subtle-panel p-4">
                <p className="font-medium text-slate-900">{client.fullName}</p>
                <p className="mt-1 text-sm text-slate-500">{client.district}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="ui-panel p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Entregas por Repartidor</h2>
          <div className="ui-subtle-panel flex h-[260px] items-center justify-center text-sm font-medium text-slate-500">
            En producción
          </div>
        </div>
      </div>

      <div className="ui-panel p-6">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Alertas Recientes</h2>
          <div className="space-y-4">
            {alerts.map((alert, index) => (
              <div key={index} className="ui-subtle-panel flex items-start gap-3 p-4">
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
