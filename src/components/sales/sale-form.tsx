"use client";

import { useActionState, useMemo, useState } from "react";
import { ClipboardList, Package, Plus, Receipt, Search, Trash2, UserRound } from "lucide-react";
import { PAYMENT_METHOD_OPTIONS } from "@/lib/data/sale-service";
import { currency } from "@/lib/utils";

const PAYMENT_STATUS_PAID = "PAGADO";
const PAYMENT_STATUS_PARTIAL = "PARCIAL";
const PAYMENT_STATUS_CREDIT = "CREDITO";
const SALE_OPERATION_SALE = "VENTA";
const SALE_OPERATION_REFILL = "RECARGA";

type FormState = {
  error?: string;
  errors?: string[];
};

type ItemRow = {
  id: string;
  productId: string;
  quantityInput: string;
  unitPrice: number;
};

type ProductOption = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

const createEmptyItem = (): ItemRow => ({
  id: crypto.randomUUID(),
  productId: "",
  quantityInput: "1",
  unitPrice: 0
});

function getItemQuantity(quantityInput: string) {
  if (!/^\d+$/.test(quantityInput.trim())) {
    return 0;
  }

  const quantity = Number(quantityInput);
  return Number.isInteger(quantity) && quantity > 0 ? quantity : 0;
}

