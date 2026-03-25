import type { ReactNode } from "react";
import { CalendarRange, Search } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";

export function AppShell({
  title,
  description,
  action,
  showTopSearch = true,
  children
}: {
  title: string;
  description: string;
  action?: ReactNode;
  showTopSearch?: boolean;
  children: ReactNode;
}) {
  const todayLabel = new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date());

  return (
    <div className="min-h-screen bg-transparent px-3 py-3 md:px-4 md:py-4">
      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-[88px_minmax(0,1fr)]">
        <Sidebar />

        <main className="min-w-0 space-y-4">
          {showTopSearch ? (
            <section className="ui-panel flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="hidden h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 sm:flex">
                  <Search className="h-5 w-5" />
                </div>
                <label className="relative block min-w-0 flex-1 lg:w-[340px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    placeholder="Buscar modulos, clientes o ventas"
                    className="ui-input pl-9"
                  />
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
                  <CalendarRange className="h-4 w-4 text-blue-600" />
                  <span>{todayLabel}</span>
                </div>
              </div>
            </section>
          ) : null}

          <section className="ui-panel overflow-hidden">
            <div className="border-b border-slate-200 bg-gradient-to-r from-white via-white to-blue-50/70 px-6 py-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-blue-600">Agua Gutis</p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">{title}</h2>
                  <p className="mt-2 text-sm text-slate-500 md:text-[15px]">{description}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="ui-pill hidden sm:inline-flex">Panel operativo</span>
                  {action}
                </div>
              </div>
            </div>
          </section>

          <div className="space-y-4">{children}</div>
        </main>
      </div>
    </div>
  );
}
