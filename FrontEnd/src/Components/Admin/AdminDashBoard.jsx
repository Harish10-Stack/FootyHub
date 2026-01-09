import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalProducts: 0, totalOrders: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const statsRes = await axios.get("https://footyhub-backend-cqir.onrender.com/api/admin/stats", { withCredentials: true });
        setStats(statsRes.data);

        const ordersRes = await axios.get("https://footyhub-backend-cqir.onrender.com/api/orders/all", { withCredentials: true });
        setRecentOrders(ordersRes.data.slice(0, 6));
      } catch (err) {
        console.error(err);
        setError("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const StatCard = ({ title, value }) => (
    <div className="bg-[#0f1720] border border-[#23303a] p-6 rounded-lg shadow-sm">
      <div className="text-sm text-gray-400">{title}</div>
      <div className="text-2xl font-semibold mt-2">{value}</div>
    </div>
  );

  if (loading) return <p className="text-gray-400 p-6">Loading dashboard...</p>;
  if (error) return <p className="text-red-500 p-6">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Users" value={stats.totalUsers} />
        <StatCard title="Total Products" value={stats.totalProducts} />
        <StatCard title="Total Orders" value={stats.totalOrders} />
      </div>

      <div className="bg-[#0b1114] border border-[#22282c] rounded-lg p-4 shadow-sm overflow-auto">
        <h2 className="text-sm text-gray-300 mb-3">Recent Orders</h2>
        <table className="w-full text-left">
          <thead className="text-xs text-gray-400">
            <tr>
              <th className="py-2 px-2">Order ID</th>
              <th className="py-2 px-2">User</th>
              <th className="py-2 px-2">Total</th>
              <th className="py-2 px-2">Paid</th>
              <th className="py-2 px-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length > 0 ? (
              recentOrders.map(o => (
                <tr key={o._id} className="border-t border-[#11181b]">
                  <td className="py-3 px-2 text-sm">{o._id.slice(-6)}</td>
                  <td className="py-3 px-2 text-sm">{o.user?.name || "—"}</td>
                  <td className="py-3 px-2 text-sm">₹{Number(o.totalPrice).toLocaleString()}</td>
                  <td className="py-3 px-2 text-sm">{o.isPaid ? "Yes" : "No"}</td>
                  <td className="py-3 px-2 text-sm">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-3 px-2 text-gray-500" colSpan="5">No orders</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

