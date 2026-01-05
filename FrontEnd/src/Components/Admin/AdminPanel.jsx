import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import AdminSidebar from "./AdminSidebar.jsx";
import AdminHeader from "./AdminHeader.jsx";
import "./AdminStyles.css";
import SendNotification from "../Notifications/SendNotification.jsx";

// icons
import {
  User,
  Box,
  ShoppingCart,
  BarChart2,
  Trash2,
  Plus,
  Bell,
  MessageSquare,
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
  const [loading, setLoading] = useState(false);

  // data
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
  });

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [poll, setPoll] = useState({ totalMessi: 0, totalRonaldo: 0 });

  // -------- FETCHERS --------

  const fetchStats = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/stats", {
        withCredentials: true,
      });
      setStats(res.data || {});
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      setProducts(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/orders/all", {
        withCredentials: true,
      });
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/users/admin/all", {
        withCredentials: true,
      });
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPoll = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/poll");
      setPoll(res.data || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === "products") fetchProducts();
    if (activeTab === "orders") fetchOrders();
    if (activeTab === "users") fetchUsers();
    if (activeTab === "poll") fetchPoll();
  }, [activeTab]);

  // -------- UI COMPONENTS --------

  const StatCard = ({ title, value }) => (
    <div className="bg-[#0f1720] border border-[#23303a] p-6 rounded-lg shadow-sm">
      <div className="text-sm text-gray-400">{title}</div>
      <div className="text-2xl font-semibold mt-2">{value}</div>
    </div>
  );

  const TableWrapper = ({ children }) => (
    <div className="bg-[#0b1114] border border-[#22282c] rounded-lg p-4 shadow-sm overflow-auto">
      {children}
    </div>
  );

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
          {/* ⭐⭐⭐ REVIEWS TAB ⭐⭐⭐ */}
          {activeTab === "reviews" && (
            <AdminSiteReviews
              reviews={reviews} // pass reviews state
              deleteReview={deleteReview} // pass delete handler
              loading={loading} // optional loading state
            />
          )}
          {/* Notifications tab */}
          {activeTab === "notifications" && <SendNotification />}
        </main>
      </div>
    </div>
  );
}
