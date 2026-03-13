import { Search } from "lucide-react";

export function ClientFilters({
  search,
  status
}: {
  search?: string;
  status?: string;
}) {
  return (
    <form className="ui-panel grid gap-4 p-4 md:grid-cols-[1.5fr_220px_160px]">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          name="search"
          defaultValue={search}
          placeholder="Buscar cliente por nombre, código o teléfono..."
          className="ui-input py-2 pl-10 pr-4"
        />
      </div>
      <select
        name="status"
        defaultValue={status ?? "all"}
        className="ui-select px-4 py-2"
      >
        <option value="all">Todos los estados</option>
        <option value="active">Solo activos</option>
        <option value="inactive">Solo inactivos</option>
      </select>
      <button
        type="submit"
        className="ui-btn-primary px-5"
      >
        Filtrar
      </button>
    </form>
  );
}
