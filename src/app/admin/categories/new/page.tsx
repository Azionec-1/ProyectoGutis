
'use client';

import { AppShell } from '@/components/layout/app-shell';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewCategoryPage() {
  const [name, setName] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/admin/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
    router.push('/admin/categories');
  };

  return (
    <AppShell title="Nueva Categoría" description="Crea una nueva categoría para tus productos.">
      <div className="ui-panel max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="ui-btn-primary">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
