import React, { useState, useEffect } from "react";
import { useAuth } from "../Explore/AuthContext.jsx";
import api from "../../utils/api.js";

const DeleteAccountModal = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDelete = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      await api.delete("/users/delete", { data: { currentPassword: password } });
      setMessage({ text: "Account deleted successfully!", type: "success" });
      setPassword("");
      await logout();
      onClose();
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || err.message || "Something went wrong",
        type: "error",
      });
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 transition-opacity duration-300"
      role="dialog"
      aria-modal="true"
      onClick={onClose} // click on backdrop closes modal
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      {/* Modal Content */}
      <div
        className="relative z-50 bg-white/10 backdrop-blur-xl border border-white/20 p-5 sm:p-8 rounded-3xl shadow-2xl w-full max-w-md transition-transform duration-300 transform scale-100"
        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
      >
        <h2 className="text-2xl font-bold text-red-400 mb-6 text-center">
          Delete Account
        </h2>

        <p className="text-gray-300 mb-4 text-center">
          This action cannot be undone. Please enter your password to confirm.
        </p>

        {message.text && (
          <div
            className={`mb-4 p-3 rounded-md border ${
              message.type === "error"
                ? "bg-red-900/50 border-red-700 text-red-200"
                : "bg-green-900/40 border-green-600 text-green-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleDelete} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            className="w-full p-3 rounded bg-transparent border border-gray-700 text-white focus:outline-none focus:border-red-400"
          />

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            aria-disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-60"
          >
            {loading ? "Deleting..." : "Delete Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            Cancel
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default DeleteAccountModal;

