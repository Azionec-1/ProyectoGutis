import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const DEFAULT_SUPPLIES: Array<{
  name: string;
  unitLabel: string;
  stock: Prisma.Decimal;
  packageSize?: Prisma.Decimal;
  productionConsumptionRate: Prisma.Decimal;
  lowStockAlert: Prisma.Decimal;
}> = [
  {
    name: "Botellas",
    unitLabel: "unidades",
    stock: new Prisma.Decimal(0),
    productionConsumptionRate: new Prisma.Decimal(1),
    lowStockAlert: new Prisma.Decimal(50)
  },
  {
    name: "Tapas",
    unitLabel: "unidades",
    stock: new Prisma.Decimal(0),
    productionConsumptionRate: new Prisma.Decimal(1),
    lowStockAlert: new Prisma.Decimal(50)
  },
  {
    name: "Etiquetas",
    unitLabel: "unidades",
    stock: new Prisma.Decimal(0),
    productionConsumptionRate: new Prisma.Decimal(1),
    lowStockAlert: new Prisma.Decimal(50)
  },
  {
    name: "Bolsas en empaque",
    unitLabel: "empaques",
    stock: new Prisma.Decimal(0),
    packageSize: new Prisma.Decimal(100),
    productionConsumptionRate: new Prisma.Decimal(0),
    lowStockAlert: new Prisma.Decimal(2)
  }
] as const;

type TxClient = Prisma.TransactionClient;

function decimal(value: number | string | Prisma.Decimal) {
  return value instanceof Prisma.Decimal ? value : new Prisma.Decimal(value);
}

export async function ensureDefaultInventorySupplies(db: Pick<TxClient, "inventorySupply"> = prisma) {
  await Promise.all(
    DEFAULT_SUPPLIES.map((supply) =>
      db.inventorySupply.upsert({
        where: { name: supply.name },
        update: {},
        create: {
          name: supply.name,
          unitLabel: supply.unitLabel,
          stock: supply.stock,
          packageSize: supply.packageSize ?? null,
          productionConsumptionRate: supply.productionConsumptionRate,
          lowStockAlert: supply.lowStockAlert
        }
      })
    )
  );
}

export async function listInventoryDashboard() {
  await ensureDefaultInventorySupplies();

  const [supplies, recentMovements] = await Promise.all([
    prisma.inventorySupply.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" }
    }),
    prisma.inventorySupplyMovement.findMany({
      orderBy: { happenedAt: "desc" },
      take: 12,
      include: {
        supply: {
          select: {
            name: true,
            unitLabel: true
          }
        }
      }
    })
  ]);

  const totalStock = supplies.reduce((sum, supply) => sum + Number(supply.stock), 0);
  const lowStockCount = supplies.filter((supply) => Number(supply.stock) <= Number(supply.lowStockAlert)).length;
  const autoManagedCount = supplies.filter((supply) => Number(supply.productionConsumptionRate) > 0).length;

  return {
    supplies,
    recentMovements,
    metrics: {
      totalSupplies: supplies.length,
      totalStock,
      lowStockCount,
      autoManagedCount
    }
  };
}

export async function createInventorySupply(input: {
  name: string;
  unitLabel: string;
  openingStock: number;
  packageSize?: number | null;
  productionConsumptionRate?: number;
  lowStockAlert?: number;
}) {
  const openingStock = decimal(input.openingStock);

  const supply = await prisma.inventorySupply.create({
    data: {
      name: input.name,
      unitLabel: input.unitLabel,
      stock: openingStock,
      packageSize: input.packageSize && input.packageSize > 0 ? decimal(input.packageSize) : null,
      productionConsumptionRate: decimal(input.productionConsumptionRate ?? 0),
      lowStockAlert: decimal(input.lowStockAlert ?? 0)
    }
  });

  if (openingStock.gt(0)) {
    await prisma.inventorySupplyMovement.create({
      data: {
        supplyId: supply.id,
        movementType: "INGRESO",
        quantity: openingStock,
        stockAfter: openingStock,
        happenedAt: new Date(),
        note: "Stock inicial del insumo"
      }
    });
  }

  return supply;
}

