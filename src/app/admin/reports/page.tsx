
'use client';

import { Card, Title, Text, BarChart, DateRangePicker } from '@tremor/react';
import { useState, useEffect, useCallback } from 'react';
import { StatCard } from '@/components/ui/stat-card';
import { es } from 'date-fns/locale';
import { ShoppingCart, Package, Ban, Truck, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportData {
  summary: {
    totalIncome: number;
    totalQuantity: number;
    totalOrders: number;
    uniqueClients: number;
    averagePerOrder: number;
    cancelledSales: number;
    deliveredSales: number;
  };
  daily: Array<{
    date: string;
    totalIncome: number;
    orders: number;
    uniqueClients: number;
    averageOrder: number;
  }>;
  salesByProduct: Record<string, { total: number; quantity: number }>;
  salesByDelivery: Record<string, { total: number; sales: number }>;
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: new Date(),
    to: new Date(),
  });
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    if (!dateRange.from || !dateRange.to) return;
    setLoading(true);
    setError(null);

    const response = await fetch(
      `/api/admin/reports?startDate=${dateRange.from.toISOString()}&endDate=${dateRange.to.toISOString()}`
    );

    const data = await response.json();

    if (
      !response.ok ||
      !data ||
      typeof data !== 'object' ||
      !('summary' in data) ||
      !('daily' in data) ||
      !('salesByProduct' in data) ||
      !('salesByDelivery' in data)
    ) {
      setError(data?.message || 'No se pudo obtener el reporte.');
      setReportData(null);
    } else {
      setReportData(data as ReportData);
    }

    setLoading(false);
  }, [dateRange.from, dateRange.to]);

  const exportToExcel = () => {
    if (!reportData) return;

    const workbook = XLSX.utils.book_new();

    const summarySheet = XLSX.utils.aoa_to_sheet([
      ['Resumen'],
      ['Ingresos', reportData.summary.totalIncome],
      ['Ordenes', reportData.summary.totalOrders],
      ['Clientes Únicos', reportData.summary.uniqueClients],
      ['Promedio por Orden', reportData.summary.averagePerOrder],
      ['Ventas Canceladas', reportData.summary.cancelledSales],
      ['Ventas Enviadas', reportData.summary.deliveredSales],
    ]);

    const dailyRows = [['Fecha', 'Ventas', 'Ordenes', 'Clientes', 'Promedio Orden']];
    reportData.daily.forEach((d) => {
      dailyRows.push([
        d.date,
        String(d.totalIncome),
        String(d.orders),
        String(d.uniqueClients),
        String(d.averageOrder),
      ]);
    });
    const dailySheet = XLSX.utils.aoa_to_sheet(dailyRows);

    const productRows = [['Producto', 'Ventas', 'Cantidad']];
    Object.entries(reportData.salesByProduct).forEach(([name, { total, quantity }]) => {
      productRows.push([name, String(total), String(quantity)]);
    });
    const productSheet = XLSX.utils.aoa_to_sheet(productRows);

    const deliveryRows = [['Repartidor', 'Ventas', 'Ventas totales']];
    Object.entries(reportData.salesByDelivery).forEach(([name, { total, sales }]) => {
      deliveryRows.push([name, String(total), String(sales)]);
    });
    const deliverySheet = XLSX.utils.aoa_to_sheet(deliveryRows);

    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');
    XLSX.utils.book_append_sheet(workbook, dailySheet, 'Diario');
    XLSX.utils.book_append_sheet(workbook, productSheet, 'Por Producto');
    XLSX.utils.book_append_sheet(workbook, deliverySheet, 'Por Repartidor');

    XLSX.writeFile(workbook, `reporte-ventas-${Date.now()}.xlsx`);
  };

  const exportToPdf = () => {
    if (!reportData) return;

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 40;

    doc.setFontSize(18);
    doc.text('Reporte de Ventas', margin, 60);
    doc.setFontSize(10);
    const fromDateLabel = dateRange.from ? dateRange.from.toLocaleDateString() : '';
    const toDateLabel = dateRange.to ? dateRange.to.toLocaleDateString() : '';
    doc.text(`Rango: ${fromDateLabel} - ${toDateLabel}`, margin, 80);

    doc.setFontSize(12);
    doc.text('Resumen', margin, 110);

    autoTable(doc, {
      startY: 120,
      head: [['Métrica', 'Valor']],
      body: [
        ['Ingresos', `S/ ${reportData.summary.totalIncome.toFixed(2)}`],
        ['Ordenes', reportData.summary.totalOrders],
        ['Clientes Únicos', reportData.summary.uniqueClients],
        ['Promedio por Orden', `S/ ${reportData.summary.averagePerOrder.toFixed(2)}`],
        ['Ventas Canceladas', reportData.summary.cancelledSales],
        ['Ventas Enviadas', reportData.summary.deliveredSales],
      ],
      theme: 'grid',
      margin: { left: margin, right: margin },
    });

    doc.addPage();
    doc.setFontSize(16);
    doc.text('Ventas por Producto', margin, 40);

    autoTable(doc, {
      startY: 55,
      head: [['Producto', 'Ventas', 'Cantidad']],
      body: Object.entries(reportData.salesByProduct).map(([name, { total, quantity }]) => [name, total, quantity]),
      theme: 'grid',
      margin: { left: margin, right: margin },
    });

    doc.addPage();
    doc.setFontSize(16);
    doc.text('Ventas por Repartidor', margin, 40);

    autoTable(doc, {
      startY: 55,
      head: [['Repartidor', 'Ventas', 'Ventas totales']],
      body: Object.entries(reportData.salesByDelivery).map(([name, { total, sales }]) => [name, total, sales]),
      theme: 'grid',
      margin: { left: margin, right: margin },
    });

    doc.save(`reporte-ventas-${Date.now()}.pdf`);
  };

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const [activeTab, setActiveTab] = useState<'saldos' | 'resumen' | 'producto'>('saldos');

  const dailyChartData = reportData?.daily.map((d) => ({
    date: d.date,
    Ventas: d.totalIncome,
    Ordenes: d.orders,
  })) ?? [];

  const salesByProductData = Object.entries(reportData?.salesByProduct ?? {}).map(([name, { total }]) => ({
    name,
    'Ventas': total,
  }));

  const salesByDeliveryData = Object.entries(reportData?.salesByDelivery ?? {}).map(([name, { total }]) => ({
    name,
    'Ventas': total,
  }));

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>Reporte de Ventas</Title>
      <Text>Visualiza los reportes de ventas de tu negocio.</Text>
      <Card className="mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <DateRangePicker
            className="max-w-md"
            value={dateRange}
            onValueChange={setDateRange}
            locale={es}
          />
          <div className="flex flex-wrap gap-2">
            <button onClick={fetchReport} disabled={loading} className="ui-btn-primary">
              {loading ? 'Generando...' : 'Generar Reporte'}
            </button>
            <button
              onClick={exportToExcel}
              disabled={!reportData}
              className="ui-btn-secondary flex items-center gap-2"
              type="button"
            >
              <Download className="h-4 w-4" />
              Excel
            </button>
            <button
              onClick={exportToPdf}
              disabled={!reportData}
              className="ui-btn-secondary flex items-center gap-2"
              type="button"
            >
              <Download className="h-4 w-4" />
              PDF
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
        {reportData && (
          <div className="mt-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Ventas Totales" value={`S/ ${reportData.summary.totalIncome.toFixed(2)}`} icon={ShoppingCart} tone="blue" />
              <StatCard label="Ordenes Totales" value={reportData.summary.totalOrders} icon={Package} tone="green" />
              <StatCard label="Clientes Únicos" value={reportData.summary.uniqueClients} icon={Truck} tone="amber" />
              <StatCard label="Promedio Orden" value={`S/ ${reportData.summary.averagePerOrder.toFixed(2)}`} icon={Ban} tone="violet" />
            </div>

            <div className="mt-6">
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { key: 'saldos', label: 'Saldos' },
                    { key: 'resumen', label: 'Resumen' },
                    { key: 'producto', label: 'Por Producto' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    type="button"
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                      activeTab === tab.key
                        ? 'bg-blue-600 text-white shadow'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="mt-6">
                {activeTab === 'saldos' && (
                  <div className="space-y-6">
                    <BarChart
                      className="h-72"
                      data={dailyChartData}
                      index="date"
                      categories={['Ventas', 'Ordenes']}
                      colors={['blue', 'orange']}
                      yAxisWidth={40}
                    />

                    <div className="overflow-x-auto rounded-lg border">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ventas</th>
                            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Ordenes</th>
                            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Clientes</th>
                            <th className="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Promedio</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {reportData.daily.map((d) => (
                            <tr key={d.date}>
                              <td className="px-4 py-3 text-sm text-gray-700">{new Date(d.date).toLocaleDateString()}</td>
                              <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">S/ {d.totalIncome.toFixed(2)}</td>
                              <td className="px-4 py-3 text-right text-sm text-gray-700">{d.orders}</td>
                              <td className="px-4 py-3 text-right text-sm text-gray-700">{d.uniqueClients}</td>
                              <td className="px-4 py-3 text-right text-sm text-gray-700">S/ {d.averageOrder.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'resumen' && (
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div>
                      <Title>Ventas por Producto</Title>
                      <BarChart
                        className="mt-4 h-72"
                        data={salesByProductData}
                        index="name"
                        categories={['Ventas']}
                        colors={['blue']}
                        yAxisWidth={48}
                      />
                    </div>
                    <div>
                      <Title>Ventas por Repartidor</Title>
                      <BarChart
                        className="mt-4 h-72"
                        data={salesByDeliveryData}
                        index="name"
                        categories={['Ventas']}
                        colors={['blue']}
                        yAxisWidth={48}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'producto' && (
                  <div>
                    <Title>Ventas por Producto</Title>
                    <BarChart
                      className="mt-4 h-72"
                      data={salesByProductData}
                      index="name"
                      categories={['Ventas']}
                      colors={['blue']}
                      yAxisWidth={48}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Card>
    </main>
  );
}
