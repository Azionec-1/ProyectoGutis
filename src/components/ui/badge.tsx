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
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
        active
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-100 text-amber-700"
      )}
    >
      {children}
    </span>
  );
}
