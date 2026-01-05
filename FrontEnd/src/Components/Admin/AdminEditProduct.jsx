import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useParams, useNavigate } from "react-router-dom";

export default function AdminEditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", category: "", price: "", description: "" });
  const [image, setImage] = useState(null);
  const [currentImage, setCurrentImage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/products/${id}`, { withCredentials: true });
        setForm({ name: data.name, category: data.category, price: data.price, description: data.description });
        setCurrentImage(data.img);
      } catch (err) {
        Swal.fire("Error", "Failed to fetch product", "error");
      }
    };
    fetchProduct();
  }, [id]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = e => setImage(e.target.files[0]);

  const handleSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('category', form.category);
    formData.append('price', form.price);
    formData.append('description', form.description);
    if (image) formData.append('img', image);

    try {
      await axios.put(`http://localhost:5000/api/products/${id}`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
       Swal.fire("Success", "Product updated successfully", "success");
    } catch (err) {
      Swal.fire("Error", err?.response?.data?.message || "Failed to update product", "error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-[#0b1114] border border-[#22282c] rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-white">Edit Product</h1>
          <button
            onClick={() => navigate('/admin/products')}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Back to Products
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-[#0f1720] border border-[#23303a] text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-[#0f1720] border border-[#23303a] text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Price (₹)
            </label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-[#0f1720] border border-[#23303a] text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="4"
              className="w-full p-3 rounded-lg bg-[#0f1720] border border-[#23303a] text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-vertical"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Current Image
            </label>
            {currentImage && (
              <div className="mb-4">
                <img
                  src={`http://localhost:5000${currentImage}`}
                  alt="Current Product"
                  className="w-32 h-32 object-cover rounded-lg border border-[#23303a]"
                />
              </div>
            )}

            <label className="block text-sm font-medium text-gray-300 mb-2">
              Upload New Image (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full p-3 rounded-lg bg-[#0f1720] border border-[#23303a] text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Update Product
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
