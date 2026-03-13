import Link from "next/link";

function buildHref(pathname: string, query: Record<string, string>) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) {
      params.set(key, value);
    }
  }
  const text = params.toString();
  return text ? `${pathname}?${text}` : pathname;
}

export function Pagination({
  pathname,
  page,
  totalPages,
  query
}: {
  pathname: string;
  page: number;
  totalPages: number;
  query: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const current = Math.min(Math.max(1, page), totalPages);
  const previousPage = Math.max(1, current - 1);
  const nextPage = Math.min(totalPages, current + 1);

  return (
    <div className="ui-panel flex items-center justify-between px-4 py-3 text-sm">
      <Link
        href={buildHref(pathname, { ...query, page: String(previousPage) })}
        className={`rounded-lg px-3 py-2 font-medium ${
          current === 1
            ? "pointer-events-none bg-slate-100 text-slate-400"
            : "ui-btn-soft px-3 py-2"
        }`}
      >
        Anterior
      </Link>
      <p className="text-slate-600">
        Página <span className="font-semibold text-slate-900">{current}</span> de{" "}
        <span className="font-semibold text-slate-900">{totalPages}</span>
      </p>
      <Link
        href={buildHref(pathname, { ...query, page: String(nextPage) })}
        className={`rounded-lg px-3 py-2 font-medium ${
          current === totalPages
            ? "pointer-events-none bg-slate-100 text-slate-400"
            : "ui-btn-soft px-3 py-2"
        }`}
      >
        Siguiente
      </Link>
    </div>
  );
}
