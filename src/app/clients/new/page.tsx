import { AppShell } from "@/components/layout/app-shell";
import { ClientForm } from "@/components/clients/client-form";
import { Card } from "@/components/ui/card";
import { createClientAction } from "@/app/clients/actions";

export default function NewClientPage() {
  return (
    <AppShell
      title="Nuevo cliente"
      description="Registra la ficha base del cliente con direccion, referencia y enlace de mapa para el reparto."
    >
      <Card>
        <ClientForm action={createClientAction} submitLabel="Guardar cliente" />
      </Card>
    </AppShell>
  );
}
