"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { BarChart, Building2, LayoutGrid, LogOut, Package, Route, Truck, Users } from "lucide-react";

const adminItems = [
  { href: "/", label: "Inicio", icon: LayoutGrid },
  { href: "/clients", label: "Clientes", icon: Users },
  { href: "/workers", label: "Equipo", icon: Truck },
  { href: "/sales", label: "Ventas", icon: Building2 },
  { href: "/admin/products", label: "Productos", icon: Package },
  { href: "/reports", label: "Reportes", icon: BarChart }
];

const workerItems = [{ href: "/my-orders", label: "Pedidos", icon: Route }];

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

  useEffect(() => {
    const linksToPrefetch = (currentUser?.role === "WORKER" ? workerItems : adminItems)
      .map((item) => item.href)
      .filter((href) => href !== pathname);

    linksToPrefetch.forEach((href) => {
      router.prefetch(href);
    });
  }, [currentUser?.role, pathname, router]);

  const isWorker = currentUser?.role === "WORKER" || pathname.startsWith("/my-orders");
  const items = isWorker ? workerItems : adminItems;
  const displayName = isWorker
    ? currentUser?.worker?.fullName ?? currentUser?.name ?? "Repartidor"
    : null;

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
    }
  }

  return (
    <aside className="ui-panel flex h-auto flex-col overflow-hidden border-0 bg-[var(--rail-bg)] p-3 text-white md:sticky md:top-3 md:h-[calc(100vh-24px)] md:w-[88px]">
      <div className="flex items-center justify-center md:justify-center">
        <div className="overflow-hidden rounded-2xl bg-white/10 ring-1 ring-white/10">
          <Image
            src="/logogutis.jpg"
            alt="Logo Agua Gutis"
            width={48}
            height={48}
            className="h-12 w-12 scale-75 object-contain"
            priority
          />
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white/10 px-3 py-3 text-center ring-1 ring-white/10">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-blue-100/70">
          {isWorker ? "Worker" : "Admin"}
        </p>
        {displayName ? (
          <p className="mt-2 line-clamp-2 text-xs font-medium leading-5 text-white/90">{displayName}</p>
        ) : null}
      </div>

      <nav className="mt-5 flex flex-wrap justify-center gap-2 md:block md:space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`flex min-w-[72px] flex-col items-center gap-1 rounded-2xl px-2 py-3 text-center text-[11px] font-medium transition md:min-w-0 ${
                active
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-950/20"
                  : "text-white/72 hover:bg-white/8 hover:text-white"
              }`}
            >
              <Icon className={`h-4 w-4 ${active ? "text-white" : "text-blue-100/90"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {!isWorker ? (
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/6 px-2 py-3 text-center text-[11px] text-white/72 md:block">
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-blue-100">
            <Route className="h-4 w-4" />
          </div>
          <p className="mt-2 uppercase tracking-[0.18em]">Créditos</p>
          <p className="mt-1 text-[10px] text-white/50">Próximo</p>
        </div>
      ) : null}

      <div className="mt-5 border-t border-white/10 pt-3 md:mt-auto">
        <button
          onClick={handleLogout}
          className="flex w-full flex-col items-center gap-1 rounded-2xl px-2 py-3 text-center text-[11px] font-medium text-white/72 transition hover:bg-red-500/12 hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
