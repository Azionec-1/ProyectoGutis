
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { AppShell } from '@/components/layout/app-shell';
import { prisma } from '@/lib/prisma';

export default async function CategoriesPage() {
  const categories = await prisma.menuCategory.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <AppShell
      title="Categorías"
      description="Gestiona las categorías de tus productos."
      action={
        <Link href="/admin/categories/new" className="ui-btn-primary">
          <Plus className="h-4 w-4" />
          Nueva Categoría
        </Link>
      }
    >
      <div className="ui-panel">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-4 text-left">Nombre</th>
              <th className="p-4 text-left">Fecha de Creación</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category: any) => (
              <tr key={category.id} className="border-b">
                <td className="p-4">{category.name}</td>
                <td className="p-4">{new Date(category.createdAt).toLocaleDateString()}</td>
                <td className="p-4 text-right">
                  <Link href={`/admin/categories/${category.id}/edit`} className="ui-btn-secondary">
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
