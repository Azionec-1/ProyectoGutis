import { MovementType, PaymentMethod, Prisma, SaleStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isMissingTableError } from "@/lib/prisma-errors";
import { saleSchema, type SaleFormValues } from "@/lib/validation/sale";

const saleSelect = {
  id: true,
  status: true,
  paymentMethod: true,
  scheduledAt: true,
  deliveredAt: true,
  discountAmount: true,
  subtotalAmount: true,
  totalAmount: true,
  notes: true,
  createdAt: true,

  client: {
    select: {
      id: true,
      code: true,
      fullName: true,
      district: true,
      phone: true
    }
  },

  worker: {
    select: {
      id: true,
      fullName: true,
      phone: true
    }
  },

  items: {
    select: {
      id: true,
      quantity: true,
      unitPrice: true,
      totalPrice: true,
      product: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: { createdAt: "asc" }
  },

  inventoryMovements: {
    select: {
      id: true,
      movementType: true,
      quantity: true,
      note: true,
      happenedAt: true
    },
    orderBy: { createdAt: "asc" }
  }
} satisfies Prisma.SaleSelect;

export async function listSalesPaginated({
  search,
  status,
  page = 1,
  pageSize = 8
}: {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const safePage = Math.max(1, page);
  const take = Math.max(1, pageSize);
  const skip = (safePage - 1) * take;

  const where: Prisma.SaleWhereInput = {
    AND: [
      search
        ? {
            OR: [
              { client: { fullName: { contains: search } } },
              { client: { code: { contains: search } } },
              { client: { district: { contains: search } } }
            ]
          }
        : {},
      status && status !== "all" ? { status: status as SaleStatus } : {}
    ]
  };

  const [total, items] = await Promise.all([
    prisma.sale.count({ where }),
    prisma.sale.findMany({
      where,
      select: saleSelect,
      orderBy: [{ createdAt: "desc" }],
      skip,
      take
    })
  ]);

  return {
    items,
    total,
    page: safePage,
    totalPages: Math.max(1, Math.ceil(total / take))
  };
}

export async function getSaleById(id: string) {
  return prisma.sale.findUnique({
    where: { id },
    select: saleSelect
  });
}

export async function getSalesMetrics() {
  const [total, pending, shipped, canceled, totals] = await Promise.all([
    prisma.sale.count(),
    prisma.sale.count({ where: { status: SaleStatus.PENDIENTE } }),
    prisma.sale.count({ where: { status: SaleStatus.ENVIADO } }),
    prisma.sale.count({ where: { status: SaleStatus.CANCELADO } }),
    prisma.sale.aggregate({
      _sum: {
        totalAmount: true
      }
    })
  ]);

  return {
    total,
    pending,
    shipped,
    canceled,
    revenue: Number(totals._sum.totalAmount ?? 0)
  };
}

export async function getSaleFormOptions() {
  try {
    const [clients, workers, products] = await Promise.all([
      prisma.client.findMany({
        where: { isActive: true },
        orderBy: { fullName: "asc" },
        select: {
          id: true,
          code: true,
          fullName: true,
          phone: true
        }
      }),

      prisma.worker.findMany({
        where: { isActive: true },
        orderBy: { fullName: "asc" },
        select: {
          id: true,
          fullName: true
        }
      }),

      prisma.product.findMany({
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          price: true,
          stock: true
        }
      })
    ]);

    return {
      clients,
      workers,
      products: products.map((product) => ({
        ...product,
        price: Number(product.price)
      }))
    };
  } catch (error) {
    if (isMissingTableError(error)) {
      return { clients: [], workers: [], products: [] };
    }

    throw error;
  }
}

export async function createSale(input: SaleFormValues) {
  const parsed = saleSchema.parse(input);

  return prisma.$transaction(async (tx) => {
    const productIds = [...new Set(parsed.items.map((item) => item.productId))];
    const products = await tx.product.findMany({
      where: {
        id: { in: productIds }
      },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true
      }
    });

    const productsMap = new Map(products.map((product) => [product.id, product]));

    const normalizedItems = parsed.items.map((item) => {
      const product = productsMap.get(item.productId);

      if (!product) {
        throw new Error("Uno de los productos seleccionados no existe.");
      }

      if (item.quantity > product.stock) {
        throw new Error(`No hay stock suficiente para ${product.name}. Disponible: ${product.stock}.`);
      }

      const unitPrice = Number(product.price);
      return {
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice,
        totalPrice: item.quantity * unitPrice
      };
    });

    const subtotal = normalizedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const total = subtotal - parsed.discountAmount;

    const sale = await tx.sale.create({
      data: {
        clientId: parsed.clientId,
        workerId: parsed.workerId,
        status: parsed.status,
        paymentMethod: parsed.paymentMethod,
        scheduledAt: parsed.scheduledAt,
        discountAmount: parsed.discountAmount,
        subtotalAmount: subtotal,
        totalAmount: total,
        notes: parsed.notes || null
      }
    });

    await tx.saleItem.createMany({
      data: normalizedItems.map((item) => ({
        saleId: sale.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      }))
    });

    if (parsed.status !== SaleStatus.CANCELADO) {
      for (const item of normalizedItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });

        await tx.inventoryMovement.create({
          data: {
            movementType: MovementType.SALIDA_VENTA,
            quantity: item.quantity,
            note: `Salida por venta - ${item.productName}`,
            happenedAt: parsed.scheduledAt,
            clientId: parsed.clientId,
            workerId: parsed.workerId,
            saleId: sale.id
          }
        });
      }
    }

    return sale;
  });
}

