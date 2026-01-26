import React, { useEffect, useState } from "react";
import api from "../../utils/api.js"; // ✅ use your axios instance
import Swal from "sweetalert2";
import { Trash2 } from "lucide-react";

export default function AdminProductList() {
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const deleteProduct = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: "Delete product?",
      text: "This will permanently remove the product.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });
    if (!isConfirmed) return;

    try {
      await api.delete(`/products/${id}`);
      Swal.fire("Deleted", "Product removed", "success");
      fetchProducts();
    } catch (err) {
      Swal.fire("Error", err?.response?.data?.message || "Could not delete product", "error");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Products</h1>
      <div className="bg-[#0b1114] border border-[#22282c] rounded-lg p-4 shadow-sm overflow-auto">
        <table className="w-full text-left">
          <thead className="text-xs text-gray-400">
            <tr>
              <th className="py-2 px-2">Name</th>
              <th className="py-2 px-2">Category</th>
              <th className="py-2 px-2">Price</th>
              <th className="py-2 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id} className="border-t border-[#11181b]">
                <td className="py-3 px-2">{p.name}</td>
                <td className="py-3 px-2">{p.category}</td>
                <td className="py-3 px-2">₹{Number(p.price).toLocaleString()}</td>
                <td className="py-3 px-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.location.href = `/admin/products/edit/${p._id}`}
                      className="px-2 py-1 rounded border border-[#23303a] hover:bg-[#0f1720]"
                    >Edit</button>
                    <button
                      onClick={() => deleteProduct(p._id)}
                      className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan="4" className="text-gray-500 py-3 px-2">No products</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
