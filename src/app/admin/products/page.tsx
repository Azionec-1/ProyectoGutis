import Link from "next/link";
import { Factory, PackagePlus, PencilLine } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { isMissingTableError } from "@/lib/prisma-errors";
import { prisma } from "@/lib/prisma";
import {
  registerDailyProductionAction,
  revertLastProductionAction
} from "@/app/admin/products/actions";

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export default async function ProductsPage() {
  const today = startOfToday();

  let products: Array<{
    id: string;
    name: string;
    price: number;
    stock: number;
    todayProduced: number;
    lastRegisteredAmount: number;
  }> = [];

  try {
    const rows = await prisma.product.findMany({
      orderBy: { name: "asc" },
        include: {
          productionLogs: {
            where: { producedOn: today },
            select: { quantity: true, lastRegisteredAmount: true }
          }
        }
      });

    products = rows.map((product) => ({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      stock: product.stock,
      todayProduced: product.productionLogs[0]?.quantity ?? 0,
      lastRegisteredAmount: product.productionLogs[0]?.lastRegisteredAmount ?? 0
    }));
  } catch (error) {
    if (!isMissingTableError(error)) {
      throw error;
    }
  }

  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const producedToday = products.reduce((sum, product) => sum + product.todayProduced, 0);

  return (
    <AppShell
      title="Productos"
      description="Administra productos y registra la producción diaria desde un solo panel."
      action={
        <Link href="/admin/products/new" className="ui-btn-primary">
          <PackagePlus className="h-4 w-4" />
          Nuevo producto
        </Link>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="ui-panel p-5">
          <p className="text-sm text-slate-500">Productos registrados</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{products.length}</p>
        </div>
        <div className="ui-panel p-5">
          <p className="text-sm text-slate-500">Cantidad disponible</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{totalStock}</p>
        </div>
        <div className="ui-panel p-5">
          <p className="text-sm text-slate-500">Producción de hoy</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">{producedToday}</p>
        </div>
      </div>

      <section className="ui-panel p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Control diario de productos</h2>
            <p className="mt-1 text-sm text-slate-500">
              Registra cuánto se produjo hoy y el sistema lo suma al stock disponible.
            </p>
          </div>
          <span className="ui-pill">Flujo operativo</span>
        </div>

        {products.length ? (
          <div className="mt-6 space-y-4">
            {products.map((product) => (
              <article key={product.id} className="overflow-hidden rounded-[22px] border border-slate-200 bg-white">
                <div className="border-b border-slate-200 bg-gradient-to-r from-white via-slate-50 to-blue-50/60 px-5 py-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{product.name}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Precio unitario: <span className="font-semibold text-slate-900">S/ {product.price.toFixed(2)}</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <div className="rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Stock actual</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">{product.stock}</p>
                      </div>
                      <div className="rounded-2xl bg-blue-50 px-4 py-3 ring-1 ring-blue-100">
                        <p className="text-xs uppercase tracking-[0.2em] text-blue-500">Producción de hoy</p>
                        <p className="mt-2 text-2xl font-semibold text-blue-700">{product.todayProduced}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 px-5 py-5 xl:grid-cols-[1fr_auto] xl:items-end">
                  <form action={registerDailyProductionAction} className="grid gap-3 md:grid-cols-[220px_auto_auto] md:items-end">
                    <input type="hidden" name="productId" value={product.id} />
                    <label htmlFor={`quantity-${product.id}`} className="ui-label">
                      Producción del día
                      <input
                        id={`quantity-${product.id}`}
                        name="quantity"
                        type="number"
                        min={1}
                        step={1}
                        placeholder="Ej: 25"
                        className="ui-input"
                        required
                      />
                    </label>
                    <button type="submit" className="ui-btn-primary md:w-fit">
                      <Factory className="h-4 w-4" />
                      Registrar producción
                    </button>
                    <button
                      type="submit"
                      formAction={revertLastProductionAction}
                      className="ui-btn-soft md:w-fit"
                      disabled={product.lastRegisteredAmount <= 0}
                    >
                      Revertir
                    </button>
                  </form>

                  <Link href={`/admin/products/${product.id}/edit`} className="ui-btn-soft">
                    <PencilLine className="h-4 w-4" />
                    Editar producto
                  </Link>
                </div>
                <div className="px-5 pb-5">
                  <p className="text-xs text-slate-500">
                    Último registro reversible:{" "}
                    <span className="font-semibold text-slate-700">{product.lastRegisteredAmount}</span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
            Aún no hay productos registrados.
          </div>
        )}
      </section>
    </AppShell>
  );
}
