import { PaymentMethod, Prisma, SaleStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
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
      status && status !== "all"
        ? { status: status as SaleStatus }
        : {}
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
        price: true
      }
    })
  ]);

  return { clients, workers, products };
}

export async function createSale(input: SaleFormValues) {
  const parsed = saleSchema.parse(input);

  const subtotal = parsed.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const total = subtotal - parsed.discountAmount;

  return prisma.$transaction(async (tx) => {
    const sale = await tx.sale.create({
      data: {
        clientId: parsed.clientId,
        workerId: parsed.workerId || null,
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
      data: parsed.items.map((item: any) => ({
        saleId: sale.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice
      }))
    });

    return sale;
  });
}

export async function updateSaleStatus(id: string, status: SaleStatus) {
  return prisma.sale.update({
    where: { id },
    data: { status }
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
