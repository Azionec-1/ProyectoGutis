"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function revalidateProductsAndReports() {
  revalidatePath("/admin/products");
  revalidatePath("/reports");
}

export async function registerDailyProductionAction(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");
  const quantity = Number(String(formData.get("quantity") ?? "0"));

  if (!productId || !Number.isInteger(quantity) || quantity <= 0) {
    return;
  }

  const producedOn = startOfToday();

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id: productId },
      data: {
        stock: {
          increment: quantity
        }
      }
    });

    await tx.productionLog.upsert({
      where: {
        productId_producedOn: {
          productId,
          producedOn
        }
      },
      update: {
        quantity: {
          increment: quantity
        },
        lastRegisteredAmount: quantity
      },
      create: {
        productId,
        quantity,
        lastRegisteredAmount: quantity,
        producedOn
      }
    });
  });

  revalidateProductsAndReports();
}

export async function revertLastProductionAction(formData: FormData) {
  const productId = String(formData.get("productId") ?? "");

  if (!productId) {
    return;
  }

  const producedOn = startOfToday();

  await prisma.$transaction(async (tx) => {
    const productionLog = await tx.productionLog.findUnique({
      where: {
        productId_producedOn: {
          productId,
          producedOn
        }
      }
    });

    if (!productionLog || productionLog.lastRegisteredAmount <= 0) {
      return;
    }

    const revertAmount = productionLog.lastRegisteredAmount;

    await tx.product.update({
      where: { id: productId },
      data: {
        stock: {
          decrement: revertAmount
        }
      }
    });

    if (productionLog.quantity - revertAmount <= 0) {
      await tx.productionLog.delete({
        where: {
          productId_producedOn: {
            productId,
            producedOn
          }
        }
      });
      return;
    }

    await tx.productionLog.update({
      where: {
        productId_producedOn: {
          productId,
          producedOn
        }
      },
      data: {
        quantity: {
          decrement: revertAmount
        },
        lastRegisteredAmount: 0
      }
    });
  });

  revalidateProductsAndReports();
}
