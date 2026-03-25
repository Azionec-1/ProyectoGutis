import { cn } from "@/lib/utils";

export function Badge({
  active,
  children
}: {
  active: boolean;
  children: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em]",
        active
          ? "border-blue-100 bg-blue-50 text-blue-700"
          : "border-amber-100 bg-amber-50 text-amber-700"
      )}
    >
      {children}
    </span>
  );
}
