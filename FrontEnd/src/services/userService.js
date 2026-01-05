import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

export const blockUser = async (id) => {
  const response = await axios.put(`${API_BASE_URL}/admin/block-user/${id}`, {}, { withCredentials: true });
  return response.data;
};

export const unblockUser = async (id) => {
  const response = await axios.put(`${API_BASE_URL}/admin/unblock-user/${id}`, {}, { withCredentials: true });
  return response.data;
};
