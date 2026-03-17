"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
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
        }
      },
      create: {
        productId,
        quantity,
        producedOn
      }
    });
  });

  revalidatePath("/admin/products");
}
