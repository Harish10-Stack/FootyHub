import React, { useEffect, useState } from "react";
import axios from "axios";
import api from "../../utils/api.js";
import Swal from "sweetalert2";
import { Trash2 } from "lucide-react";
import { blockUser, unblockUser } from "../../services/userService";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users/admin/all");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const deleteUser = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: "Delete user?",
      text: "This will permanently remove the user.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });
    if (!isConfirmed) return;

    try {
      await api.delete(`/users/admin/delete/${id}`);
      Swal.fire("Deleted", "User removed", "success");
      fetchUsers();
    } catch (err) {
      Swal.fire("Error", err?.response?.data?.message || "Could not delete user", "error");
    }
  };

  const handleBlockUser = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: "Block user?",
      text: "The user will not be able to log in.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Block",
    });
    if (!isConfirmed) return;

    try {
      await blockUser(id);
      Swal.fire("Blocked", "User has been blocked", "success");
      fetchUsers();
    } catch (err) {
      Swal.fire("Error", err?.response?.data?.message || "Could not block user", "error");
    }
  };

  const handleUnblockUser = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: "Unblock user?",
      text: "The user will be able to log in again.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Unblock",
    });
    if (!isConfirmed) return;

    try {
      await unblockUser(id);
      Swal.fire("Unblocked", "User has been unblocked", "success");
      fetchUsers();
    } catch (err) {
      Swal.fire("Error", err?.response?.data?.message || "Could not unblock user", "error");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Users</h1>
      <div className="bg-[#0b1114] border border-[#22282c] rounded-lg p-4 shadow-sm overflow-auto">
        <table className="w-full text-left">
          <thead className="text-xs text-gray-400">
            <tr>
              <th className="py-2 px-2">Avatar</th>
              <th className="py-2 px-2">Name</th>
              <th className="py-2 px-2">Email</th>
              <th className="py-2 px-2">Status</th>
              <th className="py-2 px-2">Admin</th>
              <th className="py-2 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} className="border-t border-[#11181b]">
                <td className="py-3 px-2">
                  <img
                    src={u.avatar || "/uploads/avatars/default-avatar.png"}
                    alt={`${u.name} avatar`}
                    className="w-8 h-8 rounded-full object-cover border border-[#1b2226]"
                  />
                </td>
                <td className="py-3 px-2">{u.name}</td>
                <td className="py-3 px-2">{u.email}</td>
                <td className="py-3 px-2">
                  <span className={`px-2 py-1 rounded text-xs ${u.status === "active" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
                    {u.status}
                  </span>
                </td>
                <td className="py-3 px-2">{u.isAdmin ? "Yes" : "No"}</td>
                <td className="py-3 px-2">
                  <div className="flex gap-2">
                    {u.status === "active" ? (
                      <button
                        onClick={() => handleBlockUser(u._id)}
                        className="px-2 py-1 rounded bg-orange-600 hover:bg-orange-700 text-white text-xs"
                      >
                        Block
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnblockUser(u._id)}
                        className="px-2 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-xs"
                      >
                        Unblock
                      </button>
                    )}
                    <button
                      onClick={() => Swal.fire("Edit user", "Implement edit UI.", "info")}
                      className="px-2 py-1 rounded border border-[#23303a] hover:bg-[#0f1720] text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteUser(u._id)}
                      className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan="6" className="text-gray-500 py-3 px-2">No users</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
