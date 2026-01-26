import React, { useState } from "react";
import { useAuth } from "../Explore/AuthContext.jsx";
import { validatePassword } from "../../utils/passwordValidator.js";

const LoginModal = ({ isOpen, onClose, onSuccess }) => {
  const { login, register } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handlePasswordChange = (e) => {
    const newPasswordValue = e.target.value;
    setPassword(newPasswordValue);

    if (!isLogin) {
      // Validate password in real-time for registration
      const validation = validatePassword(newPasswordValue);
      setPasswordErrors(validation.errors);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      if (isLogin) {
        await login(email, password);
        setMessage({ text: "Login successful!", type: "success" });
        onSuccess && onSuccess();
        onClose();
      } else {
        if (password !== confirmPassword) {
          setMessage({ text: "Passwords do not match", type: "error" });
          setLoading(false);
          return;
        }

        await register(name, email, password);
        setMessage({ text: "Registration successful!", type: "success" });
        onSuccess && onSuccess();
        onClose();
      }
    } catch (err) {
      setMessage({
        text:
          err.response?.data?.message || err.message || "Something went wrong",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-5 sm:p-8 rounded-3xl shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-green-400 mb-6 text-center">
          {isLogin ? "Login" : "Register"}
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
          {!isLogin && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              required={!isLogin}
              className="w-full p-3 rounded bg-transparent border border-gray-700 text-white focus:outline-none focus:border-green-400"
            />
          )}

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full p-3 rounded bg-transparent border border-gray-700 text-white focus:outline-none focus:border-green-400"
          />

          <div className="space-y-2">
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Password"
              required
              className={`w-full p-3 rounded bg-transparent border text-white focus:outline-none focus:border-green-400 ${
                passwordErrors.length > 0 && !isLogin
                  ? "border-red-500"
                  : "border-gray-700"
              }`}
            />
            {passwordErrors.length > 0 && !isLogin && (
              <div className="text-red-400 text-sm space-y-1">
                {passwordErrors.map((error, index) => (
                  <div key={index}>• {error}</div>
                ))}
              </div>
            )}
          </div>

          {!isLogin && (
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              required={!isLogin}
              className="w-full p-3 rounded bg-transparent border border-gray-700 text-white focus:outline-none focus:border-green-400"
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-black font-semibold py-2 rounded-lg transition disabled:opacity-60"
          >
            {loading
              ? isLogin
                ? "Logging in..."
                : "Registering..."
              : isLogin
                ? "Login"
                : "Register"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-green-400 hover:text-emerald-300 transition"
          >
            {isLogin
              ? "Need an account? Register"
              : "Already have an account? Login"}
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

export default LoginModal;
