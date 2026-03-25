import { AppShell } from "@/components/layout/app-shell";

function LoadingCard({ className = "" }: { className?: string }) {
  return <div className={`ui-panel animate-pulse ${className}`.trim()} />;
}

export default function Loading() {
  return (
    <AppShell
      title="Cargando modulo"
      description="Preparando la vista y sincronizando datos operativos."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <LoadingCard className="h-28" />
        <LoadingCard className="h-28" />
        <LoadingCard className="h-28" />
      </div>

      <LoadingCard className="h-24" />

      <div className="grid gap-4">
        <LoadingCard className="h-40" />
        <LoadingCard className="h-40" />
      </div>
    </AppShell>
  );
}
