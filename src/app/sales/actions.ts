"use server";

import { PaymentMethod, Prisma, SaleStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { findOrCreateQuickClient } from "@/lib/data/client-service";
import { createSale, updateSaleStatus } from "@/lib/data/sale-service";

type ActionState = {
  error?: string;
  errors?: string[];
};

function readItems(formData: FormData) {
  const productIds = formData.getAll("productId").map((value) => String(value ?? "").trim());
  const quantities = formData
    .getAll("itemQuantity")
    .map((value) => Number(String(value ?? "0")));
  const prices = formData
    .getAll("itemUnitPrice")
    .map((value) => Number(String(value ?? "0")));

  return productIds
    .map((productId, index) => ({
      productId,
      quantity: quantities[index] ?? 0,
      unitPrice: prices[index] ?? 0
    }))
    .filter((item) => item.productId.length > 0);
}

function parseDateTimeLocal(value: string) {
  if (!value) {
    return new Date();
  }
  return new Date(value);
}

export async function createSaleAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    let clientId = String(formData.get("clientId") ?? "");
    const clientDraftName = String(formData.get("clientDraftName") ?? "").trim();

    if (!clientId) {
      if (!clientDraftName) {
        return { error: "Selecciona un cliente o escribe el nombre para crearlo." };
      }

      const quickClient = await findOrCreateQuickClient(clientDraftName);
      clientId = quickClient.id;
    }

    await createSale({
      clientId,
      workerId: String(formData.get("workerId") ?? ""),
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

    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: "No se pudo registrar la venta." };
  }

  revalidatePath("/sales");
  revalidatePath("/admin/products");
  revalidatePath("/clients");
  revalidatePath("/");
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
