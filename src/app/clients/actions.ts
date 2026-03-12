"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { createClient, updateClient } from "@/lib/data/client-service";

type ActionState = {
  error?: string;
  errors?: string[];
};

function readBoolean(value: FormDataEntryValue | null) {
  return value === "on";
}

function mapFormData(formData: FormData) {
  return {
    code: String(formData.get("code") ?? ""),
    fullName: String(formData.get("fullName") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    address: String(formData.get("address") ?? ""),
    district: String(formData.get("district") ?? ""),
    referenceNote: String(formData.get("referenceNote") ?? ""),
    googleMapsUrl: String(formData.get("googleMapsUrl") ?? ""),
    facadePhotoUrl: String(formData.get("facadePhotoUrl") ?? ""),
    isActive: readBoolean(formData.get("isActive"))
  };
}

export async function createClientAction(_: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await createClient(mapFormData(formData));
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        error: "Corrige los campos del formulario.",
        errors: error.issues.map((issue) => issue.message)
      };
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "El codigo interno ya existe." };
    }

    return { error: "No se pudo guardar el cliente." };
  }

  revalidatePath("/");
  revalidatePath("/clients");
  redirect("/clients");
}

export async function updateClientAction(
  id: string,
  _: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await updateClient(id, mapFormData(formData));
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        error: "Corrige los campos del formulario.",
        errors: error.issues.map((issue) => issue.message)
      };
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "El codigo interno ya existe." };
    }

    return { error: "No se pudo actualizar el cliente." };
  }

  revalidatePath("/");
  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  redirect(`/clients/${id}`);
}
