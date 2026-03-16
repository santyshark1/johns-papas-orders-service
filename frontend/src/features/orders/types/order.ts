export type OrderStatus = "pending" | "in_preparation" | "ready" | "cancelled";

export type OrderItem = {
  productId: number;
  quantity: number;
  unitPrice: number;
};

export type Order = {
  id: number;
  customerName: string;
  notes?: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  items: OrderItem[];
};

export type CreateOrderInput = {
  customerName: string;
  notes?: string;
  items: Array<{
    productId: number;
    quantity: number;
  }>;
};

export type UpdateOrderStatusInput = {
  id: number;
  status: Exclude<OrderStatus, "cancelled">;
};
