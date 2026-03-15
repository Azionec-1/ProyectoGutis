
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { prisma } from '@/lib/prisma';

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <AppShell
      title="Productos"
      description="Gestiona tus productos."
      action={
        <Link href="/admin/products/new" className="ui-btn-primary">
          <Plus className="h-4 w-4" />
          Nuevo Producto
        </Link>
      }
    >
      <div className="ui-panel">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">Nombre</th>
              <th className="p-4 text-left">Categoría</th>
              <th className="p-4 text-left">Precio</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product: any) => (
              <tr key={product.id} className="border-b">
                <td className="p-4">{product.name}</td>
                <td className="p-4">{product.category.name}</td>
                <td className="p-4">{product.price}</td>
                <td className="p-4 text-right">
                  <Link href={`/admin/products/${product.id}/edit`} className="ui-btn-secondary">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
