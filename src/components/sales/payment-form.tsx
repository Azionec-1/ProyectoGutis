"use client";

import { useActionState } from "react";
import { PAYMENT_METHOD_OPTIONS } from "@/lib/data/sale-service";

type FormState = {
  error?: string;
  errors?: string[];
};

export function PaymentForm({
  saleId,
  action
}: {
  saleId: string;
  action: (state: FormState, formData: FormData) => Promise<FormState>;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const now = new Date();
  const defaultDateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}T${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="saleId" value={saleId} />

      <div className="grid gap-4 md:grid-cols-2">
        <label className="ui-label">
          Monto abonado
          <input name="amount" type="number" min="0.01" step="0.01" className="ui-input" required />
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

        <label className="ui-label">
          Fecha del abono
          <input
            name="paidAt"
            type="datetime-local"
            defaultValue={defaultDateTime}
            className="ui-input"
            required
          />
        </label>

        <label className="ui-label">
          Nota
          <input name="note" type="text" className="ui-input" placeholder="Opcional" />
        </label>
      </div>

      {state.error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </div>
      ) : null}

      <button type="submit" disabled={pending} className="ui-btn-primary">
        {pending ? "Guardando..." : "Registrar abono"}
      </button>
    </form>
  );
}