export async function registerInventoryMovement(input: {
  supplyId: string;
  movementType: "INGRESO" | "SALIDA";
  quantity: number;
  happenedAt?: Date;
  note?: string;
}) {
  const quantity = decimal(input.quantity);

  return prisma.$transaction(async (tx) => {
    const supply = await tx.inventorySupply.findUnique({
      where: { id: input.supplyId }
    });

    if (!supply) {
      throw new Error("El insumo ya no existe.");
    }

    const nextStock =
      input.movementType === "INGRESO" ? supply.stock.plus(quantity) : supply.stock.minus(quantity);

    if (nextStock.lt(0)) {
      throw new Error(`No hay stock suficiente de ${supply.name}. Disponible: ${supply.stock.toString()}.`);
    }

    const updatedSupply = await tx.inventorySupply.update({
      where: { id: supply.id },
      data: {
        stock: nextStock
      }
    });

    await tx.inventorySupplyMovement.create({
      data: {
        supplyId: supply.id,
        movementType: input.movementType,
        quantity,
        stockAfter: nextStock,
        happenedAt: input.happenedAt ?? new Date(),
        note: input.note?.trim() || null
      }
    });

    return updatedSupply;
  });
}

export async function updateInventorySupplySettings(input: {
  supplyId: string;
  packageSize?: number | null;
  productionConsumptionRate?: number;
  lowStockAlert?: number;
}) {
  return prisma.inventorySupply.update({
    where: { id: input.supplyId },
    data: {
      packageSize: input.packageSize && input.packageSize > 0 ? decimal(input.packageSize) : null,
      productionConsumptionRate: decimal(input.productionConsumptionRate ?? 0),
      lowStockAlert: decimal(input.lowStockAlert ?? 0)
    }
  });
}

export async function consumeInventoryForProduction(
  tx: TxClient,
  quantityProduced: number,
  note: string,
  happenedAt: Date
) {
  const supplies = await tx.inventorySupply.findMany({
    where: {
      isActive: true,
      productionConsumptionRate: {
        gt: 0
      }
    }
  });

  for (const supply of supplies) {
    const consumedQuantity = supply.productionConsumptionRate.mul(quantityProduced);

    if (consumedQuantity.lte(0)) {
      continue;
    }

    if (supply.stock.lt(consumedQuantity)) {
      throw new Error(
        `No hay stock suficiente de ${supply.name} para registrar la produccion. Disponible: ${supply.stock.toString()}.`
      );
    }

    const nextStock = supply.stock.minus(consumedQuantity);

    await tx.inventorySupply.update({
      where: { id: supply.id },
      data: {
        stock: nextStock
      }
    });

    await tx.inventorySupplyMovement.create({
      data: {
        supplyId: supply.id,
        movementType: "CONSUMO_PRODUCCION",
        quantity: consumedQuantity,
        stockAfter: nextStock,
        happenedAt,
        note
      }
    });
  }
}

export async function restoreInventoryFromProductionRevert(
  tx: TxClient,
  quantityProduced: number,
  note: string,
  happenedAt: Date
) {
  const supplies = await tx.inventorySupply.findMany({
    where: {
      isActive: true,
      productionConsumptionRate: {
        gt: 0
      }
    }
  });

  for (const supply of supplies) {
    const restoredQuantity = supply.productionConsumptionRate.mul(quantityProduced);

    if (restoredQuantity.lte(0)) {
      continue;
    }

    const nextStock = supply.stock.plus(restoredQuantity);

    await tx.inventorySupply.update({
      where: { id: supply.id },
      data: {
        stock: nextStock
      }
    });

    await tx.inventorySupplyMovement.create({
      data: {
        supplyId: supply.id,
        movementType: "REPOSICION_PRODUCCION",
        quantity: restoredQuantity,
        stockAfter: nextStock,
        happenedAt,
        note
      }
    });
  }
}
