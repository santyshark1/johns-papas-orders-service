import { describe, expect, it } from "vitest";
import { createOrderSchema } from "@/features/orders/schemas/orderSchema";

describe("createOrderSchema", () => {
  it("acepta payload valido", () => {
    const parsed = createOrderSchema.safeParse({
      customerName: "Juan Perez",
      notes: "Sin cebolla",
      items: [{ productId: 10, quantity: 2 }]
    });

    expect(parsed.success).toBe(true);
  });

  it("rechaza payload sin items", () => {
    const parsed = createOrderSchema.safeParse({
      customerName: "Juan Perez",
      items: []
    });

    expect(parsed.success).toBe(false);
  });
});
