import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../Explore/AuthContext.jsx";
import { validatePassword } from "../../utils/passwordValidator.js";

const API = "http://localhost:5000";

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const [editField, setEditField] = useState(null);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  const [stagedName, setStagedName] = useState(null);
  const [stagedEmail, setStagedEmail] = useState(null);

  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [passwordErrors, setPasswordErrors] = useState([]);

  const [avatarPreview, setAvatarPreview] = useState(
    user?.avatar || "/uploads/avatars/default-avatar.png"
  );
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarChanged, setAvatarChanged] = useState(false);
  const [removeAvatar, setRemoveAvatar] = useState(false);

  // Load profile from backend
  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API}/api/users/profile`, {
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load profile");

      const u = data.user || data;

      setName(u.name);
      setEmail(u.email);
      setAvatarPreview(u.avatar || "/default-avatar.png");

      updateUser(u);
    } catch (err) {
      if (err.message.includes("Not authorized")) {
        logout();
        navigate("/");
      }
      setMessage({ text: err.message, type: "error" });
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAvatarSelect = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatarFile(f);
    setAvatarPreview(URL.createObjectURL(f));
    setAvatarChanged(true);
    setMessage({
      text: "Avatar selected — enter current password to confirm.",
      type: "info",
    });
  };

  const handleSaveEdit = (field) => {
    setMessage({ text: "", type: "" });

    if (field === "name") {
      if (!name.trim())
        return setMessage({ text: "Name cannot be empty", type: "error" });
      if (name.trim() === user?.name)
        return setMessage({ text: "No changes detected", type: "info" });
      setStagedName(name.trim());
    }

    if (field === "email") {
      if (!email.trim())
        return setMessage({ text: "Email cannot be empty", type: "error" });
      if (email.trim() === user?.email)
        return setMessage({ text: "No changes detected", type: "info" });
      setStagedEmail(email.trim());
    }

    setEditField(null);
    setConfirmPassword("");
    setMessage({
      text: "Staged change — enter current password to confirm.",
      type: "info",
    });
  };

  const handleConfirmProfileUpdate = async () => {
    if (!confirmPassword)
      return setMessage({ text: "Enter your password", type: "error" });

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      let res;

      if (avatarFile) {
        const fd = new FormData();
        if (stagedName) fd.append("name", stagedName);
        if (stagedEmail) fd.append("email", stagedEmail);
        fd.append("currentPassword", confirmPassword);
        fd.append("avatar", avatarFile);

        res = await fetch(`${API}/api/users/profile`, {
          method: "PUT",
          credentials: "include",
          body: fd,
        });
      } else {
        const body = { currentPassword: confirmPassword };
        if (stagedName) body.name = stagedName;
        if (stagedEmail) body.email = stagedEmail;
        if (removeAvatar) body.removeAvatar = true;

        res = await fetch(`${API}/api/users/profile`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      updateUser(data.user || data);
      setMessage({ text: "Profile updated!", type: "success" });

      setStagedName(null);
      setStagedEmail(null);
      setConfirmPassword("");
      setAvatarFile(null);
      setRemoveAvatar(false);
      setAvatarChanged(false);

      fetchProfile();
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleNewPasswordChange = (e) => {
    const newPasswordValue = e.target.value;
    setNewPassword(newPasswordValue);

    // Validate password in real-time
    const validation = validatePassword(newPasswordValue);
    setPasswordErrors(validation.errors);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !newPasswordConfirm)
      return setMessage({ text: "Fill all password fields", type: "error" });

    if (newPassword !== newPasswordConfirm)
      return setMessage({ text: "New passwords do not match", type: "error" });

    setLoading(true);

    try {
      const res = await fetch(`${API}/api/users/update-password`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage({ text: "Password updated!", type: "success" });
      setPasswordOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
      setPasswordErrors([]);
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-white pb-20">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-md bg-black/40 sticky top-0 z-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between relative">
          <button
            onClick={() => navigate("/")}
            className="absolute left-8 top-1/2 -translate-y-1/2 text-green-400 hover:text-emerald-300 font-semibold text-lg transition cursor-pointer"
          >
            ← Back to Home
          </button>
          <div className="w-full flex justify-center">
            <h1 className="text-green-400 font-extrabold text-3xl tracking-widest drop-shadow-lg text-center">
              ⚽ Every Minute Counts
            </h1>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-6 mt-14">
        <motion.section
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-xl border border-gray-800 p-10 rounded-3xl shadow-2xl space-y-10"
        >
          {/* Avatar + Basic */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-8">
            <div className="relative group">
              <img
                src={avatarPreview}
                alt="avatar"
                className="w-36 h-36 rounded-full object-cover border-4 border-green-500 shadow-2xl transition-transform group-hover:scale-105"
              />
              <div className="absolute bottom-0 right-0 flex gap-1">
                <label className="bg-gradient-to-r from-green-500 to-emerald-500 text-black px-2 py-1 rounded-full text-xs font-semibold cursor-pointer shadow-md hover:opacity-90 transition">
                  Change
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarSelect}
                    className="hidden"
                  />
                </label>
                {user?.avatar && (
                  <button
                    onClick={() => {
                      setRemoveAvatar(true);
                      setAvatarPreview("/uploads/avatars/default-avatar.png");
                      setAvatarChanged(true);
                      setMessage({
                        text: "Avatar will be removed — enter current password to confirm.",
                        type: "info",
                      });
                    }}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-full text-xs font-semibold cursor-pointer shadow-md hover:opacity-90 transition"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div className="text-center sm:text-left">
              <h1 className="text-4xl font-bold text-white">{name || "—"}</h1>
              <p className="text-gray-400 text-lg mt-1">{email || "—"}</p>
            </div>
          </div>

          {/* Editable fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <label className="text-gray-400 text-sm uppercase tracking-widest">
                Name
              </label>
              <div className="flex items-center gap-3 mt-2">
                {editField === "name" ? (
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="flex-1 bg-transparent border-b border-gray-700 p-2 text-white focus:outline-none focus:border-green-400"
                  />
                ) : (
                  <div className="flex-1 text-white text-lg">{name}</div>
                )}
                <button
                  onClick={() =>
                    editField === "name"
                      ? handleSaveEdit("name")
                      : setEditField("name")
                  }
                  className="text-green-400 hover:text-emerald-300 font-medium transition cursor-pointer"
                >
                  {editField === "name" ? "Save" : "Edit"}
                </button>
              </div>
            </div>

            <div>
              <label className="text-gray-400 text-sm uppercase tracking-widest">
                Email
              </label>
              <div className="flex items-center gap-3 mt-2">
                {editField === "email" ? (
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-transparent border-b border-gray-700 p-2 text-white focus:outline-none focus:border-green-400"
                  />
                ) : (
                  <div className="flex-1 text-white text-lg">{email}</div>
                )}
                <button
                  onClick={() =>
                    editField === "email"
                      ? handleSaveEdit("email")
                      : setEditField("email")
                  }
                  className="text-green-400 hover:text-emerald-300 font-medium transition cursor-pointer"
                >
                  {editField === "email" ? "Save" : "Edit"}
                </button>
              </div>
            </div>
          </div>

          {/* Confirm staged changes */}
          {(stagedName || stagedEmail || avatarChanged) && (
            <div className="pt-6 border-t border-white/10">
              <label className="text-gray-400 text-sm uppercase tracking-widest">
                Enter current password to confirm changes
              </label>
              <div className="flex flex-col sm:flex-row gap-3 mt-3">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Current password"
                  className="flex-1 bg-transparent border-b border-gray-700 p-2 text-white focus:outline-none focus:border-green-400"
                />
                <button
                  onClick={handleConfirmProfileUpdate}
                  disabled={loading}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 text-black font-semibold px-6 py-2 rounded-lg transition-all shadow-lg disabled:opacity-60"
                >
                  {loading ? "Saving..." : "Confirm"}
                </button>
              </div>
            </div>
          )}

          {/* Change password */}
          <div className="pt-6 border-t border-white/10">
            {!passwordOpen ? (
              <button
                onClick={() => setPasswordOpen(true)}
                className="text-green-400 hover:text-emerald-300 font-medium transition cursor-pointer"
              >
                Change Password
              </button>
            ) : (
              <div className="space-y-3 mt-3">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current password"
                  className="w-full bg-transparent border-b border-gray-700 p-2 text-white focus:outline-none focus:border-green-400"
                />
                <div className="space-y-2">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={handleNewPasswordChange}
                    placeholder="New password"
                    className={`w-full bg-transparent border-b p-2 text-white focus:outline-none focus:border-green-400 ${
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
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full bg-transparent border-b border-gray-700 p-2 text-white focus:outline-none focus:border-green-400"
                />
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleChangePassword}
                    disabled={loading}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-black font-semibold px-6 py-2 rounded-lg shadow-lg hover:opacity-90 transition disabled:opacity-60"
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                  <button
                    onClick={() => {
                      setPasswordOpen(false);
                      setCurrentPassword("");
                      setNewPassword("");
                      setNewPasswordConfirm("");
                    }}
                    className="text-gray-400 hover:text-white transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Message */}
          {message.text && (
            <div
              className={`mt-6 p-4 rounded-md border text-center font-medium ${
                message.type === "error"
                  ? "bg-red-900/50 border-red-700 text-red-300"
                  : message.type === "success"
                  ? "bg-green-900/40 border-green-600 text-green-300"
                  : "bg-gray-800/60 border-gray-700 text-gray-200"
              }`}
            >
              {message.text}
            </div>
          )}
        </motion.section>
      </main>
    </div>
  );
};

export default Profile;
