import Link from "next/link";
import { MapPin, Phone, UserCircle } from "lucide-react";

type ClientRow = Awaited<ReturnType<typeof import("@/lib/data/client-service").listClients>>[number];

export function ClientsGrid({ clients }: { clients: ClientRow[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      {clients.map((client) => (
        <div
          key={client.id}
          className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <UserCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{client.fullName}</h3>
                <p className="text-sm text-slate-500">{client.code}</p>
              </div>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                client.isActive ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-600"
              }`}
            >
              {client.isActive ? "Activo" : "Inactivo"}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Phone className="h-4 w-4" />
              <span>{client.phone}</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-slate-600">
              <MapPin className="mt-0.5 h-4 w-4" />
              <span>{client.address}</span>
            </div>
            <p className="text-sm text-slate-500">{client.district}</p>
          </div>

          {client.googleMapsUrl ? (
            <div className="mt-4 border-t border-slate-200 pt-4">
              <a
                href={client.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <MapPin className="h-4 w-4" />
                Ver ubicacion en Google Maps
              </a>
            </div>
          ) : null}

          <div className="mt-4 flex gap-2">
            <Link
              href={`/clients/${client.id}/edit`}
              className="flex-1 rounded-lg bg-blue-50 px-3 py-2 text-center text-sm text-blue-600 transition hover:bg-blue-100"
            >
              Editar
            </Link>
            <Link
              href={`/clients/${client.id}`}
              className="flex-1 rounded-lg bg-slate-50 px-3 py-2 text-center text-sm text-slate-600 transition hover:bg-slate-100"
            >
              Ver ficha
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
