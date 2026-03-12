import { Search } from "lucide-react";

export function ClientFilters({
  search,
  status
}: {
  search?: string;
  status?: string;
}) {
  return (
    <form className="grid gap-4 rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1.5fr_220px_160px]">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          name="search"
          defaultValue={search}
          placeholder="Buscar cliente por nombre, codigo o telefono..."
          className="w-full rounded-lg border border-slate-300 py-2 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
        />
      </div>
      <select
        name="status"
        defaultValue={status ?? "all"}
        className="rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      >
        <option value="all">Todos los estados</option>
        <option value="active">Solo activos</option>
        <option value="inactive">Solo inactivos</option>
      </select>
      <button
        type="submit"
        className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        Filtrar
      </button>
    </form>
  );
}
