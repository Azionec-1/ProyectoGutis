
'use client';

import { AppShell } from '@/components/layout/app-shell';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditCategoryPage({ params }: { params: { id: string } }) {
  const [name, setName] = useState('');
  const router = useRouter();
  const { id } = params;

  useEffect(() => {
    const fetchCategory = async () => {
      const res = await fetch(`/api/admin/categories/${id}`);
      const data = await res.json();
      setName(data.name);
    };
    fetchCategory();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/admin/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });
    router.push('/admin/categories');
  };

  const handleDelete = async () => {
    await fetch(`/api/admin/categories/${id}`, {
      method: 'DELETE',
    });
    router.push('/admin/categories');
  };

  return (
    <AppShell title="Editar Categoría" description="Edita el nombre de la categoría.">
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
          <div className="flex justify-between">
            <button type="button" onClick={handleDelete} className="ui-btn-danger">
              Eliminar
            </button>
            <button type="submit" className="ui-btn-primary">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
