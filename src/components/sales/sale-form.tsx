"use client";

import { useActionState, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { PAYMENT_METHOD_OPTIONS, SALE_STATUS_OPTIONS } from "@/lib/data/sale-service";
import { currency } from "@/lib/utils";

type FormState = {
  error?: string;
  errors?: string[];
};

type ItemRow = {
  id: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
};

const createEmptyItem = (): ItemRow => ({
  id: crypto.randomUUID(),
  itemName: "",
  quantity: 1,
  unitPrice: 0
});

export function SaleForm({
  action,
  clients,
  workers
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  clients: Array<{ id: string; code: string; fullName: string; phone: string }>;
  workers: Array<{ id: string; fullName: string }>;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [items, setItems] = useState<ItemRow[]>([createEmptyItem()]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [clientQuery, setClientQuery] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [showClientResults, setShowClientResults] = useState(false);

  const normalizedQuery = clientQuery.trim().toLowerCase();
  const filteredClients = normalizedQuery
    ? clients.filter((client) =>
        `${client.code} ${client.fullName} ${client.phone}`
          .toLowerCase()
          .includes(normalizedQuery)
      )
    : clients.slice(0, 8);

  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const total = Math.max(0, subtotal - discountAmount);

  function updateItem(id: string, patch: Partial<ItemRow>) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  }

  function removeItem(id: string) {
    setItems((current) => (current.length > 1 ? current.filter((item) => item.id !== id) : current));
  }

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2 text-sm font-medium text-slate-700">
          <label htmlFor="clientSearch">Cliente</label>
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
            placeholder="Escribe nombre, teléfono o código"
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            autoComplete="off"
            required
          />
          <input type="hidden" name="clientId" value={selectedClientId} required />
          {showClientResults ? (
            <div className="max-h-44 overflow-y-auto rounded-lg border border-slate-200 bg-white">
              {filteredClients.length ? (
                filteredClients.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setSelectedClientId(client.id);
                      setClientQuery(`${client.fullName} - ${client.phone}`);
                      setShowClientResults(false);
                    }}
                    className="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-blue-50 last:border-b-0"
                  >
                    <span className="font-medium">{client.fullName}</span>
                    <span className="text-xs text-slate-500">
                      {client.code} | {client.phone}
                    </span>
                  </button>
                ))
              ) : (
                <p className="px-3 py-2 text-xs text-slate-500">Sin coincidencias.</p>
              )}
            </div>
          ) : null}
          <span className="text-xs font-normal text-slate-500">
            Selecciona un cliente de la lista filtrada para registrar la venta.
          </span>
        </div>

          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Repartidor (En desarrollo)
          <select
            name="workerId"
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">Sin asignar</option>
            {workers.map((worker) => (
              <option key={worker.id} value={worker.id}>
                {worker.fullName}
              </option>
            ))}
          </select>
          <span className="text-xs font-normal text-slate-500">
            La asignación final se integrará con el módulo de repartidores.
          </span>
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Estado
          <select
            name="status"
            defaultValue="PENDIENTE"
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            {SALE_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Método de pago
          <select
            name="paymentMethod"
            defaultValue="EFECTIVO"
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            {PAYMENT_METHOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Fecha y hora programada
          <input
            name="scheduledAt"
            type="datetime-local"
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            required
          />
        </label>

        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Descuento
          <input
            name="discountAmount"
            type="number"
            min={0}
            step="0.01"
            value={discountAmount}
            onChange={(event) => setDiscountAmount(Number(event.target.value))}
            className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-medium text-slate-700">
        Notas
        <textarea
          name="notes"
          rows={3}
          className="rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          placeholder="Observaciones de entrega o venta..."
        />
      </label>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Items de venta (En desarrollo)</h3>
            <p className="text-xs text-slate-500">
              Este bloque se conectará con inventario cuando el módulo esté disponible.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setItems((current) => [...current, createEmptyItem()])}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100"
          >
            <Plus className="h-4 w-4" />
            Agregar item
          </button>
        </div>

        {items.map((item) => (
          <div key={item.id} className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 md:grid-cols-[1.6fr_0.6fr_0.8fr_auto]">
            <input
              name="itemName"
              value={item.itemName}
              onChange={(event) => updateItem(item.id, { itemName: event.target.value })}
              placeholder="Nombre del item"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              required
            />
            <input
              name="itemQuantity"
              type="number"
              min={1}
              step={1}
              value={item.quantity}
              onChange={(event) =>
                updateItem(item.id, { quantity: Number(event.target.value) || 1 })
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              required
            />
            <input
              name="itemUnitPrice"
              type="number"
              min={0}
              step="0.01"
              value={item.unitPrice}
              onChange={(event) =>
                updateItem(item.id, { unitPrice: Number(event.target.value) || 0 })
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              required
            />
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-500 hover:bg-slate-100"
              aria-label="Eliminar item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        <p>Subtotal: <span className="font-semibold">{currency(subtotal)}</span></p>
        <p className="mt-1">Total: <span className="font-semibold text-slate-900">{currency(total)}</span></p>
      </div>

      {state.error ? (
        <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-600">
          <p>{state.error}</p>
          {state.errors?.length ? (
            <ul className="mt-2 list-disc pl-5">
              {state.errors.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Guardando..." : "Registrar venta"}
      </button>
    </form>
  );
}
