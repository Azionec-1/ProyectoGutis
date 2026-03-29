"use server";

import { revalidatePath } from "next/cache";
import {
  createInventorySupply,
  registerInventoryMovement,
  updateInventorySupplySettings
} from "@/lib/data/inventory-service";

function revalidateInventoryViews() {
  revalidatePath("/inventory");
  revalidatePath("/admin/products");
}

export async function createInventorySupplyAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const unitLabel = String(formData.get("unitLabel") ?? "unidades").trim();
  const openingStock = Number(String(formData.get("openingStock") ?? "0"));
  const packageSizeRaw = String(formData.get("packageSize") ?? "").trim();
  const consumptionRate = Number(String(formData.get("productionConsumptionRate") ?? "0"));
  const lowStockAlert = Number(String(formData.get("lowStockAlert") ?? "0"));

  if (!name || !unitLabel || !Number.isFinite(openingStock) || openingStock < 0) {
    return;
  }

  await createInventorySupply({
    name,
    unitLabel,
    openingStock,
    packageSize: packageSizeRaw ? Number(packageSizeRaw) : null,
    productionConsumptionRate: Number.isFinite(consumptionRate) && consumptionRate >= 0 ? consumptionRate : 0,
    lowStockAlert: Number.isFinite(lowStockAlert) && lowStockAlert >= 0 ? lowStockAlert : 0
  });

  revalidateInventoryViews();
}

export async function registerInventoryMovementAction(formData: FormData) {
  const supplyId = String(formData.get("supplyId") ?? "");
  const movementTypeRaw = String(formData.get("movementType") ?? "INGRESO").trim();
  const quantity = Number(String(formData.get("quantity") ?? "0"));
  const happenedAtRaw = String(formData.get("happenedAt") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();

  if (!supplyId || !Number.isFinite(quantity) || quantity <= 0) {
    return;
  }

  const movementType = movementTypeRaw === "SALIDA" ? "SALIDA" : "INGRESO";
  const happenedAt = happenedAtRaw ? new Date(`${happenedAtRaw}T00:00:00`) : new Date();

  await registerInventoryMovement({
    supplyId,
    movementType,
    quantity,
    happenedAt,
    note
  });

  revalidateInventoryViews();
}

export async function updateInventorySupplySettingsAction(formData: FormData) {
  const supplyId = String(formData.get("supplyId") ?? "");
  const packageSizeRaw = String(formData.get("packageSize") ?? "").trim();
  const consumptionRate = Number(String(formData.get("productionConsumptionRate") ?? "0"));
  const lowStockAlert = Number(String(formData.get("lowStockAlert") ?? "0"));

  if (!supplyId) {
    return;
  }

  await updateInventorySupplySettings({
    supplyId,
    packageSize: packageSizeRaw ? Number(packageSizeRaw) : null,
    productionConsumptionRate: Number.isFinite(consumptionRate) && consumptionRate >= 0 ? consumptionRate : 0,
    lowStockAlert: Number.isFinite(lowStockAlert) && lowStockAlert >= 0 ? lowStockAlert : 0
  });

  revalidateInventoryViews();
}
