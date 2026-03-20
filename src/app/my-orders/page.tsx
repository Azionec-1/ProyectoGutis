import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUser } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import { currency, shortDate } from "@/lib/utils";

export default async function MyOrdersPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "WORKER" || !user.workerId) {
    redirect("/");
  }

  const sales = await prisma.sale.findMany({
    where: {
      workerId: user.workerId
    },
    orderBy: {
      scheduledAt: "desc"
    },
    include: {
      client: {
        select: {
          fullName: true,
          district: true,
          address: true,
          phone: true
        }
      },
      items: {
        select: {
          id: true,
          quantity: true,
          product: {
            select: {
              name: true
            }
          }
        }
      }
    }
  });

  return (
    <AppShell
      title="Mis pedidos"
      description="Consulta únicamente los pedidos que tienes asignados para reparto."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="ui-panel p-5">
          <p className="text-sm text-slate-500">Pedidos asignados</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{sales.length}</p>
        </div>
        <div className="ui-panel p-5">
          <p className="text-sm text-slate-500">Pendientes</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {sales.filter((sale) => sale.status === "PENDIENTE").length}
          </p>
        </div>
        <div className="ui-panel p-5">
          <p className="text-sm text-slate-500">Enviados</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {sales.filter((sale) => sale.status === "ENVIADO").length}
          </p>
        </div>
      </div>

      <section className="ui-panel p-6">
        {sales.length ? (
          <div className="space-y-4">
            {sales.map((sale) => (
              <article key={sale.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{sale.client.fullName}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {sale.client.district} | {sale.client.address}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">Teléfono: {sale.client.phone}</p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Estado</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{sale.status}</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{currency(Number(sale.totalAmount))}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="ui-subtle-panel px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Programado</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{shortDate(sale.scheduledAt)}</p>
                  </div>

                  <div className="ui-subtle-panel px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Productos</p>
                    <div className="mt-2 space-y-1 text-sm text-slate-700">
                      {sale.items.map((item) => (
                        <p key={item.id}>
                          {item.product.name} x {item.quantity}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
            Aún no tienes pedidos asignados.
          </div>
        )}
      </section>
    </AppShell>
  );
}
