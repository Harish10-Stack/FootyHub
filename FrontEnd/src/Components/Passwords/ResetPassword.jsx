import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { validatePassword } from "../../utils/passwordValidator.js";

const API = "http://localhost:5000";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);

  const handlePasswordChange = (e) => {
    const newPasswordValue = e.target.value;
    setPassword(newPasswordValue);

    // Validate password in real-time
    const validation = validatePassword(newPasswordValue);
    setPasswordErrors(validation.errors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setMessage({ text: "Passwords do not match", type: "error" });
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch(`${API}/api/users/reset-password/${token}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reset password");

      setMessage({ text: data.message, type: "success" });
      setPassword("");
      setConfirmPassword("");
      setPasswordErrors([]);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#050B18] via-[#081425] to-[#0f2027] p-4">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-green-400 mb-6 text-center">
          Reset Password
        </h2>
        {message.text && (
          <div className={`mb-4 p-3 rounded-md border ${
            message.type === "error"
              ? "bg-red-900/50 border-red-700 text-red-200"
              : "bg-green-900/40 border-green-600 text-green-200"
          }`}>
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              required
              placeholder="New password"
              className={`w-full p-3 rounded bg-transparent border text-white focus:outline-none focus:border-green-400 ${
                passwordErrors.length > 0 ? 'border-red-500' : 'border-gray-700'
              }`}
            />
            {passwordErrors.length > 0 && (
              <div className="text-red-400 text-sm space-y-1">
                {passwordErrors.map((error, index) => (
                  <div key={index}>• {error}</div>
                ))}
              </div>
            )}
          </div>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Confirm new password"
            className="w-full p-3 rounded bg-transparent border border-gray-700 text-white focus:outline-none focus:border-green-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-black font-semibold py-2 rounded-lg transition disabled:opacity-60"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;

