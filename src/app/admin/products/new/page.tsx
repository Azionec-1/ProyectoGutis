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
    <AppShell title="Nuevo producto" description="Registra solo los datos que se necesitan para operar día a día.">
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="ui-panel p-6">
          <div>
            <span className="ui-pill">Alta rápida</span>
            <h2 className="mt-3 text-lg font-semibold text-slate-900">Información principal</h2>
            <p className="mt-1 text-sm text-slate-500">
              Define nombre, precio y cantidad inicial para empezar a trabajar con el producto.
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
              <button type="submit" className="ui-btn-primary min-w-44">
                Guardar producto
              </button>
            </div>
          </form>
        </section>

        <aside className="ui-panel p-6">
          <span className="ui-pill">Referencia</span>
          <h2 className="mt-3 text-lg font-semibold text-slate-900">Qué se guarda aquí</h2>
          <div className="mt-5 space-y-3 text-sm text-slate-500">
            <div className="ui-subtle-panel px-4 py-3">
              <p className="font-medium text-slate-800">Nombre</p>
              <p className="mt-1">Será el identificador visible en ventas, productos y reportes.</p>
            </div>
            <div className="ui-subtle-panel px-4 py-3">
              <p className="font-medium text-slate-800">Precio</p>
              <p className="mt-1">Se usará automáticamente cuando el producto se agregue a una venta.</p>
            </div>
            <div className="ui-subtle-panel px-4 py-3">
              <p className="font-medium text-slate-800">Cantidad inicial</p>
              <p className="mt-1">Es el stock con el que el producto empezará a operar en el sistema.</p>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
