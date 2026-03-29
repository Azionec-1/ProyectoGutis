import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { SaleForm } from "@/components/sales/sale-form";
import { createSaleAction } from "@/app/sales/actions";
import { getSaleFormOptions } from "@/lib/data/sale-service";

export default async function NewSalePage() {
  const options = await getSaleFormOptions();

  return (
    <AppShell
      title="Nueva venta"
      description="Registra un pedido rápido con lo mínimo necesario y completa el resto después si hace falta."
    >
      <Card>
        <SaleForm
          action={createSaleAction}
          clients={options.clients}
          products={options.products}
        />
      </Card>
    </AppShell>
  );
}
