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
      description="Registra una venta asociando cliente, repartidor, ítems y método de pago."
    >
      <Card>
        <SaleForm
          action={createSaleAction}
          clients={options.clients}
          workers={options.workers}
          products={options.products}
        />
      </Card>
    </AppShell>
  );
}
