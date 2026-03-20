'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';

type WorkerResponse = {
  fullName: string;
  phone: string;
  documentId: string;
  vehicleNote: string | null;
  isActive: boolean;
  accountEmail: string;
};

export default function EditWorkerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [vehicleNote, setVehicleNote] = useState('');
  const [accountEmail, setAccountEmail] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchWorker = async () => {
      const res = await fetch(`/api/workers/${id}`);
      const data: WorkerResponse = await res.json();
      setFullName(data.fullName);
      setPhone(data.phone);
      setDocumentId(data.documentId);
      setVehicleNote(data.vehicleNote || '');
      setIsActive(data.isActive);
      setAccountEmail(data.accountEmail || '');
    };

    fetchWorker();
  }, [id]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const response = await fetch(`/api/workers/${id}`, {
      method: 'PUT',
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
      setError(data.message || 'No se pudo actualizar el repartidor.');
      return;
    }

    router.push('/workers');
  };

  const handleDelete = async () => {
    await fetch(`/api/workers/${id}`, { method: 'DELETE' });
    router.push('/workers');
  };

  return (
    <AppShell title="Editar repartidor" description="Actualiza los datos del repartidor y su acceso al sistema.">
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
              <input id="vehicleNote" value={vehicleNote} onChange={(event) => setVehicleNote(event.target.value)} className="ui-input" />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Acceso del repartidor</p>
              <p className="mt-1 text-sm text-slate-500">
                Mantén el correo si ya tiene acceso. Si quieres cambiar su contraseña, escribe una nueva.
              </p>
              <div className="mt-4 grid gap-4">
                <div>
                  <label htmlFor="accountEmail" className="ui-label">Correo de acceso</label>
                  <input id="accountEmail" type="email" value={accountEmail} onChange={(event) => setAccountEmail(event.target.value)} className="ui-input" placeholder="repartidor@aguagutis.com" />
                </div>
                <div>
                  <label htmlFor="accountPassword" className="ui-label">Nueva contraseña</label>
                  <input id="accountPassword" type="password" value={accountPassword} onChange={(event) => setAccountPassword(event.target.value)} className="ui-input" placeholder="Déjalo vacío para no cambiarla" />
                </div>
              </div>
            </div>

            <label className="flex items-center gap-3 text-sm text-slate-700">
              <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
              Repartidor activo
            </label>

            {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

            <div className="flex justify-between">
              <button type="button" onClick={handleDelete} className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100">
                Eliminar
              </button>
              <button type="submit" className="ui-btn-primary">Guardar cambios</button>
            </div>
          </form>
        </section>

        <aside className="ui-panel p-6">
          <span className="ui-pill">Vista del repartidor</span>
          <h2 className="mt-3 text-lg font-semibold text-slate-900">Acceso restringido</h2>
          <p className="mt-2 text-sm text-slate-500">
            Cuando el repartidor inicie sesión, solo podrá ver los pedidos asignados a su cuenta.
          </p>
        </aside>
      </div>
    </AppShell>
  );
}
