import { PaymentMethod, SaleStatus } from "@prisma/client";
import { z } from "zod";

const paymentStatusSchema = z.enum(["PAGADO", "PARCIAL", "CREDITO"]);
const saleOperationTypeSchema = z.enum(["VENTA", "RECARGA"]);

const saleItemSchema = z.object({
  productId: z.string().min(1, "Selecciona un producto."),
  quantity: z.coerce.number().int().positive("La cantidad debe ser mayor a cero."),
  unitPrice: z.coerce.number().min(0, "El precio unitario no puede ser negativo.")
});

export const saleSchema = z
  .object({
    clientId: z.string().min(1, "Selecciona un cliente."),
    workerId: z
      .string()
      .trim()
      .optional()
      .transform((value) => (value && value.length > 0 ? value : undefined)),
    status: z.nativeEnum(SaleStatus),
    operationType: saleOperationTypeSchema,
    paymentStatus: paymentStatusSchema,
    paymentMethod: z.nativeEnum(PaymentMethod),
    scheduledAt: z.date(),
    dueDate: z.date().optional(),
    discountAmount: z.coerce.number().min(0, "El descuento no puede ser negativo."),
    initialPaidAmount: z.coerce.number().min(0, "El pago inicial no puede ser negativo."),
    notes: z.string().optional(),
    items: z.array(saleItemSchema).min(1, "Agrega al menos un item.")
  })
  .superRefine((values, context) => {
    const subtotal = values.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    if (values.discountAmount > subtotal) {
      context.addIssue({
        code: "custom",
        message: "El descuento no puede ser mayor al subtotal.",
        path: ["discountAmount"]
      });
    }

    const total = subtotal - values.discountAmount;

    if (values.initialPaidAmount > total) {
      context.addIssue({
        code: "custom",
        message: "El pago inicial no puede ser mayor al total.",
        path: ["initialPaidAmount"]
      });
    }

    if (values.paymentStatus === "PAGADO" && values.initialPaidAmount !== total) {
      context.addIssue({
        code: "custom",
        message: "Si la venta queda pagada, el pago inicial debe cubrir el total.",
        path: ["initialPaidAmount"]
      });
    }

    if (values.paymentStatus === "CREDITO" && values.initialPaidAmount !== 0) {
      context.addIssue({
        code: "custom",
        message: "Las ventas al credito deben iniciar sin pago.",
        path: ["initialPaidAmount"]
      });
    }

    if (values.paymentStatus !== "PAGADO" && !values.dueDate) {
      context.addIssue({
        code: "custom",
        message: "Indica la fecha de cancelacion de la deuda.",
        path: ["dueDate"]
      });
    }
  });

export type SaleFormValues = z.infer<typeof saleSchema>;
