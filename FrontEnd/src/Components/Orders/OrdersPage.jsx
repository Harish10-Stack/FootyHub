import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../Explore/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { ArrowLeft, Package, MapPin, CreditCard } from "lucide-react";

const OrdersHeader = ({ user }) => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white z-[1000] shadow-2xl px-4 py-3 md:p-4 flex items-center justify-between border-b border-gray-700">
      <div
        className="flex items-center cursor-pointer hover:scale-105 transition-transform duration-200"
        onClick={() => navigate("/")}
      >
        <span className="text-green-500 text-3xl font-extrabold">Footy</span>
        <span className="text-white text-3xl font-extrabold ml-1">Hub</span>
        <span className="ml-1 text-3xl">⚽</span>
      </div>

      <div className="text-center hidden md:block">
        <span className="text-green-400 font-extrabold text-xl md:text-2xl">
          ⚽ Track all your orders in one place!
        </span>
      </div>

      <div
        className="text-green-400 font-semibold cursor-pointer hover:text-green-300 transition-colors duration-200"
        onClick={() => {
          Swal.fire({
            icon: "info",
            title: "Profile Info",
            text: "Go to Home to make profile changes",
          });
        }}
      >
        {user.name}
      </div>
    </header>
  );
};

const OrdersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const res = await axios.get(
          "https://footyhub-backend.onrender.com/api/orders/my-orders",
          { withCredentials: true }
        );
        setOrders(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch orders");
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const formatCurrency = (amount) =>
    "₹" + Math.round(amount).toLocaleString("en-IN");

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white pt-24">
        Loading your orders...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-500 pt-24">
        {error}
      </div>
    );

  if (!orders.length)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-4 pt-24">
        <h2 className="text-3xl font-bold mb-4">You have no orders yet!</h2>
        <button
          onClick={() => navigate("/shop")}
          className="bg-green-500 text-black px-6 py-3 rounded-lg hover:bg-green-600 transition font-semibold"
        >
          Shop Now
        </button>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white pt-32 px-4 md:px-20 pb-10">
      <OrdersHeader user={user} />

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 bg-gray-800/50 backdrop-blur-sm text-white px-6 py-3 rounded-full shadow-lg hover:bg-gray-700/50 transition-all duration-200 flex items-center gap-2 hover:scale-105"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="flex items-center gap-3 mb-8">
        <Package className="w-8 h-8 text-green-500" />
        <h1 className="text-3xl md:text-4xl font-bold text-green-500">
          My Orders
        </h1>
      </div>

      <div className="flex flex-col gap-10">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300"
          >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6 p-4 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-xl">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-green-400 flex items-center gap-2">
                  <Package className="w-6 h-6" />
                  Order #{order._id.slice(-6).toUpperCase()}
                </h2>
                <p className="text-gray-300 text-sm mt-1">
                  Placed on {new Date(order.createdAt).toLocaleDateString()} at{" "}
                  {new Date(order.createdAt).toLocaleTimeString()}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-4 py-2 text-sm rounded-full font-semibold shadow-lg ${
                    order.isPaid
                      ? "bg-green-500 text-black"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {order.isPaid ? "✓ Paid" : "⏳ Pending"}
                </span>
              </div>
            </div>

            {/* ITEMS */}
            <div className="flex flex-col gap-4">
              {order.orderItems.map((item) => {
                if (!item.product) return null;
                return (
                  <div
                    key={item.product._id}
                    className="flex bg-gray-700/50 p-6 rounded-xl gap-6 cursor-pointer hover:bg-gray-600/50 transition-all duration-200 hover:scale-[1.02] shadow-md hover:shadow-lg"
                    onClick={() => navigate(`/product/${item.product._id}`)}
                  >
                    <img
                      src={`http://localhost:5000/uploads/${item.product.img.replace(/^\/uploads\//, '')}`}
                      alt={item.product.name}
                      className="w-full max-w-24 h-auto object-cover rounded-xl shadow-lg"
                    />

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-green-400 hover:text-green-300 transition-colors">
                        {item.product.name}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 mt-2">
                        <span className="text-gray-300 text-sm bg-gray-600/50 px-3 py-1 rounded-full">
                          Qty: {item.qty}
                        </span>
                        <span className="text-gray-300 text-sm bg-gray-600/50 px-3 py-1 rounded-full">
                          Price: {formatCurrency(item.product.price)}
                        </span>
                      </div>

                      <p className="text-gray-200 font-bold text-lg mt-2">
                        Total: {formatCurrency(item.product.price * item.qty)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DELIVERY ADDRESS */}
            {order.deliveryAddress && (
              <div className="mt-6 bg-gray-900 p-4 rounded-lg border border-gray-700">
                <h3 className="font-bold text-green-400 mb-2">
                  Delivery Address
                </h3>

                <p>{order.deliveryAddress.address}</p>
                <p>
                  {order.deliveryAddress.city}, {order.deliveryAddress.state}
                </p>
                <p>
                  {order.deliveryAddress.postalCode},{" "}
                  {order.deliveryAddress.country}
                </p>
              </div>
            )}

            {/* TOTAL */}
            <div className="flex justify-end mt-8">
              <div className="bg-gradient-to-r from-green-600/20 to-green-500/20 backdrop-blur-sm px-8 py-4 rounded-2xl border border-green-500/30 shadow-lg">
                <p className="text-white font-bold text-xl flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-green-400" />
                  Order Total:{" "}
                  <span className="text-green-400 text-2xl font-extrabold">
                    {formatCurrency(order.totalPrice)}
                  </span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
