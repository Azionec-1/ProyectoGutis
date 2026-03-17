'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';

export default function NewProductPage() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    await fetch('/api/admin/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        price: parseFloat(price),
        stock: Number(stock),
      }),
    });

    router.push('/admin/products');
  };

  return (
    <AppShell title="Nuevo producto" description="Registra solo los datos necesarios para operar.">
      <div className="ui-panel max-w-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="ui-label">
              Nombre del producto
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="ui-input"
              placeholder="Ej: Bidón 20 litros"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="price" className="ui-label">
                Precio
              </label>
              <input
                type="number"
                id="price"
                min="0"
                step="0.01"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                className="ui-input"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label htmlFor="stock" className="ui-label">
                Cantidad inicial
              </label>
              <input
                type="number"
                id="stock"
                min="0"
                step="1"
                value={stock}
                onChange={(event) => setStock(event.target.value)}
                className="ui-input"
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="ui-btn-primary">
              Guardar producto
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
