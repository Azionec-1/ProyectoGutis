import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone: string;
}) {
  return (
    <article className="ui-panel p-5">
      <header className="mb-3 flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
        <p className="text-sm text-slate-500">{label}</p>
      </header>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      {hint ? <p className="mt-1 text-sm text-slate-400">{hint}</p> : null}
    </article>
  );
}
