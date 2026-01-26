// src/Components/Cart and Checkout/ThankYou.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import { ShoppingBag, MapPin, CreditCard } from "lucide-react";

const ThankYou = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state?.order;
  const [countdown, setCountdown] = useState(8);

  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
    });

    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          navigate("/shop");
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white px-4">
        <ShoppingBag size={80} className="text-gray-600 mb-6" />
        <h2 className="text-3xl font-bold mb-4 text-red-500">Order not found</h2>
        <p className="text-gray-300 mb-6">
          We couldn’t find the details of your order.
        </p>
        <button
          onClick={() => navigate("/shop")}
          className="bg-green-500 px-6 py-3 rounded-lg font-bold hover:bg-green-600 transition"
        >
          Go to Shop
        </button>
      </div>
    );
  }

  const formatCurrency = (amount) =>
    "₹" + Math.round(amount).toLocaleString("en-IN");

  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 py-12 md:px-20">
      <div className="max-w-4xl mx-auto bg-gray-800 rounded-2xl shadow-2xl p-8">
        {/* Success Icon */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-28 h-28 bg-green-700 rounded-full flex items-center justify-center animate-scaleFadeIn">
            <svg
              className="w-16 h-16 text-green-300"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-green-300 mb-2 text-center">
          Payment Successful!
        </h1>

        <p className="text-sm text-green-400 mb-4 text-center">
          Order ID: <span className="font-mono">{order._id}</span>
        </p>

        {/* Delivery Address */}
        {order.deliveryAddress && (
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 mb-6">
            <h2 className="text-green-400 font-bold text-xl mb-2 flex items-center gap-2">
              <MapPin size={24} />
              Delivery Address
            </h2>
            <p className="text-white font-semibold">{order.deliveryAddress.fullName}</p>
            <p className="text-gray-300">
              {order.deliveryAddress.address}, {order.deliveryAddress.city},{" "}
              {order.deliveryAddress.state} - {order.deliveryAddress.postalCode}
            </p>
            <p className="text-gray-300">{order.deliveryAddress.country}</p>
            <p className="text-gray-300 font-semibold">
              Phone: {order.deliveryAddress.phone}
            </p>
          </div>
        )}

        {/* Ordered Items */}
        <div className="space-y-4 mb-6">
          {order.orderItems.map((item, index) => (
            <div
              key={`${item.product}-${index}`}
              className="flex gap-4 bg-gray-700 rounded-xl p-4 items-center"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1 flex flex-col justify-between">
                <h2 className="text-lg font-semibold text-green-400">{item.name}</h2>
                <p className="text-gray-300">
                  Qty: {item.qty} × {formatCurrency(item.price)}
                </p>
                <p className="text-white font-bold">
                  Total: {formatCurrency(item.price * item.qty)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Total */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-700 flex justify-between items-center mb-6">
          <h2 className="text-green-400 font-bold text-xl flex items-center gap-2">
            <CreditCard size={24} />
            Total Paid
          </h2>
          <p className="text-white font-bold text-xl">
            {formatCurrency(order.totalPrice)}
          </p>
        </div>

        {/* Redirect / Buttons */}
        <p className="text-green-400 text-center mb-6">
          Redirecting to shop in{" "}
          <span className="font-semibold">{countdown}</span> sec...
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate("/shop")}
            className="bg-green-500 px-6 py-3 rounded-lg font-bold hover:bg-green-600 transition"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => navigate("/orders")}
            className="bg-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition"
          >
            View Orders
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes scaleFadeIn {
            0% { opacity: 0; transform: scale(0.7); }
            100% { opacity: 1; transform: scale(1); }
          }
          .animate-scaleFadeIn {
            animation: scaleFadeIn 0.8s ease forwards;
          }
        `}
      </style>
    </div>
  );
};

export default ThankYou;






