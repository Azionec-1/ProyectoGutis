import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getClientById } from "@/lib/data/client-service";

export default async function ClientDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClientById(id);

  if (!client) {
    notFound();
  }

  return (
    <AppShell
      title={client.fullName}
      description="Ficha central del cliente con referencias operativas para reparto y seguimiento."
      action={
        <Link
          href={`/clients/${client.id}/edit`}
          className="inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Editar ficha
        </Link>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">
                {client.code}
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-ink">{client.fullName}</h3>
            </div>
            <Badge active={client.isActive}>{client.isActive ? "Activo" : "Inactivo"}</Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Teléfono</p>
              <p className="mt-2 font-medium text-slate-800">{client.phone}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Zona</p>
              <p className="mt-2 font-medium text-slate-800">{client.district}</p>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Dirección</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">{client.address}</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Referencia</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {client.referenceNote || "Sin referencia registrada."}
            </p>
          </div>

          {client.googleMapsUrl ? (
            <a
              href={client.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Abrir Google Maps
            </a>
          ) : null}
        </Card>

        <div className="space-y-6">
          <Card>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">
              Foto de fachada
            </p>
            {client.facadePhotoUrl ? (
              <div className="mt-4 overflow-hidden rounded-3xl">
                <Image
                  src={client.facadePhotoUrl}
                  alt={`Fachada de ${client.fullName}`}
                  width={900}
                  height={600}
                  className="h-64 w-full object-cover"
                />
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">No hay imagen registrada para este cliente.</p>
            )}
          </Card>

          <Card>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">
              Historial reciente de ventas
            </p>
            <div className="mt-4 space-y-3">
              <p className="text-sm text-slate-500">Aún no hay datos.</p>
            </div>
          </Card>

          <Card>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-700">
              Movimientos de inventario
            </p>
            <div className="mt-4 space-y-3">
              <p className="text-sm text-slate-500">Aún no hay datos.</p>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
