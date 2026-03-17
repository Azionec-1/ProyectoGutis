import Link from "next/link";
import { Factory, PackagePlus, PencilLine } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { isMissingTableError } from "@/lib/prisma-errors";
import { prisma } from "@/lib/prisma";
import { registerDailyProductionAction } from "@/app/admin/products/actions";

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
  }> = [];

  try {
    const rows = await prisma.product.findMany({
      orderBy: { name: "asc" },
      include: {
        productionLogs: {
          where: { producedOn: today },
          select: { quantity: true }
        }
      }
    });

    products = rows.map((product) => ({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      stock: product.stock,
      todayProduced: product.productionLogs[0]?.quantity ?? 0
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

      <div className="ui-panel p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Control diario de productos</h2>
            <p className="mt-1 text-sm text-slate-500">
              Registra cuánto se produjo hoy y el sistema lo suma a la cantidad disponible.
            </p>
          </div>
        </div>

        {products.length ? (
          <div className="space-y-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 lg:grid-cols-[1.2fr_0.7fr_0.7fr_1.2fr_auto]"
              >
                <div>
                  <p className="text-lg font-semibold text-slate-900">{product.name}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Precio unitario: S/ {product.price.toFixed(2)}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Cantidad</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{product.stock}</p>
                </div>

                <div className="rounded-xl bg-blue-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-blue-500">Hoy</p>
                  <p className="mt-2 text-2xl font-semibold text-blue-700">{product.todayProduced}</p>
                </div>

                <form action={registerDailyProductionAction} className="grid gap-2 sm:grid-cols-[1fr_auto]">
                  <input type="hidden" name="productId" value={product.id} />
                  <div>
                    <label
                      htmlFor={`quantity-${product.id}`}
                      className="mb-1 block text-sm font-medium text-slate-700"
                    >
                      Producción del día
                    </label>
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
                  </div>
                  <button type="submit" className="ui-btn-primary self-end">
                    <Factory className="h-4 w-4" />
                    Registrar
                  </button>
                </form>

                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="ui-btn-secondary self-end"
                >
                  <PencilLine className="h-4 w-4" />
                  Editar
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
            Aún no hay productos registrados.
          </div>
        )}
      </div>
    </AppShell>
  );
}
