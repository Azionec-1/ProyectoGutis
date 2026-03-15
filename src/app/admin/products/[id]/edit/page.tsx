
'use client';

import { AppShell } from '@/components/layout/app-shell';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditProductPage({ params }: { params: { id: string } }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const router = useRouter();
  const { id } = params;

  useEffect(() => {
    const fetchProduct = async () => {
      const res = await fetch(`/api/admin/products/${id}`);
      const data = await res.json();
      setName(data.name);
      setDescription(data.description);
      setPrice(data.price.toString());
      setImageUrl(data.imageUrl);
      setCategoryId(data.categoryId);
    };

    const fetchCategories = async () => {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      setCategories(data);
    };

    fetchProduct();
    fetchCategories();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/admin/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        description,
        price: parseFloat(price),
        imageUrl,
        categoryId,
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
    <AppShell title="Editar Producto" description="Edita la información del producto.">
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
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Precio
            </label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
              URL de la Imagen
            </label>
            <input
              type="text"
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Categoría
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="">Selecciona una categoría</option>
              {categories.map((category: any) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
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
