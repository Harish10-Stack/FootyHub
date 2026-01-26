import { useEffect, useState } from "react";
import { CheckCircle, Trash2, Bell } from "lucide-react";
import api from "../../utils/api.js"; // ✅ Use the main backend

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get("/notifications/my");
      setNotifications(data);
    } catch (error) {
      console.log(error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put("/notifications/read/" + id);
      fetchNotifications();
    } catch (err) {
      console.log(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");
      fetchNotifications();
    } catch (err) {
      console.log(err);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await api.delete("/notifications/delete-all");
      setNotifications([]);
    } catch (err) {
      console.log(err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete("/notifications/delete/" + id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700/50 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <div className="flex items-center gap-3">
              <Bell className="text-white" size={32} />
              <h1 className="text-2xl md:text-3xl font-bold text-white">Notifications</h1>
            </div>
            <p className="text-blue-100 mt-2">Stay updated with the latest from FootyHub</p>
          </div>

          <div className="p-6">
            {notifications.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  <CheckCircle size={18} />
                  Mark All as Read
                </button>
                <button
                  onClick={clearAllNotifications}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  <Trash2 size={18} />
                  Clear All
                </button>
              </div>
            )}

            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="mx-auto text-gray-500 mb-4" size={64} />
                  <p className="text-gray-400 text-lg">No notifications yet.</p>
                  <p className="text-gray-500 text-sm mt-2">We'll notify you when there's something new!</p>
                </div>
              ) : (
                notifications.map((noti) => {
                  const getCategoryStyles = (category) => {
                    switch (category) {
                      case 'product':
                        return { border: 'border-green-500/50', bg: 'bg-gradient-to-r from-green-900/20 to-emerald-900/20', hoverBg: 'hover:from-green-900/30 hover:to-emerald-900/30', shadow: 'shadow-green-500/10', iconBg: 'bg-gradient-to-br from-green-600 to-emerald-600' };
                      case 'order':
                        return { border: 'border-blue-500/50', bg: 'bg-gradient-to-r from-blue-900/20 to-cyan-900/20', hoverBg: 'hover:from-blue-900/30 hover:to-cyan-900/30', shadow: 'shadow-blue-500/10', iconBg: 'bg-gradient-to-br from-blue-600 to-cyan-600' };
                      case 'news':
                        return { border: 'border-purple-500/50', bg: 'bg-gradient-to-r from-purple-900/20 to-violet-900/20', hoverBg: 'hover:from-purple-900/30 hover:to-violet-900/30', shadow: 'shadow-purple-500/10', iconBg: 'bg-gradient-to-br from-purple-600 to-violet-600' };
                      case 'fixture':
                        return { border: 'border-orange-500/50', bg: 'bg-gradient-to-r from-orange-900/20 to-red-900/20', hoverBg: 'hover:from-orange-900/30 hover:to-red-900/30', shadow: 'shadow-orange-500/10', iconBg: 'bg-gradient-to-br from-orange-600 to-red-600' };
                      default:
                        return { border: 'border-gray-500/50', bg: 'bg-gradient-to-r from-gray-900/20 to-slate-900/20', hoverBg: 'hover:from-gray-900/30 hover:to-slate-900/30', shadow: 'shadow-gray-500/10', iconBg: 'bg-gradient-to-br from-gray-600 to-slate-600' };
                    }
                  };

                  const styles = getCategoryStyles(noti.category);

                  return (
                    <div
                      key={noti._id}
                      className={`group relative p-4 md:p-5 rounded-xl border cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                        noti.read
                          ? "border-gray-700 bg-gray-800/50 hover:bg-gray-800/70"
                          : `${styles.border} ${styles.bg} ${styles.hoverBg} shadow-lg ${styles.shadow}`
                      }`}
                      onClick={() => markAsRead(noti._id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 md:w-12 md:h-12 ${styles.iconBg} rounded-full flex items-center justify-center text-xl md:text-2xl shadow-lg`}>
                            {noti.icon || "🔔"}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className={`text-base md:text-lg font-semibold mb-1 ${noti.read ? "text-gray-300" : "text-white"}`}>
                                {noti.title}
                              </h3>
                              <p className={`text-sm md:text-base leading-relaxed ${noti.read ? "text-gray-400" : "text-gray-200"}`}>
                                {noti.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-2">
                                {new Date(noti.createdAt).toLocaleString()}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 ml-4">
                              {!noti.read && (
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(noti._id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-400 transition-all duration-200 transform hover:scale-110"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {!noti.read && (
                        <div className={`absolute inset-0 border-2 ${styles.border.replace('/50', '/30')} rounded-xl pointer-events-none`}></div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
