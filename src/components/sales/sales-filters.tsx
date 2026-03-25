import { Search } from "lucide-react";

export function SalesFilters({
  search,
  status
}: {
  search?: string;
  status?: string;
}) {
  return (
    <form className="ui-panel grid gap-4 p-4 lg:grid-cols-[minmax(0,1.7fr)_220px_160px]">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          name="search"
          defaultValue={search}
          placeholder="Buscar por cliente, código o distrito"
          className="ui-input pl-9"
        />
      </div>
      <select
        name="status"
        defaultValue={status ?? "all"}
        className="ui-select"
      >
        <option value="all">Todos los estados</option>
        <option value="PENDIENTE">Pendiente</option>
        <option value="ENVIADO">Enviado</option>
        <option value="CANCELADO">Cancelado</option>
      </select>
      <button type="submit" className="ui-btn-primary">
        Filtrar
      </button>
    </form>
  );
}
