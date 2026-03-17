'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';

export default function NewWorkerPage() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [vehicleNote, setVehicleNote] = useState('');
  const [isActive, setIsActive] = useState(true);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    await fetch('/api/workers', {
      method: 'POST',
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

  return (
    <AppShell title="Nuevo repartidor" description="Registra al personal que podrá asignarse a ventas.">
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
            <input id="vehicleNote" value={vehicleNote} onChange={(event) => setVehicleNote(event.target.value)} className="ui-input" placeholder="Ej: Motocar, moto lineal, zona asignada" />
          </div>

          <label className="flex items-center gap-3 text-sm text-slate-700">
            <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
            Repartidor activo
          </label>

          <div className="flex justify-end">
            <button type="submit" className="ui-btn-primary">Guardar repartidor</button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
