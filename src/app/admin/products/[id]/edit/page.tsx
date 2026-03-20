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
    <AppShell title="Editar producto" description="Actualiza nombre, precio o stock disponible sin salir del flujo operativo.">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="ui-panel p-6">
          <div>
            <span className="ui-pill">Edición</span>
            <h2 className="mt-3 text-lg font-semibold text-slate-900">Datos del producto</h2>
            <p className="mt-1 text-sm text-slate-500">
              Ajusta los valores principales del producto según la operación actual.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
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

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
              >
                Eliminar producto
              </button>
              <button type="submit" className="ui-btn-primary min-w-44">
                Guardar cambios
              </button>
            </div>
          </form>
        </section>

        <aside className="ui-panel p-6">
          <span className="ui-pill">Impacto</span>
          <h2 className="mt-3 text-lg font-semibold text-slate-900">Qué cambia al editar</h2>
          <div className="mt-5 space-y-3 text-sm text-slate-500">
            <div className="ui-subtle-panel px-4 py-3">
              <p className="font-medium text-slate-800">Nombre</p>
              <p className="mt-1">Se actualizará en productos, ventas futuras y reportes.</p>
            </div>
            <div className="ui-subtle-panel px-4 py-3">
              <p className="font-medium text-slate-800">Precio</p>
              <p className="mt-1">Afectará el valor tomado automáticamente en nuevas ventas.</p>
            </div>
            <div className="ui-subtle-panel px-4 py-3">
              <p className="font-medium text-slate-800">Stock</p>
              <p className="mt-1">Debe reflejar la cantidad realmente disponible en planta.</p>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
