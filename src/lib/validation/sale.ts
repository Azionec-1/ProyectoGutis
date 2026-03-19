import { PaymentMethod, SaleStatus } from "@prisma/client";
import { z } from "zod";

const saleItemSchema = z.object({
  productId: z.string().min(1, "Selecciona un producto."),
  quantity: z.coerce.number().int().positive("La cantidad debe ser mayor a cero."),
  unitPrice: z.coerce.number().min(0, "El precio unitario no puede ser negativo.")
});

export const saleSchema = z
  .object({
    clientId: z.string().min(1, "Selecciona un cliente."),
    workerId: z.string().min(1, "Selecciona un repartidor."),
    status: z.nativeEnum(SaleStatus),
    paymentMethod: z.nativeEnum(PaymentMethod),
    scheduledAt: z.date(),
    discountAmount: z.coerce.number().min(0, "El descuento no puede ser negativo."),
    notes: z.string().optional(),
    items: z.array(saleItemSchema).min(1, "Agrega al menos un ítem.")
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
