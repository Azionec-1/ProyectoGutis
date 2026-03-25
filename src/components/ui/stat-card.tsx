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
    <article className="ui-panel border-slate-200/90 p-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}>
          <Icon className="h-5 w-5" />
        </div>
      </header>
      {hint ? <p className="mt-3 text-sm text-slate-500">{hint}</p> : null}
    </article>
  );
}
