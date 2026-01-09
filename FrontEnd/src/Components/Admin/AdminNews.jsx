import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function AdminNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
  });
  const [editingNews, setEditingNews] = useState(null);

  const fetchNews = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/news");
      setNews(data);
    } catch (error) {
      Swal.fire("Error", "Failed to fetch news", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      if (editingNews) {
        await axios.put(
          `https://footyhub-backend-cqir.onrender.com/api/news/${editingNews._id}`,
          formData,
          { withCredentials: true }
        );
        Swal.fire("Success", "News updated successfully", "success");
      } else {
        await axios.post("https://footyhub-backend-cqir.onrender.com/api/news", formData, { withCredentials: true });
        Swal.fire("Success", "News added successfully", "success");
      }
      setFormData({ title: "", description: "", date: "" });
      setEditingNews(null);
      fetchNews();
    } catch (error) {
      Swal.fire("Error", error?.response?.data?.message || "Operation failed", "error");
      console.error(error);
    }
  };

  const handleEdit = (item) => {
    setEditingNews(item);
    setFormData({
      title: item.title,
      description: item.description,
      date: item.date.split("T")[0], // ISO date format
    });
  };

  const handleDelete = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: "Delete news?",
      text: "This will permanently remove the news item.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });
    if (!isConfirmed) return;
    try {
      await axios.delete(`https://footyhub-backend-cqir.onrender.com/api/news/${id}`, { withCredentials: true });
      setNews(prevNews => prevNews.filter((n) => n._id !== id));
      Swal.fire("Deleted", "News item removed", "success");
    } catch (error) {
      Swal.fire("Error", error?.response?.data?.message || "Failed to delete news", "error");
      console.error(error);
    }
  };

  if (loading) return <div>Loading news...</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-green-400 mb-4">News</h2>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-6 bg-gray-800 p-4 rounded-lg space-y-2"
      >
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
          className="p-2 w-full rounded bg-gray-700 text-gray-100"
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="p-2 w-full rounded bg-gray-700 text-gray-100"
          rows={4}
          required
        />
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="p-2 w-full rounded bg-gray-700 text-gray-100"
          required
        />
        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-gray-900 px-4 py-2 rounded font-semibold"
        >
          {editingNews ? "Update News" : "Add News"}
        </button>
      </form>

      {/* News Table */}
      <table className="w-full border border-gray-700 text-left">
        <thead>
          <tr>
            <th className="border p-2">Title</th>
            <th className="border p-2">Description</th>
            <th className="border p-2">Date</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {news.map((n) => (
            <tr key={n._id} className="hover:bg-gray-700">
              <td className="border p-2">{n.title}</td>
              <td className="border p-2">{n.description}</td>
              <td className="border p-2">{n.date.split("T")[0]}</td>
              <td className="border p-2 space-x-2">
                <button
                  onClick={() => handleEdit(n)}
                  className="bg-yellow-500 px-2 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(n._id)}
                  className="bg-red-600 px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Modal */}
      {editingNews && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold text-green-400 mb-4">Edit News</h2>
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-2 mb-2 rounded bg-gray-800 text-gray-100"
              required
            />
            <textarea
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 mb-2 rounded bg-gray-800 text-gray-100"
              rows={4}
              required
            />
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full p-2 mb-4 rounded bg-gray-800 text-gray-100"
              required
            />
            <div className="flex justify-end gap-2">
              <button
                className="bg-green-500 px-4 py-2 rounded"
                onClick={handleSubmit}
              >
                Save
              </button>
              <button
                className="bg-gray-700 px-4 py-2 rounded"
                onClick={() => setEditingNews(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


