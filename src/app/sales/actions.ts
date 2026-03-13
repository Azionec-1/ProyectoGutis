"use server";

import { Prisma, SaleStatus, PaymentMethod } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { createSale, updateSaleStatus } from "@/lib/data/sale-service";

type ActionState = {
  error?: string;
  errors?: string[];
};

function readItems(formData: FormData) {
  const names = formData.getAll("itemName").map((value) => String(value ?? "").trim());
  const quantities = formData
    .getAll("itemQuantity")
    .map((value) => Number(String(value ?? "0")));
  const prices = formData
    .getAll("itemUnitPrice")
    .map((value) => Number(String(value ?? "0")));

  return names
    .map((itemName, index) => ({
      itemName,
      quantity: quantities[index] ?? 0,
      unitPrice: prices[index] ?? 0
    }))
    .filter((item) => item.itemName.length > 0);
}

function parseDateTimeLocal(value: string) {
  if (!value) {
    return new Date();
  }
  return new Date(value);
}

export async function createSaleAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await createSale({
      clientId: String(formData.get("clientId") ?? ""),
      workerId: String(formData.get("workerId") ?? "") || undefined,
      status: String(formData.get("status") ?? SaleStatus.PENDIENTE) as SaleStatus,
      paymentMethod: String(
        formData.get("paymentMethod") ?? PaymentMethod.EFECTIVO
      ) as PaymentMethod,
      scheduledAt: parseDateTimeLocal(String(formData.get("scheduledAt") ?? "")),
      discountAmount: Number(String(formData.get("discountAmount") ?? "0")),
      notes: String(formData.get("notes") ?? "") || undefined,
      items: readItems(formData)
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        error: "Corrige los datos de la venta.",
        errors: error.issues.map((issue) => issue.message)
      };
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return { error: "No se pudo guardar la venta por una restricción de datos." };
    }

    return { error: "No se pudo registrar la venta." };
  }

  revalidatePath("/sales");
  redirect("/sales");
}

export async function updateSaleStatusAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as SaleStatus;

  if (!id || !Object.values(SaleStatus).includes(status)) {
    return;
  }

  try {
    await updateSaleStatus(id, status);
  } catch {
    return;
  }

  revalidatePath("/sales");
  revalidatePath(`/sales/${id}`);
}
