import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Upload, Package, Tag, DollarSign, FileText } from "lucide-react";

export default function AdminAddProduct() {
  const [form, setForm] = useState({ name: "", category: "", price: "", description: "" });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = e => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('category', form.category);
    formData.append('price', form.price);
    formData.append('description', form.description);
    if (image) formData.append('img', image);

    try {
      await axios.post("http://localhost:5000/api/products", formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      Swal.fire("Success", "Product added successfully", "success");
      setForm({ name: "", category: "", price: "", description: "" });
      setImage(null);
      setImagePreview(null);
    } catch (err) {
      Swal.fire("Error", err?.response?.data?.message || "Failed to add product", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Add New Product</h1>
        <p className="text-gray-400">Fill in the details below to add a new product to your catalog.</p>
      </div>

      <div className="bg-[#0b1114] border border-[#22282c] rounded-lg p-6 shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <Package size={16} />
                Product Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-[#0f1720] border border-[#23303a] text-white placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                placeholder="Enter product name"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <Tag size={16} />
                Category
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-[#0f1720] border border-[#23303a] text-white focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                required
              >
                <option value="">Select a category</option>
                <option value="Footballs">Footballs</option>
                <option value="Jerseys">Jerseys</option>
                <option value="Boots">Boots</option>
                <option value="GoalkeeperGloves">Goalkeeper Gloves</option>
                <option value="ProtectiveGear">Protective Gear</option>
                <option value="TrainingEquipment">Training Equipment</option>
              </select>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <DollarSign size={16} />
                Price (₹)
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="w-full p-3 rounded-lg bg-[#0f1720] border border-[#23303a] text-white placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <Upload size={16} />
                Product Image
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex items-center justify-center w-full p-3 rounded-lg bg-[#0f1720] border border-[#23303a] text-gray-400 cursor-pointer hover:border-green-500 hover:text-green-400 transition-colors"
                >
                  <Upload size={16} className="mr-2" />
                  {image ? image.name : "Choose image file"}
                </label>
              </div>
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-lg border border-[#23303a]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <FileText size={16} />
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="w-full p-3 rounded-lg bg-[#0f1720] border border-[#23303a] text-white placeholder-gray-500 focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors resize-none"
              placeholder="Enter product description"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding Product...
                </>
              ) : (
                <>
                  <Package size={16} />
                  Add Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
