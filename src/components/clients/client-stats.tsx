import { UserCircle, UserRoundCheck, Users } from "lucide-react";

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
      subtitle: "sin atencion",
      icon: Users,
      tone: "bg-slate-100 text-slate-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div key={card.title} className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.tone}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-sm text-slate-500">{card.title}</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{card.value}</p>
            <p className="mt-1 text-sm text-slate-400">{card.subtitle}</p>
          </div>
        );
      })}
    </div>
  );
}
