import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { PaymentForm } from "@/components/sales/payment-form";
import { registerSalePaymentAction } from "@/app/sales/actions";
import {
  PAYMENT_METHOD_OPTIONS,
  SALE_STATUS_OPTIONS,
  getSaleById
} from "@/lib/data/sale-service";
import { currency, shortDate } from "@/lib/utils";

function saleStatusLabel(value: string) {
  return SALE_STATUS_OPTIONS.find((item) => item.value === value)?.label ?? value;
}

function paymentLabel(value: string) {
  return PAYMENT_METHOD_OPTIONS.find((item) => item.value === value)?.label ?? value;
}

function paymentStatusLabel(value: string) {
  switch (value) {
    case "PAGADO":
      return "Pagado";
    case "PARCIAL":
      return "Parcial";
    case "CREDITO":
      return "Crédito";
    default:
      return value;
  }
}

function operationLabel(value: string) {
  return value === "RECARGA" ? "Recarga" : "Venta";
}

export default async function SaleDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sale = await getSaleById(id);

  if (!sale) {
    notFound();
  }

  return (
    <AppShell
      title={`Venta ${sale.client.code}`}
      description="Detalle completo de la venta, créditos, abonos e inventario registrado."
      action={
        <Link
          href="/sales"
          className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Volver a ventas
        </Link>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <Card className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Datos generales</h3>
          <p className="text-sm text-slate-600">
            Cliente: <span className="font-medium text-slate-900">{sale.client.fullName}</span>
          </p>
          <p className="text-sm text-slate-600">
            Estado: <span className="font-medium text-slate-900">{saleStatusLabel(sale.status)}</span>
          </p>
          <p className="text-sm text-slate-600">
            Operación: <span className="font-medium text-slate-900">{operationLabel(sale.operationType)}</span>
          </p>
          <p className="text-sm text-slate-600">
            Cobro: <span className="font-medium text-slate-900">{paymentStatusLabel(sale.paymentStatus)}</span>
          </p>
          <p className="text-sm text-slate-600">
            Metodo de pago: <span className="font-medium text-slate-900">{paymentLabel(sale.paymentMethod)}</span>
          </p>
          <p className="text-sm text-slate-600">
            Programado: <span className="font-medium text-slate-900">{shortDate(sale.scheduledAt)}</span>
          </p>
          <p className="text-sm text-slate-600">
            Repartidor: <span className="font-medium text-slate-900">{sale.worker?.fullName ?? "Sin asignar"}</span>
          </p>
          {sale.dueDate ? (
            <p className="text-sm text-slate-600">
              Fecha de cancelacion: <span className="font-medium text-slate-900">{shortDate(sale.dueDate)}</span>
            </p>
          ) : null}
          {sale.settledAt ? (
            <p className="text-sm text-slate-600">
              Deuda cancelada: <span className="font-medium text-slate-900">{shortDate(sale.settledAt)}</span>
            </p>
          ) : null}
          {sale.notes ? (
            <p className="text-sm text-slate-600">
              Nota: <span className="font-medium text-slate-900">{sale.notes}</span>
            </p>
          ) : null}
        </Card>

        <Card className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900">Resumen economico</h3>
          <p className="text-sm text-slate-600">
            Subtotal: <span className="font-semibold text-slate-900">{currency(Number(sale.subtotalAmount))}</span>
          </p>
          <p className="text-sm text-slate-600">
            Descuento: <span className="font-semibold text-slate-900">{currency(Number(sale.discountAmount))}</span>
          </p>
          <p className="text-sm text-slate-600">
            Total: <span className="text-lg font-bold text-slate-900">{currency(Number(sale.totalAmount))}</span>
          </p>
          <p className="text-sm text-slate-600">
            Cobrado: <span className="font-semibold text-slate-900">{currency(Number(sale.amountPaid))}</span>
          </p>
          <p className="text-sm text-slate-600">
            Saldo pendiente: <span className="font-semibold text-slate-900">{currency(Number(sale.amountDue))}</span>
          </p>
        </Card>
      </div>

      <Card>
        <h3 className="mb-3 text-lg font-semibold text-slate-900">Items enviados</h3>
        <div className="space-y-2">
          {sale.items.map((item) => (
            <div
              key={item.id}
              className="grid gap-2 rounded-lg border border-slate-200 p-3 text-sm text-slate-700 md:grid-cols-[1.4fr_0.5fr_0.7fr_0.8fr]"
            >
              <p className="font-medium text-slate-900">{item.product.name}</p>
              <p>Cant: {item.quantity}</p>
              <p>PU: {currency(Number(item.unitPrice))}</p>
              <p>Total: {currency(Number(item.totalPrice))}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Abonos</h3>
          {Number(sale.amountDue) > 0 ? (
            <PaymentForm saleId={sale.id} action={registerSalePaymentAction} />
          ) : (
            <p className="text-sm text-slate-500">La venta ya no tiene saldo pendiente.</p>
          )}
        </Card>

        <Card>
          <h3 className="mb-3 text-lg font-semibold text-slate-900">Historial de pagos</h3>
          <div className="space-y-2">
            {sale.payments.length ? (
              sale.payments.map((payment) => (
                <div key={payment.id} className="rounded-lg border border-slate-200 p-3 text-sm text-slate-700">
                  <p className="font-medium text-slate-900">{currency(Number(payment.amount))}</p>
                  <p className="mt-1">Metodo: {paymentLabel(payment.paymentMethod)}</p>
                  <p className="mt-1">Fecha: {shortDate(payment.paidAt)}</p>
                  {payment.note ? <p className="mt-1">Nota: {payment.note}</p> : null}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">Aun no hay pagos registrados para esta venta.</p>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="mb-3 text-lg font-semibold text-slate-900">Movimientos registrados</h3>
        <div className="space-y-2">
          {sale.inventoryMovements.length ? (
            sale.inventoryMovements.map((movement) => (
              <div key={movement.id} className="rounded-lg border border-slate-200 p-3 text-sm text-slate-700">
                <p className="font-medium text-slate-900">{movement.note || "Movimiento de inventario"}</p>
                <p className="mt-1">Tipo: {movement.movementType}</p>
                <p className="mt-1">Cantidad: {movement.quantity}</p>
                <p className="mt-1">Fecha: {shortDate(movement.happenedAt)}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">Aun no hay movimientos registrados para esta venta.</p>
          )}
        </div>
      </Card>
    </AppShell>
  );
}
