import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";

export function AppShell({
  title,
  description,
  action,
  children
}: {
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-sand bg-grid-fade bg-[size:26px_26px] px-4 py-6 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row">
        <Sidebar />
        <main className="flex-1 space-y-6">
          <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-blue-600">
                  Agua Gutis
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-slate-900">{title}</h2>
                <p className="mt-3 text-sm text-slate-500 md:text-base">{description}</p>
              </div>
              {action}
            </div>
          </section>
          {children}
        </main>
      </div>
    </div>
  );
}
