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
};

export default function EditWorkerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [vehicleNote, setVehicleNote] = useState('');
  const [isActive, setIsActive] = useState(true);
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
    };

    fetchWorker();
  }, [id]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    await fetch(`/api/workers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName,
        phone,
        documentId,
        vehicleNote,
        isActive
      })
    });

    router.push('/workers');
  };

  const handleDelete = async () => {
    await fetch(`/api/workers/${id}`, { method: 'DELETE' });
    router.push('/workers');
  };

  return (
    <AppShell title="Editar repartidor" description="Actualiza los datos del repartidor para asignarlo a ventas.">
      <div className="ui-panel max-w-2xl p-6">
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

          <label className="flex items-center gap-3 text-sm text-slate-700">
            <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
            Repartidor activo
          </label>

          <div className="flex justify-between">
            <button type="button" onClick={handleDelete} className="ui-btn-danger">Eliminar</button>
            <button type="submit" className="ui-btn-primary">Guardar cambios</button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
