import { apiRequest } from "./api";

export function getProducts() {
  return apiRequest("/api/products");
}
