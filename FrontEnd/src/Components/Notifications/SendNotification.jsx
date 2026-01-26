import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import api from "../../utils/api";

export default function SendNotification() {
  const [users, setUsers] = useState([]);
  const [defaultNotifications, setDefaultNotifications] = useState([]);
  const [selectedDefault, setSelectedDefault] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  // Fetch all users + default notifications
  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await api.get("/users/admin/all");
        const defaultsRes = await api.get("/notifications/defaults");

        setUsers(usersRes.data);
        setDefaultNotifications(defaultsRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  // Autofill inputs when admin selects a saved default
  const handleDefaultSelect = (value) => {
    if (value === "") {
      setSelectedDefault("");
      setTitle("");
      setMessage("");
      return;
    }

    const index = Number(value);
    setSelectedDefault(index);
    setTitle(defaultNotifications[index].title);
    setMessage(defaultNotifications[index].message);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !message) {
      return Swal.fire("Error", "Title and message are required", "error");
    }

    try {
      // If admin selected a default template instead of typing
      if (selectedDefault !== "") {
        await api.post(`/notifications/send/${selectedDefault}`, { userIds: selectedUser ? [selectedUser] : [] });

        Swal.fire("Success", "Default Notification Sent", "success");
      } else {
        // Send custom message
        await api.post("/notifications", { title, message, userId: selectedUser || null });

        Swal.fire("Success", "Notification Sent", "success");
      }

      setTitle("");
      setMessage("");
      setSelectedUser("");
      setSelectedDefault("");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err?.response?.data?.message || "Failed to send notification", "error");
    }
  };

  return (
    <div className="p-6 bg-[#0b1114] rounded-lg border border-[#22282c]">
      <h1 className="text-xl font-semibold mb-4">Send Notification</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* Default Notification Dropdown */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Select Default Template (Optional)</label>
          <select
            className="w-full p-2 rounded border border-gray-700 bg-[#0f1720] text-gray-200"
            value={selectedDefault}
            onChange={(e) => handleDefaultSelect(e.target.value)}
          >
            <option value="">None (Custom Message)</option>
            {defaultNotifications.map((n, i) => (
              <option key={i} value={i}>
                📌 {n.title}
              </option>
            ))}
          </select>
        </div>

        {/* User Selection */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">User (optional)</label>
          <select
            className="w-full p-2 rounded border border-gray-700 bg-[#0f1720] text-gray-200"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="">All Users</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={selectedDefault !== ""}
            className="w-full p-2 rounded border border-gray-700 bg-[#0f1720] text-gray-200 disabled:opacity-60"
            required
          />

        </div>

        {/* Message */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={selectedDefault !== ""}
            className="w-full p-2 rounded border border-gray-700 bg-[#0f1720] text-gray-200 disabled:opacity-60"
            required
          />

        </div>

        <button
          type="submit"
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Send Notification
        </button>
      </form>
    </div>
  );
}



