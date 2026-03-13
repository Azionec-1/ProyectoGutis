export function SalesFilters({
  search,
  status
}: {
  search?: string;
  status?: string;
}) {
  return (
    <form className="ui-panel grid gap-4 p-4 md:grid-cols-[1.5fr_220px_160px]">
      <input
        name="search"
        defaultValue={search}
        placeholder="Buscar por cliente, código o distrito"
        className="ui-input"
      />
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
      <button
        type="submit"
        className="ui-btn-primary"
      >
        Filtrar
      </button>
    </form>
  );
}
