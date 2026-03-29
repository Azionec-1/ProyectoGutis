import { Boxes, Factory, PackagePlus, Warehouse } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { StatCard } from "@/components/ui/stat-card";
import { shortDate } from "@/lib/utils";
import { isMissingTableError } from "@/lib/prisma-errors";
import { listInventoryDashboard } from "@/lib/data/inventory-service";
import {
  createInventorySupplyAction,
  registerInventoryMovementAction,
  updateInventorySupplySettingsAction
} from "./actions";

function movementLabel(value: string) {
  switch (value) {
    case "INGRESO":
      return "Ingreso";
    case "SALIDA":
      return "Salida";
    case "CONSUMO_PRODUCCION":
      return "Consumo por producción";
    case "REPOSICION_PRODUCCION":
      return "Reposicion por revertir";
    default:
      return value;
  }
}

export default async function InventoryPage() {
  let supplies: Awaited<ReturnType<typeof listInventoryDashboard>>["supplies"] = [];
  let recentMovements: Awaited<ReturnType<typeof listInventoryDashboard>>["recentMovements"] = [];
  let metrics = {
    totalSupplies: 0,
    totalStock: 0,
    lowStockCount: 0,
    autoManagedCount: 0
  };

  try {
    const data = await listInventoryDashboard();
    supplies = data.supplies;
    recentMovements = data.recentMovements;
    metrics = data.metrics;
  } catch (error) {
    if (!isMissingTableError(error)) {
      throw error;
    }
  }

  return (
    <AppShell
      title="Inventario"
      showTopSearch={false}
      description="Controla botellas, tapas, etiquetas y empaques sin cargarle pasos extra a la operación."
    >
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Insumos activos"
          value={metrics.totalSupplies}
          hint="Catalogo del inventario"
          icon={Warehouse}
          tone="bg-sky-100 text-sky-700"
        />
        <StatCard
          label="Cantidad total"
          value={metrics.totalStock.toFixed(2)}
          hint="Stock acumulado"
          icon={Boxes}
          tone="bg-blue-100 text-blue-700"
        />
        <StatCard
          label="Alerta baja"
          value={metrics.lowStockCount}
          hint="Insumos por reponer"
          icon={PackagePlus}
          tone="bg-amber-100 text-amber-700"
        />
        <StatCard
          label="Consumo automático"
          value={metrics.autoManagedCount}
          hint="Descontados desde producción"
          icon={Factory}
          tone="bg-emerald-100 text-emerald-700"
        />
      </div>

      <section className="ui-panel overflow-hidden p-0">
        <div className="border-b border-slate-200 bg-gradient-to-r from-white via-white to-blue-50/60 px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Nuevo insumo</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-900">Registrar item de inventario</h2>
          <p className="mt-1 text-sm text-slate-500">
            Puedes crear nuevos insumos y definir cuánto consume producción por cada unidad fabricada.
          </p>
        </div>

        <form action={createInventorySupplyAction} className="grid gap-4 px-5 py-5 lg:grid-cols-6">
          <label className="ui-label lg:col-span-2">
            Nombre
            <input name="name" className="ui-input" placeholder="Ej: Precintos" required />
          </label>
          <label className="ui-label">
            Unidad
            <input name="unitLabel" className="ui-input" defaultValue="unidades" required />
          </label>
          <label className="ui-label">
            Stock inicial
            <input name="openingStock" type="number" min="0" step="0.01" className="ui-input" defaultValue="0" />
          </label>
          <label className="ui-label">
            Cada empaque
            <input name="packageSize" type="number" min="0" step="0.01" className="ui-input" placeholder="Opcional" />
          </label>
          <label className="ui-label">
            Consumo por producción
            <input
              name="productionConsumptionRate"
              type="number"
              min="0"
              step="0.01"
              className="ui-input"
              defaultValue="0"
            />
          </label>
          <label className="ui-label">
            Alerta minima
            <input name="lowStockAlert" type="number" min="0" step="0.01" className="ui-input" defaultValue="0" />
          </label>
          <div className="flex items-end">
            <button type="submit" className="ui-btn-primary w-full">
              <PackagePlus className="h-4 w-4" />
              Crear insumo
            </button>
          </div>
        </form>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_360px]">
        <div className="grid gap-4">
          {supplies.map((supply) => {
            const stock = Number(supply.stock);
            const lowStock = stock <= Number(supply.lowStockAlert);

            return (
              <article key={supply.id} className="ui-panel overflow-hidden p-0">
                <div className="border-b border-slate-200 bg-gradient-to-r from-white via-white to-slate-50 px-5 py-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{supply.name}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        Unidad: <span className="font-medium text-slate-700">{supply.unitLabel}</span>
                        {supply.packageSize ? (
                          <>
                            {" "}
                            - Cada empaque rinde{" "}
                            <span className="font-medium text-slate-700">{Number(supply.packageSize).toFixed(2)}</span>
                          </>
                        ) : null}
                      </p>
                    </div>

                    <div
                      className={`rounded-2xl border px-4 py-3 ${lowStock ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-white"}`}
                    >
                      <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Stock actual</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">{stock.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 px-5 py-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                  <form action={registerInventoryMovementAction} className="grid gap-3 md:grid-cols-4 md:items-end">
                    <input type="hidden" name="supplyId" value={supply.id} />
                    <label className="ui-label">
                      Movimiento
                      <select name="movementType" className="ui-input" defaultValue="INGRESO">
                        <option value="INGRESO">Ingreso</option>
                        <option value="SALIDA">Salida</option>
                      </select>
                    </label>
                    <label className="ui-label">
                      Cantidad
                      <input name="quantity" type="number" min="0.01" step="0.01" className="ui-input" required />
                    </label>
                    <label className="ui-label">
                      Fecha
                      <input name="happenedAt" type="date" className="ui-input" />
                    </label>
                    <label className="ui-label">
                      Nota
                      <input name="note" className="ui-input" placeholder="Compra, uso, merma..." />
                    </label>
                    <div className="md:col-span-4">
                      <button type="submit" className="ui-btn-primary">
                        Registrar movimiento
                      </button>
                    </div>
                  </form>

                  <form action={updateInventorySupplySettingsAction} className="grid gap-3 md:grid-cols-3 md:items-end">
                    <input type="hidden" name="supplyId" value={supply.id} />
                    <label className="ui-label">
                      Cada empaque
                      <input
                        name="packageSize"
                        type="number"
                        min="0"
                        step="0.01"
                        className="ui-input"
                        defaultValue={supply.packageSize ? Number(supply.packageSize).toString() : ""}
                        placeholder="Opcional"
                      />
                    </label>
                    <label className="ui-label">
                      Consumo por producción
                      <input
                        name="productionConsumptionRate"
                        type="number"
                        min="0"
                        step="0.01"
                        className="ui-input"
                        defaultValue={Number(supply.productionConsumptionRate).toString()}
                      />
                    </label>
                    <label className="ui-label">
                      Alerta minima
                      <input
                        name="lowStockAlert"
                        type="number"
                        min="0"
                        step="0.01"
                        className="ui-input"
                        defaultValue={Number(supply.lowStockAlert).toString()}
                      />
                    </label>
                    <div className="md:col-span-3">
                      <button type="submit" className="ui-btn-soft">
                        Guardar configuracion
                      </button>
                    </div>
                  </form>
                </div>
              </article>
            );
          })}
        </div>

        <aside className="ui-panel">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Movimientos recientes</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-900">Ultima actividad</h2>
          <p className="mt-1 text-sm text-slate-500">
            Aquí se ve lo que entró, salió o lo que producción descontó automáticamente.
          </p>

          <div className="mt-5 space-y-3">
            {recentMovements.length ? (
              recentMovements.map((movement) => (
                <div key={movement.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{movement.supply.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{movementLabel(movement.movementType)}</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      {Number(movement.quantity).toFixed(2)} {movement.supply.unitLabel}
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Fecha: {shortDate(movement.happenedAt)}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Stock despues: {Number(movement.stockAfter).toFixed(2)} {movement.supply.unitLabel}
                  </p>
                  {movement.note ? <p className="mt-2 text-xs text-slate-600">{movement.note}</p> : null}
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
                Todavía no hay movimientos de inventario.
              </div>
            )}
          </div>
        </aside>
      </section>
    </AppShell>
  );
}
