"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, Download, Factory, Package, ShoppingCart, Truck } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";

type PeriodType = "monthly" | "yearly";

type ReportData = {
  summary: {
    totalIncome: number;
    totalQuantitySold: number;
    totalOrders: number;
    deliveredSales: number;
    cancelledSales: number;
    totalProduced: number;
    activeProducts: number;
  };
  period: {
    type: PeriodType;
    label: string;
    month?: number;
    year: number;
  };
  salesTrend: Array<{
    label: string;
    totalIncome: number;
    orders: number;
  }>;
  productionTrend: Array<{
    label: string;
    quantity: number;
  }>;
  productPerformance: Array<{
    productId: string;
    name: string;
    stock: number;
    produced: number;
    sold: number;
    income: number;
  }>;
  salesByWorker: Array<{
    workerName: string;
    totalIncome: number;
    sales: number;
  }>;
};

const monthOptions = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" }
];

function formatCurrency(value: number) {
  return `S/ ${value.toFixed(2)}`;
}

function buildQuery(periodType: PeriodType, month: number, year: number) {
  const params = new URLSearchParams({
    periodType,
    year: String(year)
  });

  if (periodType === "monthly") {
    params.set("month", String(month));
  }

  return params.toString();
}

export function ReportsPanel() {
  const today = new Date();
  const [periodType, setPeriodType] = useState<PeriodType>("monthly");
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<"excel" | "pdf" | null>(null);

  const selectedMonthLabel = useMemo(
    () => monthOptions.find((option) => option.value === month)?.label ?? "",
    [month]
  );

  const topProducts = useMemo(
    () =>
      [...(reportData?.productPerformance ?? [])]
        .sort((left, right) => right.income - left.income)
        .slice(0, 3),
    [reportData]
  );

  const topWorker = useMemo(
    () =>
      [...(reportData?.salesByWorker ?? [])].sort((left, right) => right.totalIncome - left.totalIncome)[0] ?? null,
    [reportData]
  );

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/reports?${buildQuery(periodType, month, year)}`);
      const data = (await response.json()) as ReportData | { message?: string };

      if (!response.ok) {
        setError("message" in data ? data.message ?? "No se pudo cargar el reporte." : "No se pudo cargar el reporte.");
        setReportData(null);
      } else {
        setReportData(data as ReportData);
      }
    } catch {
      setError("No se pudo cargar el reporte.");
      setReportData(null);
    } finally {
      setLoading(false);
    }
  }, [month, periodType, year]);

  useEffect(() => {
    void fetchReport();
  }, [fetchReport]);

  const exportToExcel = async () => {
    if (!reportData) {
      return;
    }

    setExporting("excel");

    try {
      const XLSX = await import("xlsx");
      const workbook = XLSX.utils.book_new();
      const summarySheet = XLSX.utils.aoa_to_sheet([
        ["Resumen"],
        ["Periodo", reportData.period.label],
        ["Ingresos", reportData.summary.totalIncome],
        ["Cantidad vendida", reportData.summary.totalQuantitySold],
        ["Ventas", reportData.summary.totalOrders],
        ["Ventas enviadas", reportData.summary.deliveredSales],
        ["Ventas canceladas", reportData.summary.cancelledSales],
        ["Producción", reportData.summary.totalProduced],
        ["Productos activos", reportData.summary.activeProducts]
      ]);

      const productionSheet = XLSX.utils.aoa_to_sheet([
        ["Producto", "Cantidad actual", "Cantidad producida", "Cantidad vendida", "Ingresos"],
        ...reportData.productPerformance.map((item) => [
          item.name,
          String(item.stock),
          String(item.produced),
          String(item.sold),
          String(item.income)
        ])
      ]);

      const workerSheet = XLSX.utils.aoa_to_sheet([
        ["Repartidor", "Ventas", "Ingresos"],
        ...reportData.salesByWorker.map((item) => [
          item.workerName,
          String(item.sales),
          String(item.totalIncome)
        ])
      ]);

      XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumen");
      XLSX.utils.book_append_sheet(workbook, productionSheet, "Productos");
      XLSX.utils.book_append_sheet(workbook, workerSheet, "Repartidores");
      XLSX.writeFile(workbook, `reporte-${periodType}-${year}-${Date.now()}.xlsx`);
    } finally {
      setExporting(null);
    }
  };

  const exportToPdf = async () => {
    if (!reportData) {
      return;
    }

    setExporting("pdf");

    try {
      const [{ jsPDF }, { default: autoTable }] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable")
      ]);

      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const margin = 40;

      doc.setFontSize(18);
      doc.text("Reporte operativo", margin, 50);
      doc.setFontSize(10);
      doc.text(`Periodo: ${reportData.period.label}`, margin, 70);

      autoTable(doc, {
        startY: 90,
        head: [["Métrica", "Valor"]],
        body: [
          ["Ingresos", formatCurrency(reportData.summary.totalIncome)],
          ["Cantidad vendida", reportData.summary.totalQuantitySold],
          ["Ventas", reportData.summary.totalOrders],
          ["Ventas enviadas", reportData.summary.deliveredSales],
          ["Ventas canceladas", reportData.summary.cancelledSales],
          ["Producción", reportData.summary.totalProduced],
          ["Productos activos", reportData.summary.activeProducts]
        ]
      });

      doc.addPage();
      doc.setFontSize(16);
      doc.text("Rendimiento por producto", margin, 40);
      autoTable(doc, {
        startY: 55,
        head: [["Producto", "Cantidad actual", "Cantidad producida", "Cantidad vendida", "Ingresos"]],
        body: reportData.productPerformance.map((item) => [
          item.name,
          item.stock,
          item.produced,
          item.sold,
          formatCurrency(item.income)
        ])
      });

      doc.save(`reporte-${periodType}-${year}-${Date.now()}.pdf`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="ui-panel overflow-hidden p-0">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-blue-50/70 px-6 py-5">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <span className="ui-pill">Panel conectado</span>
              <h3 className="mt-3 text-xl font-semibold text-slate-900">Resumen operativo integrado</h3>
              <p className="mt-1 text-sm text-slate-500">
                Ventas, producción y productos se leen desde la misma base del sistema.
              </p>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-white/90 px-4 py-3 text-sm text-slate-600 shadow-sm">
              <p className="font-medium text-slate-900">Periodo actual</p>
              <p className="mt-1">{reportData?.period.label ?? "Cargando reporte..."}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 px-6 py-5 lg:grid-cols-[180px_180px_160px_auto] lg:items-end">
          <label className="ui-label">
            Tipo de reporte
            <select
              value={periodType}
              onChange={(event) => setPeriodType(event.target.value as PeriodType)}
              className="ui-select"
            >
              <option value="monthly">Mensual</option>
              <option value="yearly">Anual</option>
            </select>
          </label>

          {periodType === "monthly" ? (
            <label className="ui-label">
              Mes
              <select
                value={month}
                onChange={(event) => setMonth(Number(event.target.value))}
                className="ui-select"
              >
                {monthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <div className="ui-label">
              Mes
              <div className="ui-subtle-panel px-3 py-2 text-sm text-slate-500">Vista anual</div>
            </div>
          )}

          <label className="ui-label">
            Año
            <input
              type="number"
              min={2024}
              max={2100}
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
              className="ui-input"
            />
          </label>

          <div className="flex flex-wrap gap-2 lg:justify-end">
            <button type="button" onClick={() => void fetchReport()} className="ui-btn-primary" disabled={loading}>
              {loading ? "Actualizando..." : "Actualizar reporte"}
            </button>
            <button
              type="button"
              onClick={() => void exportToExcel()}
              className="ui-btn-soft"
              disabled={!reportData || exporting !== null}
            >
              <Download className="h-4 w-4" />
              {exporting === "excel" ? "Exportando..." : "Excel"}
            </button>
            <button
              type="button"
              onClick={() => void exportToPdf()}
              className="ui-btn-soft"
              disabled={!reportData || exporting !== null}
            >
              <Download className="h-4 w-4" />
              {exporting === "pdf" ? "Exportando..." : "PDF"}
            </button>
          </div>
        </div>
      </section>

      {error ? (
        <div className="ui-panel border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      {reportData ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Ingresos"
              value={formatCurrency(reportData.summary.totalIncome)}
              hint={`${reportData.summary.totalOrders} ventas registradas`}
              icon={ShoppingCart}
              tone="bg-blue-100 text-blue-700"
            />
            <StatCard
              label="Producción"
              value={reportData.summary.totalProduced}
              hint={`${reportData.summary.activeProducts} productos activos`}
              icon={Factory}
              tone="bg-emerald-100 text-emerald-700"
            />
            <StatCard
              label="Cantidad vendida"
              value={reportData.summary.totalQuantitySold}
              hint={`${reportData.summary.cancelledSales} ventas canceladas`}
              icon={Package}
              tone="bg-amber-100 text-amber-700"
            />
            <StatCard
              label="Ventas enviadas"
              value={reportData.summary.deliveredSales}
              hint="Pedidos cerrados en el periodo"
              icon={Truck}
              tone="bg-violet-100 text-violet-700"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.35fr_0.9fr]">
            <section className="ui-panel p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="ui-pill">Ventas</span>
                  <h3 className="mt-3 text-lg font-semibold text-slate-900">Movimiento de ventas</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {reportData.period.type === "monthly"
                      ? `Detalle del mes de ${selectedMonthLabel} ${year}.`
                      : `Detalle consolidado del año ${year}.`}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 px-3 py-2 text-right text-xs text-slate-500">
                  <p className="font-semibold text-slate-700">{formatCurrency(reportData.summary.totalIncome)}</p>
                  <p>Total del periodo</p>
                </div>
              </div>
              <div className="mt-6 h-80">
                <SalesTrendChart data={reportData.salesTrend} />
              </div>
            </section>

            <section className="ui-panel p-6">
              <span className="ui-pill">Producción</span>
              <h3 className="mt-3 text-lg font-semibold text-slate-900">Producción registrada</h3>
              <p className="mt-1 text-sm text-slate-500">
                Datos alimentados automáticamente desde el módulo de productos.
              </p>
              <div className="mt-6 h-80">
                <ProductionTrendChart data={reportData.productionTrend} />
              </div>
            </section>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <section className="ui-panel p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="ui-pill">Productos</span>
                  <h3 className="mt-3 text-lg font-semibold text-slate-900">Resumen por producto</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Si agregas o eliminas productos, esta tabla se ajusta sola y mantiene las cantidades reales del sistema.
                  </p>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <p className="font-semibold text-slate-800">{reportData.productPerformance.length}</p>
                  <p>filas activas</p>
                </div>
              </div>

              <div className="ui-table-wrap mt-5">
                <table className="ui-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th className="text-right">Cantidad actual</th>
                      <th className="text-right">Cantidad producida</th>
                      <th className="text-right">Cantidad vendida</th>
                      <th className="text-right">Ingresos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {reportData.productPerformance.map((item) => (
                      <tr key={item.productId} className="transition hover:bg-slate-50/80">
                        <td>
                          <div className="font-medium text-slate-900">{item.name}</div>
                        </td>
                        <td className="text-right">{item.stock}</td>
                        <td className="text-right">{item.produced}</td>
                        <td className="text-right">{item.sold}</td>
                        <td className="text-right font-semibold text-slate-900">{formatCurrency(item.income)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="space-y-6">
              <div className="ui-panel p-6">
                <span className="ui-pill">Destacados</span>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">Lectura rápida</h3>
                <div className="mt-5 space-y-3">
                  {topProducts.length ? (
                    topProducts.map((item, index) => (
                      <div key={item.productId} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                          Top {index + 1}
                        </p>
                        <p className="mt-2 font-semibold text-slate-900">{item.name}</p>
                        <div className="mt-2 flex items-center justify-between text-sm text-slate-500">
                          <span>{item.sold} vendidos</span>
                          <span className="font-semibold text-slate-900">{formatCurrency(item.income)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyMiniState text="Aún no hay productos con movimiento en este periodo." />
                  )}
                </div>

                <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Repartidor líder</p>
                  {topWorker ? (
                    <>
                      <p className="mt-2 text-base font-semibold text-slate-900">{topWorker.workerName}</p>
                      <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
                        <span>{topWorker.sales} ventas</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(topWorker.totalIncome)}</span>
                      </div>
                    </>
                  ) : (
                    <p className="mt-2 text-sm text-slate-500">Sin datos de repartidores todavía.</p>
                  )}
                </div>
              </div>

              <div className="ui-panel p-6">
                <span className="ui-pill">Repartidores</span>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">Desempeño por repartidor</h3>
                <p className="mt-1 text-sm text-slate-500">Ventas asignadas en el periodo seleccionado.</p>

                <div className="mt-5 space-y-3">
                  {reportData.salesByWorker.length ? (
                    reportData.salesByWorker.map((item) => (
                      <div
                        key={item.workerName}
                        className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3"
                      >
                        <div>
                          <p className="font-medium text-slate-900">{item.workerName}</p>
                          <p className="mt-1 text-sm text-slate-500">{item.sales} ventas registradas</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                          <span>{formatCurrency(item.totalIncome)}</span>
                          <ArrowRight className="h-4 w-4 text-slate-300" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyMiniState text="Aún no hay ventas con repartidor en este periodo." />
                  )}
                </div>
              </div>
            </section>
          </div>
        </>
      ) : loading ? (
        <div className="ui-panel p-10 text-center text-sm text-slate-500">Cargando reporte...</div>
      ) : null}
    </div>
  );
}

function SalesTrendChart({ data }: { data: ReportData["salesTrend"] }) {
  return (
    <MiniBars
      data={data.map((item) => ({
        label: item.label,
        value: item.totalIncome,
        detail: `${item.orders} ventas`,
        tone: "bg-blue-500"
      }))}
      emptyText="Aún no hay datos de ventas para este periodo."
      formatValue={formatCurrency}
    />
  );
}

function ProductionTrendChart({ data }: { data: ReportData["productionTrend"] }) {
  return (
    <MiniBars
      data={data.map((item) => ({
        label: item.label,
        value: item.quantity,
        detail: "unidades producidas",
        tone: "bg-emerald-500"
      }))}
      emptyText="Aún no hay producción registrada para este periodo."
    />
  );
}

function MiniBars({
  data,
  emptyText,
  formatValue
}: {
  data: Array<{ label: string; value: number; detail: string; tone: string }>;
  emptyText: string;
  formatValue?: (value: number) => string;
}) {
  const maxValue = Math.max(...data.map((item) => item.value), 0);

  if (!data.length || maxValue === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="grid h-full grid-rows-[1fr_auto] gap-4">
      <div className="relative rounded-2xl border border-slate-200 bg-slate-50/80 px-3 pb-4 pt-6">
        <div className="pointer-events-none absolute inset-x-0 bottom-4 top-6 grid grid-rows-4">
          {[0, 1, 2, 3].map((line) => (
            <div key={line} className="border-t border-dashed border-slate-200" />
          ))}
        </div>
        <div className="relative grid h-full grid-cols-[repeat(auto-fit,minmax(18px,1fr))] items-end gap-2">
          {data.map((item) => {
            const height = `${Math.max(10, (item.value / maxValue) * 100)}%`;
            return (
              <div key={item.label} className="group flex h-full flex-col items-center justify-end gap-2">
                <div className="opacity-0 transition group-hover:opacity-100">
                  <div className="rounded-lg bg-slate-900 px-2 py-1 text-[11px] text-white shadow-lg">
                    <div>{formatValue ? formatValue(item.value) : item.value}</div>
                    <div className="text-slate-300">{item.detail}</div>
                  </div>
                </div>
                <div className={`w-full rounded-t-xl ${item.tone} shadow-sm transition group-hover:opacity-85`} style={{ height }} />
              </div>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(18px,1fr))] gap-2 px-1">
        {data.map((item) => (
          <span key={item.label} className="text-center text-[11px] text-slate-500">
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function EmptyMiniState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
      {text}
    </div>
  );
}
