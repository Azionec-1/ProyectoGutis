"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
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
  const router = useRouter();
  const [status, setStatus] = useState<SaleStatus>(defaultStatus);
  const [saving, setSaving] = useState(false);

  return (
    <select
      name="status"
      value={status}
      disabled={saving}
      onChange={(event) => {
        const nextStatus = event.target.value as SaleStatus;
        setStatus(nextStatus);
        setSaving(true);

        const formData = new FormData();
        formData.set("id", saleId);
        formData.set("status", nextStatus);

        startTransition(() => {
          Promise.resolve(action(formData))
            .then(() => {
              router.refresh();
            })
            .catch(() => {
              setStatus(defaultStatus);
            })
            .finally(() => {
              setSaving(false);
            });
        });
      }}
      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60"
    >
      {SALE_STATUS_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          Estado: {option.label}
        </option>
      ))}
    </select>
  );
}
