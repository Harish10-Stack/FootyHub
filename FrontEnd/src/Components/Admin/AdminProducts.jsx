import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api.js";
import Swal from "sweetalert2";
import { Trash2, Plus, Edit } from "lucide-react";

export default function AdminProducts() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const confirmAndDeleteProduct = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: "Delete product?",
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
      console.error(err);
      Swal.fire("Error", "Could not delete product", "error");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Products</h1>
        <button
          onClick={() => navigate('/admin/products/add')}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>
      <div className="bg-[#0b1114] border border-[#22282c] rounded-lg p-4 overflow-auto">
        <table className="w-full text-left">
          <thead className="text-xs text-gray-400">
            <tr>
              <th className="py-2 px-2">Name</th>
              <th className="py-2 px-2">Category</th>
              <th className="py-2 px-2">Price</th>
              <th className="py-2 px-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} className="border-t border-[#11181b]">
                <td className="py-2 px-2">{p.name}</td>
                <td className="py-2 px-2">{p.category}</td>
                <td className="py-2 px-2">₹{p.price.toLocaleString()}</td>
                <td className="py-2 px-2 flex gap-2">
                  <button
                    onClick={() => navigate(`/admin/products/edit/${p._id}`)}
                    className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => confirmAndDeleteProduct(p._id)}
                    className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan="4" className="py-2 px-2 text-gray-500 text-sm">
                  No products
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
