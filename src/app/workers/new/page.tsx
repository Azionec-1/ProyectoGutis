'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';

export default function NewWorkerPage() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [vehicleNote, setVehicleNote] = useState('');
  const [accountEmail, setAccountEmail] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const response = await fetch('/api/workers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName,
        phone,
        documentId,
        vehicleNote,
        isActive,
        accountEmail,
        accountPassword
      })
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.message || 'No se pudo guardar el repartidor.');
      return;
    }

    router.push('/workers');
  };

  return (
    <AppShell title="Nuevo repartidor" description="Registra al repartidor y, si quieres, crea su acceso para que vea solo sus pedidos.">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="ui-panel p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="ui-label">Nombre completo</label>
              <input id="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} className="ui-input" required />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="phone" className="ui-label">Teléfono</label>
                <input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} className="ui-input" inputMode="numeric" required />
              </div>
              <div>
                <label htmlFor="documentId" className="ui-label">Documento</label>
                <input id="documentId" value={documentId} onChange={(event) => setDocumentId(event.target.value)} className="ui-input" required />
              </div>
            </div>

            <div>
              <label htmlFor="vehicleNote" className="ui-label">Vehículo o nota</label>
              <input id="vehicleNote" value={vehicleNote} onChange={(event) => setVehicleNote(event.target.value)} className="ui-input" placeholder="Ej: Motocar, moto lineal, zona asignada" />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Acceso del repartidor</p>
              <p className="mt-1 text-sm text-slate-500">
                Si completas estos campos, el repartidor podrá iniciar sesión y ver solo sus pedidos.
              </p>
              <div className="mt-4 grid gap-4">
                <div>
                  <label htmlFor="accountEmail" className="ui-label">Correo de acceso</label>
                  <input id="accountEmail" type="email" value={accountEmail} onChange={(event) => setAccountEmail(event.target.value)} className="ui-input" placeholder="repartidor@aguagutis.com" />
                </div>
                <div>
                  <label htmlFor="accountPassword" className="ui-label">Contraseña inicial</label>
                  <input id="accountPassword" type="password" value={accountPassword} onChange={(event) => setAccountPassword(event.target.value)} className="ui-input" placeholder="Mínimo 8 caracteres" />
                </div>
              </div>
            </div>

            <label className="flex items-center gap-3 text-sm text-slate-700">
              <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
              Repartidor activo
            </label>

            {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

            <div className="flex justify-end">
              <button type="submit" className="ui-btn-primary">Guardar repartidor</button>
            </div>
          </form>
        </section>

        <aside className="ui-panel p-6">
          <span className="ui-pill">Permisos</span>
          <h2 className="mt-3 text-lg font-semibold text-slate-900">Qué podrá hacer</h2>
          <div className="mt-5 space-y-3 text-sm text-slate-500">
            <div className="ui-subtle-panel px-4 py-3">
              <p className="font-medium text-slate-800">Administrador</p>
              <p className="mt-1">Controla todo el sistema y gestiona módulos, reportes, ventas y repartidores.</p>
            </div>
            <div className="ui-subtle-panel px-4 py-3">
              <p className="font-medium text-slate-800">Repartidor</p>
              <p className="mt-1">Solo podrá iniciar sesión para ver sus propios pedidos asignados.</p>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
