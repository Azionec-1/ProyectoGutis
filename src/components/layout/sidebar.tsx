"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, LayoutGrid, Package, Route, Users } from "lucide-react";

const items = [
  { href: "/", label: "Dashboard", icon: LayoutGrid, enabled: true },
  { href: "/clients", label: "Clientes", icon: Users, enabled: true },
  { href: "/sales", label: "Ventas", icon: Building2, enabled: true },
  { href: "#", label: "Inventario", icon: Package, enabled: false },
  { href: "#", label: "Rutas", icon: Route, enabled: false }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="ui-panel w-full p-5 md:w-72">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">
          Agua Gutis
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-ink">Agua Gutis</h1>
        <p className="mt-2 text-sm text-slate-500">Panel operativo del sistema.</p>
      </div>

      <nav className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;

          if (!item.enabled) {
            return (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-400"
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em]">
                  Prox.
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                pathname === item.href
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
