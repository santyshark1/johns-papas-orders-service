import React from "react";
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/shared/lib/queryClient";
import { CreateOrderForm } from "@/features/orders/components/CreateOrderForm";

function renderWithQuery() {
  const queryClient = createQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>
      <CreateOrderForm />
    </QueryClientProvider>
  );
}

describe("CreateOrderForm", () => {
  it("muestra error si cliente esta vacio", async () => {
    renderWithQuery();

    fireEvent.click(screen.getByRole("button", { name: "Crear Pedido" }));

    expect(await screen.findByText("El nombre del cliente es obligatorio")).toBeInTheDocument();
  });
});
