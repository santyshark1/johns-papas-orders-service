"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useCreateOrder } from "@/features/orders/hooks/useOrders";
import type { CreateOrderInput } from "@/features/orders/types/order";
import {
  createOrderSchema,
  type CreateOrderFormValues
} from "@/features/orders/schemas/orderSchema";

const defaultValues: CreateOrderFormValues = {
  customerName: "",
  notes: "",
  items: [{ productId: 1, quantity: 1 }]
};

export function CreateOrderForm() {
  const createOrderMutation = useCreateOrder();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<CreateOrderFormValues>({
    resolver: zodResolver(createOrderSchema),
    defaultValues
  });

  const onSubmit = handleSubmit(async (values) => {
    const payload: CreateOrderInput = {
      customerName: values.customerName,
      notes: values.notes,
      items: values.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity
      }))
    };

    await createOrderMutation.mutateAsync(payload);
    reset(defaultValues);
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl bg-white p-4 shadow">
      <h3 className="text-xl text-[#5C3D1E]" style={{ fontFamily: "Playfair Display, serif" }}>
        Crear Pedido
      </h3>

      <div className="grid gap-1">
        <label htmlFor="customerName" className="text-sm font-medium text-[#5C3D1E]">
          Cliente
        </label>
        <input
          id="customerName"
          className="rounded-md border px-3 py-2"
          placeholder="Nombre del cliente"
          {...register("customerName")}
        />
        {errors.customerName ? (
          <span className="text-sm text-red-600">{errors.customerName.message}</span>
        ) : null}
      </div>

      <div className="grid gap-1">
        <label htmlFor="productId" className="text-sm font-medium text-[#5C3D1E]">
          ID Producto
        </label>
        <input
          id="productId"
          type="number"
          className="rounded-md border px-3 py-2"
          {...register("items.0.productId")}
        />
      </div>

      <div className="grid gap-1">
        <label htmlFor="quantity" className="text-sm font-medium text-[#5C3D1E]">
          Cantidad
        </label>
        <input
          id="quantity"
          type="number"
          className="rounded-md border px-3 py-2"
          {...register("items.0.quantity")}
        />
      </div>

      <div className="grid gap-1">
        <label htmlFor="notes" className="text-sm font-medium text-[#5C3D1E]">
          Notas
        </label>
        <textarea
          id="notes"
          className="rounded-md border px-3 py-2"
          placeholder="Observaciones"
          {...register("notes")}
        />
      </div>

      <button
        type="submit"
        disabled={createOrderMutation.isPending}
        className="rounded-md bg-[#D4A017] px-4 py-2 font-semibold text-[#5C3D1E] disabled:opacity-60"
      >
        {createOrderMutation.isPending ? "Guardando..." : "Crear Pedido"}
      </button>

      {createOrderMutation.isError ? (
        <p className="text-sm text-red-600">Error: {createOrderMutation.error.message}</p>
      ) : null}

      {createOrderMutation.isSuccess ? (
        <p className="text-sm text-green-700">Pedido creado correctamente.</p>
      ) : null}
    </form>
  );
}
