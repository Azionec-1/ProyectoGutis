import { MovementType, PaymentMethod, Prisma, SaleStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isMissingTableError } from "@/lib/prisma-errors";
import { saleSchema, type SaleFormValues } from "@/lib/validation/sale";

const PAYMENT_STATUS_PAID = "PAGADO";
const PAYMENT_STATUS_PARTIAL = "PARCIAL";
const PAYMENT_STATUS_CREDIT = "CREDITO";
const SALE_OPERATION_REFILL = "RECARGA";

const saleSelect = {
  id: true,
  status: true,
  operationType: true,
  paymentMethod: true,
  paymentStatus: true,
  scheduledAt: true,
  deliveredAt: true,
  dueDate: true,
  settledAt: true,
  discountAmount: true,
  subtotalAmount: true,
  totalAmount: true,
  amountPaid: true,
  amountDue: true,
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

  payments: {
    select: {
      id: true,
      amount: true,
      paymentMethod: true,
      paidAt: true,
      note: true
    },
    orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }]
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
  const [total, pending, shipped, canceled, totals, paidTotals, dueTotals, creditCount] = await Promise.all([
    prisma.sale.count(),
    prisma.sale.count({ where: { status: SaleStatus.PENDIENTE } }),
    prisma.sale.count({ where: { status: SaleStatus.ENVIADO } }),
    prisma.sale.count({ where: { status: SaleStatus.CANCELADO } }),
    prisma.sale.aggregate({
      _sum: {
        totalAmount: true
      }
    }),
    prisma.sale.aggregate({
      _sum: {
        amountPaid: true
      }
    }),
    prisma.sale.aggregate({
      _sum: {
        amountDue: true
      }
    }),
    prisma.sale.count({
      where: {
        paymentStatus: {
          in: [PAYMENT_STATUS_CREDIT, PAYMENT_STATUS_PARTIAL]
        }
      }
    })
  ]);

  return {
    total,
    pending,
    shipped,
    canceled,
    revenue: Number(totals._sum.totalAmount ?? 0),
    collected: Number(paidTotals._sum.amountPaid ?? 0),
    due: Number(dueTotals._sum.amountDue ?? 0),
    creditCount
  };
}

