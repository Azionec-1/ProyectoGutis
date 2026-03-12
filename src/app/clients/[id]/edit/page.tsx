import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ClientForm } from "@/components/clients/client-form";
import { Card } from "@/components/ui/card";
import { updateClientAction } from "@/app/clients/actions";
import { getClientById } from "@/lib/data/client-service";

export default async function EditClientPage({
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
      title={`Editar ${client.fullName}`}
      description="Actualiza datos operativos y referencias del cliente sin perder trazabilidad."
    >
      <Card>
        <ClientForm
          action={updateClientAction.bind(null, client.id)}
          submitLabel="Actualizar cliente"
          defaults={client}
        />
      </Card>
    </AppShell>
  );
}
