import { z } from "zod";

export const clientSchema = z.object({
  code: z.string().max(20, "Usa un código corto y trazable.").optional(),
  fullName: z.string().min(3, "El nombre del cliente es obligatorio."),
  phone: z
    .string()
    .regex(/^\d{9}$/, "El teléfono debe tener exactamente 9 dígitos numéricos."),
  address: z.string().min(5, "La dirección es obligatoria."),
  district: z.string().min(2, "El distrito o zona es obligatorio."),
  referenceNote: z.string().optional(),
  googleMapsUrl: z
    .string()
    .url("La URL de Google Maps no es valida.")
    .or(z.literal(""))
    .optional(),
  facadePhotoUrl: z
    .string()
    .url("La URL de la fachada no es valida.")
    .or(z.literal(""))
    .optional(),
  isActive: z.boolean()
});

export type ClientFormValues = z.infer<typeof clientSchema>;
