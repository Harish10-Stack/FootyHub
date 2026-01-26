import api from "../utils/api";

// ==============================
// Admin – User management
// ==============================

export const blockUser = async (id) => {
  const { data } = await api.put(`/admin/block-user/${id}`);
  return data;
};

export const unblockUser = async (id) => {
  const { data } = await api.put(`/admin/unblock-user/${id}`);
  return data;
};

// ==============================
// Products
// ==============================

export const getProducts = async () => {
  const { data } = await api.get("/products");
  return data;
};

export const getProductById = async (id) => {
  const { data } = await api.get(`/products/${id}`);
  return data;
};


