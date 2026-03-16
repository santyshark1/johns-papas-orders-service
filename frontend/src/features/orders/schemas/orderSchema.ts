import { z } from "zod";

export const createOrderSchema = z.object({
  customerName: z.string().min(3, "El nombre del cliente es obligatorio"),
  notes: z.string().max(240, "Las notas no pueden superar 240 caracteres").optional(),
  items: z
    .array(
      z.object({
        productId: z.coerce.number().int().positive("El producto es obligatorio"),
        quantity: z.coerce.number().int().min(1, "La cantidad debe ser al menos 1")
      })
    )
    .min(1, "Debes agregar al menos un producto")
});

export type CreateOrderFormValues = z.infer<typeof createOrderSchema>;
