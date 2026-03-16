import axios from "axios";
import { useAuthStore } from "@/shared/store/authStore";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export const axiosClient = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json"
  }
});

axiosClient.interceptors.request.use((config) => {
  const tokenFromStore = useAuthStore.getState().token;
  const tokenFromStorage = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const token = tokenFromStore ?? tokenFromStorage;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.detail ?? error?.message ?? "Error de red";
    return Promise.reject(new Error(message));
  }
);
