import { UserCircle, UserRoundCheck, Users } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";

export function ClientStats({
  total,
  active,
  inactive
}: {
  total: number;
  active: number;
  inactive: number;
}) {
  const cards = [
    {
      title: "Total Clientes",
      value: total,
      subtitle: "registrados",
      icon: UserCircle,
      tone: "bg-blue-100 text-blue-600"
    },
    {
      title: "Activos",
      value: active,
      subtitle: "disponibles",
      icon: UserRoundCheck,
      tone: "bg-green-100 text-green-600"
    },
    {
      title: "Inactivos",
      value: inactive,
      subtitle: "sin atención",
      icon: Users,
      tone: "bg-slate-100 text-slate-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {cards.map((card) => (
        <StatCard
          key={card.title}
          label={card.title}
          value={card.value}
          hint={card.subtitle}
          icon={card.icon}
          tone={card.tone}
        />
      ))}
    </div>
  );
}
