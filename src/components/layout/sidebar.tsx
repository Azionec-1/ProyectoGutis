"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { BarChart, Building2, LayoutGrid, LogOut, Package, Route, Truck, Users } from "lucide-react";

const adminItems = [
  { href: "/", label: "Dashboard", icon: LayoutGrid },
  { href: "/clients", label: "Clientes", icon: Users },
  { href: "/workers", label: "Repartidores", icon: Truck },
  { href: "/sales", label: "Ventas", icon: Building2 },
  { href: "/admin/products", label: "Productos", icon: Package },
  { href: "/reports", label: "Reportes", icon: BarChart }
];

const workerItems = [{ href: "/my-orders", label: "Mis pedidos", icon: Route }];

export function Sidebar({
  user
}: {
  user?: {
    name: string | null;
    role: UserRole;
    worker?: { fullName: string } | null;
  } | null;
} = {
  user: null
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    let ignore = false;

    const syncUser = async () => {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        if (!response.ok) {
          if (!ignore) {
            setCurrentUser(null);
          }
          return;
        }

        const data = await response.json();
        if (!ignore) {
          setCurrentUser(data.user ?? null);
        }
      } catch {
        if (!ignore) {
          setCurrentUser(null);
        }
      }
    };

    void syncUser();

    return () => {
      ignore = true;
    };
  }, []);

  const isWorker = currentUser?.role === "WORKER" || pathname.startsWith("/my-orders");
  const items = isWorker ? workerItems : adminItems;
  const displayName = isWorker
    ? currentUser?.worker?.fullName ?? currentUser?.name ?? "Repartidor"
    : currentUser?.name ?? "Administrador";

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
    }
  }

  return (
    <aside className="ui-panel w-full p-5 md:w-72">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">Agua Gutis</p>
        <h1 className="mt-2 text-2xl font-semibold text-ink">Agua Gutis</h1>
        <p className="mt-2 text-sm text-slate-500">
          {isWorker ? "Panel operativo para repartidores." : "Panel operativo del sistema."}
        </p>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            {isWorker ? "Repartidor" : "Admin"}
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">{displayName}</p>
        </div>
      </div>

      <nav className="space-y-2">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                pathname === item.href || pathname.startsWith(`${item.href}/`)
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

      {!isWorker ? (
        <div className="mt-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Próximo</p>
          <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-400">
            <Route className="h-4 w-4" />
            <span>Créditos</span>
            <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em]">
              Prox.
            </span>
          </div>
        </div>
      ) : null}

      <div className="mt-8 border-t border-slate-200 pt-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
