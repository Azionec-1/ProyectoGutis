"use client";

import { startTransition, useRef } from "react";
import type { SaleStatus } from "@prisma/client";
import { SALE_STATUS_OPTIONS } from "@/lib/data/sale-service";

export function SaleStatusSelect({
  saleId,
  defaultStatus,
  action
}: {
  saleId: string;
  defaultStatus: SaleStatus;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={action}>
      <input type="hidden" name="id" value={saleId} />
      <select
        name="status"
        defaultValue={defaultStatus}
        onChange={() => {
          startTransition(() => {
            formRef.current?.requestSubmit();
          });
        }}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      >
        {SALE_STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            Estado: {option.label}
          </option>
        ))}
      </select>
    </form>
  );
}
