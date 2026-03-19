"use client";

import React, { useState } from "react";

export default function ReportExport() {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const download = async (format: "csv" | "xlsx") => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (format) params.set("format", format);

      const url = `/api/admin/reports/export?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Error generando el archivo");
      const blob = await res.blob();

      // Try to get filename from header
      const cd = res.headers.get("content-disposition");
      let filename = cd ? cd.split("filename=")[1]?.replace(/\"/g, "") : null;
      if (!filename) {
        const s = startDate || "start";
        const e = endDate || "end";
        filename = `reporte_items_${s}_${e}.${format}`;
      }

      const objectUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Error al descargar el reporte");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ui-panel flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-semibold text-slate-900">Generar reporte de ventas</p>
        <p className="text-sm text-slate-500">Exportación de reporte consolidado por rango de fechas.</p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex gap-2">
          <label className="sr-only">Fecha inicio</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-md border px-3 py-2 text-sm"
            placeholder="Fecha inicio"
          />

          <label className="sr-only">Fecha fin</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-md border px-3 py-2 text-sm"
            placeholder="Fecha fin"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => download("csv")}
            disabled={loading}
            className="ui-btn-default"
          >
            {loading ? "Generando..." : "Exportar CSV"}
          </button>

          <button
            type="button"
            onClick={() => download("xlsx")}
            disabled={loading}
            className="ui-btn-primary"
          >
            {loading ? "Generando..." : "Exportar XLSX"}
          </button>
        </div>
      </div>
    </div>
  );
}
