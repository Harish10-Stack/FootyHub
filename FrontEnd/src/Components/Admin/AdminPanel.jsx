import React, { useState, useEffect } from "react";
import api from "../../utils/api.js";
import AdminSidebar from "./AdminSidebar.jsx";
import AdminHeader from "./AdminHeader.jsx";
import AdminDashBoard from "./AdminDashBoard.jsx";
import AdminProducts from "./AdminProducts.jsx";
import AdminOrders from "./AdminOrders.jsx";
import AdminUsers from "./AdminUsers.jsx";
import AdminPoll from "./AdminPoll.jsx";
import "./AdminStyles.css";
import SendNotification from "../Notifications/SendNotification.jsx";

// icons
import {
  User,
  Box,
  ShoppingCart,
  BarChart2,
  Bell,
} from "lucide-react";

const TABS = [
  { key: "dashboard", label: "Dashboard", icon: <BarChart2 size={18} /> },
  { key: "products", label: "Products", icon: <Box size={18} /> },
  { key: "orders", label: "Orders", icon: <ShoppingCart size={18} /> },
  { key: "users", label: "Users", icon: <User size={18} /> },
  { key: "poll", label: "Poll", icon: <BarChart2 size={18} /> },
  { key: "notifications", label: "Notifications", icon: <Bell size={18} /> },
];

export default function AdminPanel() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen flex bg-[#06080a] text-gray-200">
      <AdminSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabs={TABS}
      />

      <div className="flex-1 flex flex-col">
        <AdminHeader
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          title={TABS.find((t) => t.key === activeTab)?.label || "Admin"}
        />

        <main className="p-6 grow overflow-auto">
          {activeTab === "dashboard" && <AdminDashBoard />}
          {activeTab === "products" && <AdminProducts />}
          {activeTab === "orders" && <AdminOrders />}
          {activeTab === "users" && <AdminUsers />}
          {activeTab === "poll" && <AdminPoll />}
          {/* Notifications tab */}
          {activeTab === "notifications" && <SendNotification />}
        </main>
      </div>
    </div>
  );
}
