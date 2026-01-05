import { useState, useEffect } from "react";
import axios from "../Notifications/axiosInstance";
import Swal from "sweetalert2";
import { Send, Bell, PlusCircle } from "lucide-react";

const AdminNotifications = () => {
  const [defaultNotifications, setDefaultNotifications] = useState([]);
  const [storedNotifications, setStoredNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [loadingDefaults, setLoadingDefaults] = useState(true);
  const [loadingStored, setLoadingStored] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [sending, setSending] = useState(null);
  const [activeTab, setActiveTab] = useState("default"); // "default" or "stored"

  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    category: "",
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchDefaultNotifications();
    fetchStoredNotifications();
    fetchUsers();
  }, []);

  const fetchDefaultNotifications = async () => {
    setLoadingDefaults(true);
    try {
      const { data } = await axios.get("/api/notifications/defaults");
      setDefaultNotifications(data);
    } catch (error) {
      console.error("Error fetching default notifications:", error);
      Swal.fire("Error", "Failed to load default notifications", "error");
    } finally {
      setLoadingDefaults(false);
    }
  };

  const fetchStoredNotifications = async () => {
    setLoadingStored(true);
    try {
      const { data } = await axios.get("/api/notifications/stored");
      setStoredNotifications(data);
    } catch (error) {
      console.error("Error fetching stored notifications:", error);
      Swal.fire("Error", "Failed to load stored notifications", "error");
    } finally {
      setLoadingStored(false);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data } = await axios.get("/api/users");
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      Swal.fire("Error", "Failed to load users", "error");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleUserSelectChange = (e) => {
    const options = e.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setSelectedUserIds(selected);
  };

  const sendDefaultNotification = async (index) => {
    setSending(`default-${index}`);
    try {
      const { data } = await axios.post(
        `/api/notifications/send/${index}`,
        selectedUserIds.length > 0 ? { userIds: selectedUserIds } : {}
      );
      Swal.fire("Success", data.message, "success");
      setSelectedUserIds([]); // Reset selection after sending
    } catch (error) {
      console.error("Error sending default notification:", error);
      Swal.fire("Error", "Failed to send notification", "error");
    } finally {
      setSending(null);
    }
  };

  const sendStoredNotification = async (id) => {
    setSending(`stored-${id}`);
    try {
      const { data } = await axios.post(
        `/api/notifications/send/stored/${id}`,
        selectedUserIds.length > 0 ? { userIds: selectedUserIds } : {}
      );
      Swal.fire("Success", data.message, "success");
      setSelectedUserIds([]); // Reset selection after sending
    } catch (error) {
      console.error("Error sending stored notification:", error);
      Swal.fire("Error", "Failed to send stored notification", "error");
    } finally {
      setSending(null);
    }
  };

  const createStoredNotification = async () => {
    const { title, message, category } = newNotification;

    if (!title || !message) {
      Swal.fire("Error", "Title and message are required", "error");
      return;
    }

    setCreating(true);
    try {
      const { data } = await axios.post("/api/notifications", {
        title,
        message,
        category,
      });
      Swal.fire("Success", "Notification created", "success");
      setNewNotification({ title: "", message: "", category: "" });
      fetchStoredNotifications();
      setActiveTab("stored");
    } catch (error) {
      console.error("Error creating notification:", error);
      Swal.fire("Error", "Failed to create notification", "error");
    } finally {
      setCreating(false);
    }
  };

  const getCategoryStyles = (category) => {
    switch (category) {
      case "product":
        return {
          border: "border-emerald-500",
          bg: "bg-emerald-50",
          iconBg: "bg-emerald-500",
          text: "text-emerald-700",
          button: "bg-emerald-600 hover:bg-emerald-700",
        };
      case "order":
        return {
          border: "border-cyan-500",
          bg: "bg-cyan-50",
          iconBg: "bg-cyan-500",
          text: "text-cyan-700",
          button: "bg-cyan-600 hover:bg-cyan-700",
        };
      case "news":
        return {
          border: "border-violet-500",
          bg: "bg-violet-50",
          iconBg: "bg-violet-500",
          text: "text-violet-700",
          button: "bg-violet-600 hover:bg-violet-700",
        };
      case "fixture":
        return {
          border: "border-orange-500",
          bg: "bg-orange-50",
          iconBg: "bg-orange-500",
          text: "text-orange-700",
          button: "bg-orange-600 hover:bg-orange-700",
        };
      default:
        return {
          border: "border-slate-500",
          bg: "bg-slate-50",
          iconBg: "bg-slate-500",
          text: "text-slate-700",
          button: "bg-slate-600 hover:bg-slate-700",
        };
    }
  };

  if (loadingDefaults || loadingStored || loadingUsers) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#0b1114] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Bell className="h-8 w-8 text-blue-400" />
          <h1 className="text-3xl font-bold text-white">Admin Notifications</h1>
        </div>

        {/* User selection multi-select */}
        <div className="mb-6 max-w-md">
          <label htmlFor="users-select" className="block mb-2 text-white font-semibold">
            Select Target Users (optional)
          </label>
          <select
            id="users-select"
            multiple
            className="w-full h-32 p-2 rounded bg-gray-800 text-white"
            value={selectedUserIds}
            onChange={handleUserSelectChange}
          >
            {users.map(user => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          <p className="text-gray-400 mt-1 text-sm">If no users selected, notification will be sent to all users.</p>
        </div>

        <div className="mb-6 flex gap-4">
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "default"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
            onClick={() => setActiveTab("default")}
          >
            Default Notifications
          </button>
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "stored"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
            onClick={() => setActiveTab("stored")}
          >
            Stored Notifications
          </button>
        </div>

        {activeTab === "default" && (
          <>
            <div className="mb-6">
              <p className="text-gray-300 text-lg">
                Send pre-written notifications to all users instantly. Each notification includes proper category styling and icons.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {defaultNotifications.length === 0 && (
                <div className="text-center py-12 col-span-full">
                  <Bell className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-400 mb-2">No Default Notifications</h3>
                  <p className="text-gray-500">Default notifications will appear here once configured.</p>
                </div>
              )}
              {defaultNotifications.map((notification, index) => {
                const styles = getCategoryStyles(notification.category);
                return (
                  <div
                    key={index}
                    className={`bg-[#1a1f23] border ${styles.border} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 ${styles.iconBg} rounded-full flex items-center justify-center text-white text-xl`}>
                        {notification.icon}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles.bg} ${styles.text} capitalize`}>
                        {notification.category}
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-3">
                      {notification.title}
                    </h3>

                    <p className="text-gray-300 mb-6 leading-relaxed">
                      {notification.message}
                    </p>

                    <button
                      onClick={() => sendDefaultNotification(index)}
                      disabled={sending === `default-${index}`}
                      className={`w-full ${styles.button} text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {sending === `default-${index}` ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Send to Users
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeTab === "stored" && (
          <>
            <div className="mb-6">
              <p className="text-gray-300 text-lg">
                Manage stored notifications. Create new, view existing, and send stored notifications manually.
              </p>
            </div>

      <div className="mb-6 max-w-md">
        <h2 className="text-white text-xl font-semibold mb-4 flex items-center gap-2">
          <PlusCircle />
          Create New Notification
        </h2>
        <label htmlFor="title-select" className="block text-gray-300 mb-1">Select Title</label>
        <select
          id="title-select"
          className="w-full mb-3 p-2 rounded bg-gray-800 text-white"
          value={newNotification.title}
          onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
          disabled={creating}
        >
          <option value="">--Select a Title--</option>
          {defaultNotifications.map((notif, i) => (
            <option key={i} value={notif.title}>{notif.title}</option>
          ))}
        </select>

        <label htmlFor="message-select" className="block text-gray-300 mb-1">Select Message</label>
        <select
          id="message-select"
          className="w-full mb-3 p-2 rounded bg-gray-800 text-white"
          value={newNotification.message}
          onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
          disabled={creating}
        >
          <option value="">--Select a Message--</option>
          {defaultNotifications.map((notif, i) => (
            <option key={i} value={notif.message}>{notif.message}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Category (optional)"
          className="w-full mb-4 p-2 rounded bg-gray-800 text-white"
          value={newNotification.category}
          onChange={(e) => setNewNotification({ ...newNotification, category: e.target.value })}
          disabled={creating}
        />
        <button
          onClick={createStoredNotification}
          disabled={creating}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded disabled:opacity-50"
        >
          {creating ? "Creating..." : "Create Notification"}
        </button>
      </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {storedNotifications.length === 0 && (
                <div className="text-center py-12 col-span-full">
                  <Bell className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-400 mb-2">No Stored Notifications</h3>
                  <p className="text-gray-500">Stored notifications created by admins will appear here.</p>
                </div>
              )}
              {storedNotifications.map((notification) => {
                const styles = getCategoryStyles(notification.category || "");
                return (
                  <div
                    key={notification._id}
                    className={`bg-[#1a1f23] border ${styles.border} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 ${styles.iconBg} rounded-full flex items-center justify-center text-white text-xl`}>
                        {/* Optionally display icon here if stored */}
                        <Bell />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles.bg} ${styles.text} capitalize`}>
                        {notification.category || "general"}
                      </span>
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-3">
                      {notification.title}
                    </h3>

                    <p className="text-gray-300 mb-6 leading-relaxed whitespace-pre-wrap">
                      {notification.message}
                    </p>

                    <button
                      onClick={() => sendStoredNotification(notification._id)}
                      disabled={sending === `stored-${notification._id}`}
                      className={`w-full ${styles.button} text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {sending === `stored-${notification._id}` ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Send to Users
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminNotifications;
