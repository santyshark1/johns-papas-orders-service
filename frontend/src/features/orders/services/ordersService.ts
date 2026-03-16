import { axiosClient } from "@/services/httpClient/axiosClient";
import type { CreateOrderInput, Order, UpdateOrderStatusInput } from "@/features/orders/types/order";

const ORDERS_ENDPOINT = "/orders/";

export const ordersService = {
  async getOrders() {
    const { data } = await axiosClient.get<Order[]>(ORDERS_ENDPOINT);
    return data;
  },

  async getOrderById(id: number) {
    const { data } = await axiosClient.get<Order>(`${ORDERS_ENDPOINT}${id}/`);
    return data;
  },

  async createOrder(payload: CreateOrderInput) {
    const { data } = await axiosClient.post<Order>(ORDERS_ENDPOINT, payload);
    return data;
  },

  async updateOrderStatus({ id, status }: UpdateOrderStatusInput) {
    const { data } = await axiosClient.put<Order>(`${ORDERS_ENDPOINT}${id}/`, { status });
    return data;
  },

  async cancelOrder(id: number) {
    await axiosClient.delete(`${ORDERS_ENDPOINT}${id}/`);
  }
};