export function SaleForm({
  action,
  clients,
  products
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  clients: Array<{ id: string; code: string; fullName: string; phone: string }>;
  products: ProductOption[];
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [items, setItems] = useState<ItemRow[]>([createEmptyItem()]);
  const [operationType, setOperationType] = useState<string>(SALE_OPERATION_SALE);
  const [paymentStatus, setPaymentStatus] = useState<string>(PAYMENT_STATUS_PAID);
  const [initialPaidAmountInput, setInitialPaidAmountInput] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [clientQuery, setClientQuery] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [showClientResults, setShowClientResults] = useState(false);

  const productsMap = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products]
  );

  const reservedByProduct = useMemo(() => {
    const totals = new Map<string, number>();

    items.forEach((item) => {
      if (!item.productId) {
        return;
      }

      totals.set(item.productId, (totals.get(item.productId) ?? 0) + getItemQuantity(item.quantityInput));
    });

    return totals;
  }, [items]);

  const normalizedQuery = clientQuery.trim().toLowerCase();
  const filteredClients = normalizedQuery
    ? clients.filter((client) =>
        `${client.code} ${client.fullName} ${client.phone}`.toLowerCase().includes(normalizedQuery)
      )
    : clients.slice(0, 8);

  const subtotal = items.reduce((sum, item) => sum + getItemQuantity(item.quantityInput) * item.unitPrice, 0);
  const total = subtotal;
  const initialPaidAmount =
    paymentStatus === PAYMENT_STATUS_PAID
      ? total
      : paymentStatus === PAYMENT_STATUS_CREDIT
        ? 0
        : Number(initialPaidAmountInput || "0");
  const amountDue = Math.max(0, total - initialPaidAmount);
  const selectedItems = items.filter((item) => item.productId);

  function updateItem(id: string, patch: Partial<ItemRow>) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function removeItem(id: string) {
    setItems((current) => (current.length > 1 ? current.filter((item) => item.id !== id) : current));
  }

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <section className="ui-panel p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <UserRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Datos de la venta</h3>
              <p className="mt-1 text-sm text-slate-500">
                Registra a quién le vendiste y lo que pidió, sin llenar datos de más.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <p className="ui-label">Tipo de pedido</p>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setOperationType(SALE_OPERATION_SALE)}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    operationType === SALE_OPERATION_SALE
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <p className="text-sm font-semibold">Venta</p>
                  <p className="mt-1 text-xs">Pedido normal con salida regular de productos.</p>
                </button>
                <button
                  type="button"
                  onClick={() => setOperationType(SALE_OPERATION_REFILL)}
                  className={`rounded-2xl border px-4 py-3 text-left transition ${
                    operationType === SALE_OPERATION_REFILL
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <p className="text-sm font-semibold">Recarga</p>
                  <p className="mt-1 text-xs">El cliente ya tiene su bidon y solo se recarga agua.</p>
                </button>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="ui-label" htmlFor="clientSearch">
                Cliente
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="clientSearch"
                    type="text"
                    value={clientQuery}
                    onChange={(event) => {
                      setClientQuery(event.target.value);
                      setSelectedClientId("");
                      setShowClientResults(event.target.value.trim().length > 0);
                    }}
                    onFocus={() => setShowClientResults(normalizedQuery.length > 0)}
                    onBlur={() => {
                      setTimeout(() => setShowClientResults(false), 120);
                    }}
                    placeholder="Escribe nombre, telefono o codigo"
                    className="ui-input pl-10"
                    autoComplete="off"
                    required
                  />
                </div>
              </label>
              <input type="hidden" name="clientId" value={selectedClientId} />
              <input type="hidden" name="clientDraftName" value={clientQuery.trim()} />

              {showClientResults ? (
                <div className="mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  {filteredClients.length ? (
                    <div className="max-h-52 overflow-y-auto">
                      {filteredClients.map((client) => (
                        <button
                          key={client.id}
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => {
                            setSelectedClientId(client.id);
                            setClientQuery(`${client.fullName} - ${client.phone}`);
                            setShowClientResults(false);
                          }}
                          className="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left transition hover:bg-blue-50 last:border-b-0"
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{client.fullName}</p>
                            <p className="mt-1 text-xs text-slate-500">{client.code}</p>
                          </div>
                          <span className="text-xs text-slate-500">{client.phone}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-4 text-sm text-slate-500">
                      No hay coincidencias. Si continuas, se creara un cliente pendiente con ese nombre.
                    </div>
                  )}
                </div>
              ) : null}

              <p className="mt-2 text-xs text-slate-500">
                Si el cliente no existe, escribe el nombre y se creara automaticamente como pendiente.
              </p>
            </div>

            <label className="ui-label">
              Tipo de cobro
              <select
                value={paymentStatus}
                onChange={(event) => setPaymentStatus(event.target.value)}
                className="ui-select"
              >
                <option value={PAYMENT_STATUS_PAID}>Pagado</option>
                <option value={PAYMENT_STATUS_PARTIAL}>Pago parcial</option>
                <option value={PAYMENT_STATUS_CREDIT}>Crédito</option>
              </select>
            </label>

            <label className="ui-label">
              Metodo de pago
              <select name="paymentMethod" defaultValue="EFECTIVO" className="ui-select">
                {PAYMENT_METHOD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            {paymentStatus === PAYMENT_STATUS_PARTIAL ? (
              <label className="ui-label">
                Abono inicial
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={initialPaidAmountInput}
                  onChange={(event) => setInitialPaidAmountInput(event.target.value)}
                  className="ui-input"
                  placeholder="Ej: 20"
                />
              </label>
            ) : null}

            {paymentStatus !== PAYMENT_STATUS_PAID ? (
              <label className="ui-label">
                Fecha de cancelacion
                <input
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  className="ui-input"
                />
              </label>
            ) : null}

            <label className="ui-label md:col-span-2">
              Notas
              <textarea
                name="notes"
                rows={3}
                className="ui-input min-h-24"
                placeholder="Observaciones de entrega, cobro o detalle de la venta..."
              />
            </label>
          </div>

          <input type="hidden" name="status" value="PENDIENTE" />
          <input type="hidden" name="operationType" value={operationType} />
          <input type="hidden" name="paymentStatus" value={paymentStatus} />
          <input type="hidden" name="initialPaidAmount" value={String(initialPaidAmount)} />
          <input type="hidden" name="dueDate" value={dueDate} />
          <input type="hidden" name="discountAmount" value="0" />
        </section>

        <section className="ui-panel p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Resumen rápido</h3>
              <p className="mt-1 text-sm text-slate-500">
                Registra el pedido en pocos segundos y completa lo demás después si hace falta.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="ui-subtle-panel px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Items activos</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{selectedItems.length}</p>
            </div>

            <div className="ui-subtle-panel px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Operación</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {operationType === SALE_OPERATION_REFILL ? "Recarga" : "Venta"}
              </p>
            </div>

            <div className="ui-subtle-panel px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Subtotal</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{currency(subtotal)}</p>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Total final</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{currency(total)}</p>
              <p className="mt-1 text-sm text-slate-500">Calculado automaticamente con los items del pedido.</p>
            </div>

            <div className="ui-subtle-panel px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Saldo pendiente</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{currency(amountDue)}</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-sm font-medium text-slate-800">Venta rapida</p>
            <ul className="mt-2 space-y-2 text-sm text-slate-500">
              <li>Si el cliente ya existe, la compra queda en su historial.</li>
              <li>Si no existe, el sistema lo crea como cliente pendiente automaticamente.</li>
              <li>
                {operationType === SALE_OPERATION_REFILL
                  ? "La recarga se registra como agua entregada sin mover botellón adicional."
                  : "Puedes asignar repartidor y completar datos más tarde."}
              </li>
            </ul>
          </div>
        </section>
      </div>

      <section className="ui-panel p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Items de venta</h3>
              <p className="mt-1 text-sm text-slate-500">
                Agrega productos, define cantidades y revisa el total por linea.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setItems((current) => [...current, createEmptyItem()])}
            className="ui-btn-soft"
          >
            <Plus className="h-4 w-4" />
            Agregar item
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {items.map((item, index) => {
            const selectedProduct = item.productId ? productsMap.get(item.productId) : null;
            const quantity = getItemQuantity(item.quantityInput);
            const reservedForProduct = item.productId ? reservedByProduct.get(item.productId) ?? 0 : 0;
            const remainingStock = selectedProduct ? Math.max(selectedProduct.stock - reservedForProduct, 0) : 0;
            const availableForThisRow = selectedProduct
              ? Math.max(selectedProduct.stock - (reservedForProduct - quantity), 0)
              : 0;
            const exceedsAvailable = selectedProduct ? quantity > availableForThisRow : false;

            return (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Item {index + 1}</p>
                    <p className="text-xs text-slate-500">Selecciona producto, cantidad y revisa su total.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-500 transition hover:bg-slate-100"
                    aria-label="Eliminar item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr_0.7fr_0.7fr]">
                  <div>
                    <label className="ui-label">
                      Producto
                      <select
                        name="productId"
                        value={item.productId}
                        onChange={(event) => {
                          const product = productsMap.get(event.target.value);
                          updateItem(item.id, {
                            productId: event.target.value,
                            unitPrice: product?.price ?? 0
                          });
                        }}
                        className="ui-select"
                        required
                      >
                        <option value="">Selecciona un producto</option>
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div
                      className={`mt-2 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs ${
                        exceedsAvailable ? "text-rose-600" : "text-slate-500"
                      }`}
                    >
                      <Package className="h-3.5 w-3.5" />
                      Disponible: <span className="font-semibold text-slate-700">{remainingStock}</span>
                    </div>
                    {exceedsAvailable ? (
                      <p className="mt-2 text-xs text-rose-600">
                        Esta fila supera el stock disponible para {selectedProduct?.name}. Maximo para esta fila:{" "}
                        {availableForThisRow}.
                      </p>
                    ) : null}
                  </div>

                  <label className="ui-label">
                    Cantidad
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={item.quantityInput}
                      onChange={(event) => {
                        const nextValue = event.target.value;

                        if (/^\d*$/.test(nextValue)) {
                          updateItem(item.id, { quantityInput: nextValue });
                        }
                      }}
                      onBlur={() => {
                        if (getItemQuantity(item.quantityInput) <= 0) {
                          updateItem(item.id, { quantityInput: "1" });
                        }
                      }}
                      className="ui-input"
                      required
                    />
                    <input
                      type="hidden"
                      name="itemQuantity"
                      value={quantity > 0 ? String(quantity) : ""}
                    />
                  </label>

                  <label className="ui-label">
                    Precio unitario
                    <input
                      name="itemUnitPrice"
                      type="number"
                      min={0}
                      step="0.01"
                      value={item.unitPrice}
                      readOnly
                      className="ui-input bg-slate-100"
                    />
                  </label>

                  <div className="ui-subtle-panel flex flex-col justify-center px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Total del item</p>
                    <p className="mt-2 text-xl font-semibold text-slate-900">
                      {currency(quantity * item.unitPrice)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {state.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <p className="font-medium">{state.error}</p>
          {state.errors?.length ? (
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {state.errors.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Venta lista para registrar</p>
          <p className="mt-1 text-sm text-slate-500">
            Guarda el pedido con lo minimo necesario. El resto se puede completar despues.
          </p>
        </div>
        <button type="submit" disabled={pending} className="ui-btn-primary min-w-44">
          {pending ? "Guardando..." : "Registrar venta"}
        </button>
      </div>
    </form>
  );
}
