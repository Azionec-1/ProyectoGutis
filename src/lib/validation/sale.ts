import { PaymentMethod, SaleStatus } from "@prisma/client";
import { z } from "zod";

const saleItemSchema = z.object({
  itemName: z.string().min(2, "El nombre del item es obligatorio."),
  quantity: z.number().int().positive("La cantidad debe ser mayor a cero."),
  unitPrice: z.number().min(0, "El precio unitario no puede ser negativo.")
});

export const saleSchema = z
  .object({
    clientId: z.string().min(1, "Selecciona un cliente."),
    workerId: z.string().optional(),
    status: z.nativeEnum(SaleStatus),
    paymentMethod: z.nativeEnum(PaymentMethod),
    scheduledAt: z.date(),
    discountAmount: z.number().min(0, "El descuento no puede ser negativo."),
    notes: z.string().optional(),
    items: z.array(saleItemSchema).min(1, "Agrega al menos un item.")
  })
  .superRefine((values, context) => {
    const subtotal = values.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );

    if (values.discountAmount > subtotal) {
      context.addIssue({
        code: "custom",
        message: "El descuento no puede ser mayor al subtotal.",
        path: ["discountAmount"]
      });
    }
  });

export type SaleFormValues = z.infer<typeof saleSchema>;
