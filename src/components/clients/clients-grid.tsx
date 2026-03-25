import Link from "next/link";
import { ChevronRight, MapPin, Phone, UserCircle } from "lucide-react";
import { toggleClientStatusAction } from "@/app/clients/actions";

type ClientRow = Awaited<ReturnType<typeof import("@/lib/data/client-service").listClients>>[number];

export function ClientsGrid({ clients }: { clients: ClientRow[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      {clients.map((client) => (
        <article key={client.id} className="ui-panel overflow-hidden p-0">
          <div className="border-b border-slate-200 bg-gradient-to-r from-white via-white to-blue-50/60 px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <UserCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">{client.code}</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900">{client.fullName}</h3>
                </div>
              </div>
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${
                  client.isActive
                    ? "border-blue-100 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-slate-100 text-slate-600"
                }`}
              >
                {client.isActive ? "Activo" : "Inactivo"}
              </span>
            </div>
          </div>

          <div className="grid gap-3 px-5 py-5 md:grid-cols-2">
            <div className="ui-subtle-panel px-4 py-3">
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                <Phone className="h-3.5 w-3.5" />
                Contacto
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{client.phone}</p>
            </div>

            <div className="ui-subtle-panel px-4 py-3">
              <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                <MapPin className="h-3.5 w-3.5" />
                Zona
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{client.district}</p>
            </div>

            <div className="ui-subtle-panel px-4 py-3 md:col-span-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Dirección</p>
              <p className="mt-2 text-sm text-slate-700">{client.address}</p>
            </div>
          </div>

          <div className="border-t border-slate-200 px-5 py-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-3 text-sm">
                {client.googleMapsUrl ? (
                  <a
                    href={client.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 font-medium text-blue-600 hover:text-blue-700"
                  >
                    <MapPin className="h-4 w-4" />
                    Ver ubicación
                  </a>
                ) : (
                  <span className="text-slate-400">Sin ubicación enlazada</span>
                )}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Link href={`/clients/${client.id}/edit`} className="ui-btn-soft">
                  Editar
                </Link>
                <Link href={`/clients/${client.id}`} className="ui-btn-soft">
                  Ver ficha
                  <ChevronRight className="h-4 w-4" />
                </Link>
                <form action={toggleClientStatusAction}>
                  <input type="hidden" name="id" value={client.id} />
                  <input type="hidden" name="nextStatus" value={String(!client.isActive)} />
                  <button
                    type="submit"
                    className={`inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                      client.isActive
                        ? "border border-rose-100 bg-rose-50 text-rose-600 hover:bg-rose-100"
                        : "border border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                    }`}
                  >
                    {client.isActive ? "Desactivar" : "Activar"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