export async function updateSaleStatus(id: string, status: SaleStatus) {
  return prisma.$transaction(async (tx) => {
    const sale = await tx.sale.findUnique({
      where: { id },
      select: {
        id: true,
        clientId: true,
        workerId: true,
        status: true,
        scheduledAt: true,
        items: {
          select: {
            quantity: true,
            productId: true,
            product: {
              select: {
                id: true,
                name: true,
                stock: true
              }
            }
          }
        }
      }
    });

    if (!sale) {
      throw new Error("La venta no existe.");
    }

    if (sale.status === status) {
      return sale;
    }

    if (sale.status !== SaleStatus.CANCELADO && status === SaleStatus.CANCELADO) {
      for (const item of sale.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        });

        await tx.inventoryMovement.create({
          data: {
            movementType: MovementType.DEVOLUCION_ENTRADA,
            quantity: item.quantity,
            note: `Reposición por cancelación - ${item.product.name}`,
            happenedAt: new Date(),
            clientId: sale.clientId,
            workerId: sale.workerId,
            saleId: sale.id
          }
        });
      }
    }

    if (sale.status === SaleStatus.CANCELADO && status !== SaleStatus.CANCELADO) {
      for (const item of sale.items) {
        if (item.quantity > item.product.stock) {
          throw new Error(
            `No hay stock suficiente para reactivar la venta de ${item.product.name}. Disponible: ${item.product.stock}.`
          );
        }
      }

      for (const item of sale.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });

        await tx.inventoryMovement.create({
          data: {
            movementType: MovementType.SALIDA_VENTA,
            quantity: item.quantity,
            note: `Salida reaplicada por reactivación - ${item.product.name}`,
            happenedAt: new Date(),
            clientId: sale.clientId,
            workerId: sale.workerId,
            saleId: sale.id
          }
        });
      }
    }

    return tx.sale.update({
      where: { id },
      data: { status }
    });
  });
}

export const SALE_STATUS_OPTIONS = [
  { value: SaleStatus.PENDIENTE, label: "Pendiente" },
  { value: SaleStatus.ENVIADO, label: "Enviado" },
  { value: SaleStatus.CANCELADO, label: "Cancelado" }
] as const;

export const PAYMENT_METHOD_OPTIONS = [
  { value: PaymentMethod.EFECTIVO, label: "Efectivo" },
  { value: PaymentMethod.TRANSFERENCIA, label: "Transferencia" },
  { value: PaymentMethod.YAPE_PLIN, label: "Yape / Plin" },
  { value: PaymentMethod.CARD, label: "Tarjeta" }
] as const;
