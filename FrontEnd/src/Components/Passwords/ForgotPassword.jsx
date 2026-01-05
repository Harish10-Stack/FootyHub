// src/Components/Login/ForgotPassword.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";

const API = "http://localhost:5000";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch(`${API}/api/users/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send email");

      setMessage({ text: data.message, type: "success" });
      setEmail("");
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#050B18] via-[#081425] to-[#0f2027] p-4">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-green-400 mb-6 text-center">
          Forgot Password
        </h2>
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              className="w-full p-2 rounded bg-transparent border border-gray-700 text-white focus:outline-none focus:border-green-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold transition disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
