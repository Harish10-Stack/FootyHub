import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../Explore/AuthContext.jsx";
import {
  ChevronsLeft,
  BarChart2,
  Box,
  ShoppingCart,
  User,
  Calendar,
  Newspaper,
  Bell
} from "lucide-react";

const TABS = [
  { key: "dashboard", label: "Dashboard", icon: <BarChart2 size={18} /> },
  { key: "products", label: "Products", icon: <Box size={18} /> },
  { key: "orders", label: "Orders", icon: <ShoppingCart size={18} /> },
  { key: "users", label: "Users", icon: <User size={18} /> },
  { key: "poll", label: "Poll", icon: <BarChart2 size={18} /> },
  { key: "fixtures", label: "Fixtures", icon: <Calendar size={18} /> },
  { key: "news", label: "News", icon: <Newspaper size={18} /> },
  { key: "notifications", label: "Notifications", icon: <Bell size={18} /> },
];

export default function AdminSidebar({ collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Determine active tab from URL
  const activeTab = location.pathname.split("/")[2] || "dashboard";

  return (
    <aside
      className={`flex-shrink-0 bg-[#06080a] border-r border-[#11181b] transition-all duration-200 ${
        collapsed ? "w-16 md:w-20" : "w-64"
      }`}
    >
      <div className="h-full flex flex-col">
        
        {/* Logo Section */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div
              className={`h-8 w-8 rounded flex items-center justify-center bg-[#0f1720] border border-[#1b2226] ${
                collapsed ? "mx-auto" : ""
              }`}
            >
              <span className="text-green-400 font-bold">FH</span>
            </div>
            {!collapsed && (
              <div className="text-sm font-semibold">FootyHub Admin</div>
            )}
          </div>

          {/* Collapse Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded hover:bg-[#0f1720]"
          >
            <ChevronsLeft
              size={16}
              className={`transform ${collapsed ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 px-1 py-2 space-y-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => navigate(`/admin/${t.key === "dashboard" ? "" : t.key}`)}
              className={`group flex items-center gap-3 w-full px-3 py-2 rounded text-sm hover:bg-[#0f1720] transition ${
                activeTab === t.key ? "bg-[#0f1720]" : ""
              }`}
            >
              <div className="text-gray-300">{t.icon}</div>
              {!collapsed && <span className="text-gray-200">{t.label}</span>}
            </button>
          ))}
        </nav>

        {/* User Info & Footer */}
        <div className="p-4 border-t border-[#11181b]">
          {/* User Avatar and Name */}
          <div className="flex items-center gap-3 mb-3">
            <img
              src={user?.avatar ? `${import.meta.env.VITE_API_URL}${user.avatar}` : `${import.meta.env.VITE_API_URL}/uploads/avatars/default-avatar.png`}
              alt="User Avatar"
              className={`w-8 h-8 rounded-full object-cover border border-[#1b2226] ${
                collapsed ? "mx-auto" : ""
              }`}
            />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">
                  {user?.name || "Admin"}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {user?.email || ""}
                </div>
              </div>
            )}
          </div>

          {/* Copyright */}
          {!collapsed && <div className="text-xs text-gray-500">© FootyHub</div>}
        </div>
      </div>
    </aside>
  );
}