export async function listCreditSales({
  search,
  page = 1,
  pageSize = 8
}: {
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const safePage = Math.max(1, page);
  const take = Math.max(1, pageSize);
  const skip = (safePage - 1) * take;

  const where: Prisma.SaleWhereInput = {
    AND: [
      {
        paymentStatus: {
          in: [PAYMENT_STATUS_CREDIT, PAYMENT_STATUS_PARTIAL]
        }
      },
      search
        ? {
            OR: [
              { client: { fullName: { contains: search } } },
              { client: { code: { contains: search } } },
              { client: { district: { contains: search } } }
            ]
          }
        : {}
    ]
  };

  const [total, items] = await Promise.all([
    prisma.sale.count({ where }),
    prisma.sale.findMany({
      where,
      select: saleSelect,
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
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

export async function getCreditMetrics() {
  const [openCredits, dueTotals, collectedTotals] = await Promise.all([
    prisma.sale.count({
      where: {
        paymentStatus: {
          in: [PAYMENT_STATUS_CREDIT, PAYMENT_STATUS_PARTIAL]
        }
      }
    }),
    prisma.sale.aggregate({
      where: {
        paymentStatus: {
          in: [PAYMENT_STATUS_CREDIT, PAYMENT_STATUS_PARTIAL]
        }
      },
      _sum: {
        amountDue: true
      }
    }),
    prisma.salePayment.aggregate({
      _sum: {
        amount: true
      }
    })
  ]);

  return {
    openCredits,
    amountDue: Number(dueTotals._sum.amountDue ?? 0),
    amountCollected: Number(collectedTotals._sum.amount ?? 0)
  };
}

export async function getSaleFormOptions() {
  try {
    const [clients, products] = await Promise.all([
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
      products: products.map((product) => ({
        ...product,
        price: Number(product.price)
      }))
    };
  } catch (error) {
    if (isMissingTableError(error)) {
      return { clients: [], products: [] };
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
    const requestedByProduct = new Map<string, number>();

    parsed.items.forEach((item) => {
      requestedByProduct.set(
        item.productId,
        (requestedByProduct.get(item.productId) ?? 0) + item.quantity
      );
    });

    requestedByProduct.forEach((requestedQuantity, productId) => {
      const product = productsMap.get(productId);

      if (!product) {
        throw new Error("Uno de los productos seleccionados no existe.");
      }

      if (requestedQuantity > product.stock) {
        throw new Error(`No hay stock suficiente para ${product.name}. Disponible: ${product.stock}.`);
      }
    });

    const normalizedItems = parsed.items.map((item) => {
      const product = productsMap.get(item.productId);

      if (!product) {
        throw new Error("Uno de los productos seleccionados no existe.");
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
    const amountPaid = parsed.paymentStatus === PAYMENT_STATUS_PAID ? total : parsed.initialPaidAmount;
    const amountDue = Math.max(0, total - amountPaid);
    const resolvedPaymentStatus =
      amountDue === 0
        ? PAYMENT_STATUS_PAID
        : amountPaid > 0
          ? PAYMENT_STATUS_PARTIAL
          : PAYMENT_STATUS_CREDIT;

    const sale = await tx.sale.create({
      data: {
        clientId: parsed.clientId,
        workerId: parsed.workerId,
        status: parsed.status,
        operationType: parsed.operationType,
        paymentMethod: parsed.paymentMethod,
        scheduledAt: parsed.scheduledAt,
        dueDate: amountDue > 0 ? parsed.dueDate ?? null : null,
        settledAt: amountDue === 0 ? new Date() : null,
        paymentStatus: resolvedPaymentStatus,
        discountAmount: parsed.discountAmount,
        subtotalAmount: subtotal,
        totalAmount: total,
        amountPaid,
        amountDue,
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

    if (amountPaid > 0) {
      await tx.salePayment.create({
        data: {
          saleId: sale.id,
          clientId: parsed.clientId,
          workerId: parsed.workerId,
          amount: amountPaid,
          paymentMethod: parsed.paymentMethod,
          paidAt: parsed.scheduledAt,
          note:
            resolvedPaymentStatus === PAYMENT_STATUS_PAID
              ? "Pago completo registrado con la venta."
              : "Pago inicial registrado con la venta."
        }
      });
    }

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
            note:
              parsed.operationType === SALE_OPERATION_REFILL
                ? `Salida por recarga - ${item.productName}`
                : `Salida por venta - ${item.productName}`,
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

export async function registerSalePayment({
  saleId,
  amount,
  paymentMethod,
  paidAt,
  note
}: {
  saleId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paidAt: Date;
  note?: string;
}) {
  if (!saleId) {
    throw new Error("La venta no existe.");
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("El abono debe ser mayor a cero.");
  }

  return prisma.$transaction(async (tx) => {
    const sale = await tx.sale.findUnique({
      where: { id: saleId },
      select: {
        id: true,
        clientId: true,
        workerId: true,
        paymentStatus: true,
        amountPaid: true,
        amountDue: true,
        totalAmount: true
      }
    });

    if (!sale) {
      throw new Error("La venta no existe.");
    }

    const currentDue = Number(sale.amountDue);

    if (currentDue <= 0) {
      throw new Error("Esta venta ya no tiene saldo pendiente.");
    }

    if (amount > currentDue) {
      throw new Error(`El abono supera el saldo pendiente de ${currentDue}.`);
    }

    await tx.salePayment.create({
      data: {
        saleId: sale.id,
        clientId: sale.clientId,
        workerId: sale.workerId,
        amount,
        paymentMethod,
        paidAt,
        note: note || null
      }
    });

    const nextPaid = Number(sale.amountPaid) + amount;
    const nextDue = Math.max(0, Number(sale.totalAmount) - nextPaid);

    return tx.sale.update({
      where: { id: sale.id },
      data: {
        amountPaid: nextPaid,
        amountDue: nextDue,
        paymentMethod,
        paymentStatus:
          nextDue === 0
            ? PAYMENT_STATUS_PAID
            : nextPaid > 0
              ? PAYMENT_STATUS_PARTIAL
              : PAYMENT_STATUS_CREDIT,
        settledAt: nextDue === 0 ? paidAt : null
      }
    });
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
      const requiredByProduct = new Map<
        string,
        { name: string; quantity: number; stock: number }
      >();

      sale.items.forEach((item) => {
        const current = requiredByProduct.get(item.productId);

        requiredByProduct.set(item.productId, {
          name: item.product.name,
          stock: item.product.stock,
          quantity: (current?.quantity ?? 0) + item.quantity
        });
      });

      requiredByProduct.forEach((item) => {
        if (item.quantity > item.stock) {
          throw new Error(
            `No hay stock suficiente para reactivar la venta de ${item.name}. Disponible: ${item.stock}.`
          );
        }
      });

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
