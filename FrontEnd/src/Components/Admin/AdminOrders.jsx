import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/orders/all", { withCredentials: true });
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Orders</h1>
      <div className="bg-[#0b1114] border border-[#22282c] rounded-lg p-4 shadow-sm overflow-auto">
        <table className="w-full text-left">
          <thead className="text-xs text-gray-400">
            <tr>
              <th className="py-2 px-2">Order ID</th>
              <th className="py-2 px-2">User</th>
              <th className="py-2 px-2">Items</th>
              <th className="py-2 px-2">Total</th>
              <th className="py-2 px-2">Paid</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o._id} className="border-t border-[#11181b]">
                <td className="py-3 px-2">{o._id.slice(-8)}</td>
                <td className="py-3 px-2">{o.user?.name || "—"}</td>
                <td className="py-3 px-2">{o.orderItems?.length || 0}</td>
                <td className="py-3 px-2">₹{Number(o.totalPrice).toLocaleString()}</td>
                <td className="py-3 px-2">{o.isPaid ? "Yes" : "No"}</td>
              </tr>
            ))}
            {orders.length === 0 && <tr><td colSpan="5" className="text-gray-500 py-3 px-2">No orders</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
