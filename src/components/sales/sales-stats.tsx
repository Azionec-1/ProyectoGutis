import { ShoppingCart, Clock3, Truck, Ban } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { currency } from "@/lib/utils";

export function SalesStats({
  total,
  pending,
  shipped,
  canceled,
  revenue
}: {
  total: number;
  pending: number;
  shipped: number;
  canceled: number;
  revenue: number;
}) {
  const cards = [
    {
      label: "Ventas totales",
      value: String(total),
      icon: ShoppingCart,
      tone: "bg-blue-100 text-blue-700"
    },
    {
      label: "Pendientes",
      value: String(pending),
      icon: Clock3,
      tone: "bg-amber-100 text-amber-700"
    },
    {
      label: "Enviadas",
      value: String(shipped),
      icon: Truck,
      tone: "bg-emerald-100 text-emerald-700"
    },
    {
      label: "Canceladas",
      value: String(canceled),
      icon: Ban,
      tone: "bg-rose-100 text-rose-700"
    }
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            icon={card.icon}
            tone={card.tone}
          />
        ))}
      </div>

      <div className="ui-panel p-4 text-sm text-slate-600">
        Ingreso acumulado registrado:{" "}
        <span className="font-semibold text-slate-900">{currency(revenue)}</span>
      </div>
    </div>
  );
}
