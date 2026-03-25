"use client";

import { useActionState } from "react";
import { TRUJILLO_DISTRICTS } from "@/lib/constants/trujillo-districts";

type FormState = {
  error?: string;
  errors?: string[];
};

type ClientDefaultValues = {
  code?: string;
  fullName?: string;
  phone?: string;
  address?: string;
  district?: string;
  referenceNote?: string | null;
  googleMapsUrl?: string | null;
  facadePhotoUrl?: string | null;
  isActive?: boolean;
};

export function ClientForm({
  action,
  submitLabel,
  defaults
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  defaults?: ClientDefaultValues;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="grid gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="ui-label">
          <span>Codigo interno</span>
          <div className="ui-subtle-panel px-4 py-3 text-slate-600">
            {defaults?.code ?? "Se generara automaticamente al guardar"}
          </div>
          <input name="code" defaultValue={defaults?.code ?? ""} type="hidden" />
        </div>

        <label className="ui-label">
          Nombre completo o razon social
          <input
            name="fullName"
            defaultValue={defaults?.fullName}
            placeholder="Bodega San Martin"
            className="ui-input"
            required
          />
        </label>

        <label className="ui-label">
          Telefono
          <input
            name="phone"
            defaultValue={defaults?.phone}
            placeholder="987654321"
            className="ui-input"
            required
          />
        </label>

        <label className="ui-label">
          Distrito o zona
          <input
            name="district"
            defaultValue={defaults?.district}
            list="trujillo-districts"
            placeholder="Selecciona o escribe un distrito"
            className="ui-input"
            required
          />
          <datalist id="trujillo-districts">
            {TRUJILLO_DISTRICTS.map((district) => (
              <option key={district} value={district} />
            ))}
          </datalist>
        </label>
      </div>

      <label className="ui-label">
        Direccion
        <input
          name="address"
          defaultValue={defaults?.address}
          placeholder="Av. Los Laureles 125"
          className="ui-input"
          required
        />
      </label>

      <label className="ui-label">
        Referencia
        <textarea
          name="referenceNote"
          defaultValue={defaults?.referenceNote ?? ""}
          placeholder="Frente a la farmacia central"
          rows={3}
          className="ui-input min-h-28 resize-y"
        />
      </label>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="ui-label">
          URL de Google Maps
          <input
            name="googleMapsUrl"
            type="url"
            defaultValue={defaults?.googleMapsUrl ?? ""}
            placeholder="https://maps.google.com/..."
            className="ui-input"
          />
        </label>

        <label className="ui-label">
          URL de foto de fachada
          <input
            name="facadePhotoUrl"
            type="url"
            defaultValue={defaults?.facadePhotoUrl ?? ""}
            placeholder="https://..."
            className="ui-input"
          />
        </label>
      </div>

      <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
        <input
          name="isActive"
          type="checkbox"
          defaultChecked={defaults?.isActive ?? true}
          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
        />
        Cliente activo para nuevas ventas y asignaciones
      </label>

      {state.error ? (
        <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
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
        className="ui-btn-primary w-fit disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending ? "Guardando..." : submitLabel}
      </button>
    </form>
  );
}
