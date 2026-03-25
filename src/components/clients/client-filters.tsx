"use client";

import { Search } from "lucide-react";

export function ClientFilters({
  search,
  status,
  onSearchChange,
  onStatusChange
}: {
  search: string;
  status: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}) {
  return (
    <div className="ui-panel grid gap-4 p-4 lg:grid-cols-[minmax(0,1.7fr)_220px]">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          name="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar cliente por nombre, codigo o telefono"
          className="ui-input pl-9"
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      <select
        name="status"
        value={status}
        onChange={(event) => onStatusChange(event.target.value)}
        className="ui-select"
      >
        <option value="all">Todos los estados</option>
        <option value="active">Solo activos</option>
        <option value="inactive">Solo inactivos</option>
      </select>
    </div>
  );
}
