"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ApproveWorkerButton({ workerId }: { workerId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleApprove = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/workers/${workerId}/approve`, {
        method: "POST"
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "No se pudo aprobar la cuenta.");
      }

      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo aprobar la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleApprove}
        disabled={loading}
        className="ui-btn-primary"
      >
        {loading ? "Aprobando..." : "Aprobar cuenta"}
      </button>
      {error ? <p className="text-right text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
