'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';

type ProductResponse = {
  name: string;
  price: number;
  stock: number;
};

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const router = useRouter();
  const { id } = use(params);

  useEffect(() => {
    const fetchProduct = async () => {
      const res = await fetch(`/api/admin/products/${id}`);
      const data: ProductResponse = await res.json();
      setName(data.name);
      setPrice(data.price.toString());
      setStock(data.stock.toString());
    };

    fetchProduct();
  }, [id]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    await fetch(`/api/admin/products/${id}`, {
      method: 'PUT',
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

  const handleDelete = async () => {
    await fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
    });

    router.push('/admin/products');
  };

  return (
    <AppShell title="Editar producto" description="Actualiza el nombre, precio o cantidad disponible.">
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
                required
              />
            </div>

            <div>
              <label htmlFor="stock" className="ui-label">
                Cantidad disponible
              </label>
              <input
                type="number"
                id="stock"
                min="0"
                step="1"
                value={stock}
                onChange={(event) => setStock(event.target.value)}
                className="ui-input"
                required
              />
            </div>
          </div>

          <div className="flex justify-between">
            <button type="button" onClick={handleDelete} className="ui-btn-danger">
              Eliminar
            </button>
            <button type="submit" className="ui-btn-primary">
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
