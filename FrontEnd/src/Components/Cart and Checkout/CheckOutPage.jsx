// src/Components/Cart and Checkout/CheckOutPage.jsx
import React, { useState, useEffect } from "react";
import { useCart } from "../Cart and Checkout/CartContext.jsx";
import { useNavigate } from "react-router-dom";
import CheckoutHeader from "../Headers/CheckOutHeader.jsx";
import api from "../../utils/api.js";
import { useAuth } from "../Explore/AuthContext.jsx";
import Swal from "sweetalert2";
import { ShoppingBag, ArrowLeft, MapPin, CreditCard } from "lucide-react";
import socket from "../../utils/socket.js";

const CheckoutPage = () => {
  const { cartItems, totalAmount, clearCart } = useCart();
  const { user, saveDeliveryAddress } = useAuth();
  const navigate = useNavigate();
  const [isPaying, setIsPaying] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState({
    fullName: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phone: "",
  });

  // 💡 Pre-fill delivery address from user profile
  useEffect(() => {
    if (user && user.deliveryAddress) {
      setDeliveryAddress(user.deliveryAddress);
    }
  }, [user]);

  if (!cartItems || cartItems.length === 0) {
    return (
      <>
        <CheckoutHeader />
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pt-24 px-4">
          <ShoppingBag size={80} className="text-gray-600 mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-300">
            Your cart is empty
          </h2>
          <button
            onClick={() => navigate("/shop")}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-300 text-white px-8 py-4 rounded-xl font-bold cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Go to Shop
          </button>
        </div>
      </>
    );
  }

  const discountRate = 0.05;
  const platformFee = 50;
  const shippingCost = totalAmount > 0 ? 199 : 0;
  const discountAmount = totalAmount * discountRate;
  const taxRate = 0.05;
  const taxAmount =
    (totalAmount - discountAmount + platformFee + shippingCost) * taxRate;
  const totalPayable =
    totalAmount - discountAmount + platformFee + shippingCost + taxAmount;

  const formatCurrency = (amount) =>
    "₹" + Math.round(amount).toLocaleString("en-IN");

  // handle address input change
  const handleAddressChange = (e) => {
    setDeliveryAddress({ ...deliveryAddress, [e.target.name]: e.target.value });
  };

  // 💳 MOCK PAYMENT + CREATE ORDER
  const handleMockPayment = async () => {
    // ✅ Validate delivery address
    if (!deliveryAddress || !deliveryAddress.address) {
      Swal.fire({
        icon: "warning",
        title: "Missing Delivery Address",
        text: "Please ensure your delivery address is filled.",
      });
      return;
    }

    // ✅ Validate cart
    if (!cartItems || cartItems.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Cart is empty",
        text: "Add products to cart before paying.",
      });
      return;
    }

    setIsPaying(true);

    try {
      // Save delivery address to user profile
      if (saveDeliveryAddress) await saveDeliveryAddress(deliveryAddress);

      // Prepare orderItems payload
      const orderItems = cartItems.map((item) => {
        if (!item.product?._id) {
          throw new Error(
            `Invalid product in cart: ${item.product?.name || "Unknown"}`
          );
        }

        const price =
          typeof item.product?.price === "number"
            ? item.product.price
            : parseFloat(
                String(item.product?.price || "0").replace(/[₹,]/g, "")
              ) || 0;

        return {
          product: item.product._id,
          name: item.product.name,
          qty: item.quantity || 1,
          price,
          image: item.product.img || "",
        };
      });

      // Create order payload
      const orderData = {
        orderItems,
        paymentMethod: "MOCK",
        totalPrice: Math.round(totalPayable),
        deliveryAddress,
      };

      // Debug: log payload before sending
      console.log("Creating order with payload:", orderData);

      // Send POST request to backend
      const res = await api.post("/orders", orderData);

      const createdOrder = res.data;

      // Success: clear cart and navigate
      clearCart();
      setIsPaying(false);
      navigate("/thankyou", { state: { order: createdOrder } });
    } catch (err) {
      setIsPaying(false);

      // Log full error for debugging
      console.error(
        "Order creation failed:",
        err.response?.data || err.message || err
      );

      Swal.fire({
        icon: "error",
        title: "Order Failed",
        text:
          err.response?.data?.message ||
          err.message ||
          "Failed to create order. Please try again.",
      });
    }
  };

  return (
    <>
      <CheckoutHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-200 pt-28 px-6 md:px-12 pb-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-emerald-400 mb-16 text-center">
            🛒 Secure Checkout
          </h1>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-8">
              <h2 className="text-3xl font-bold text-emerald-400 mb-6">Your Items</h2>
              {cartItems.map((item) => {
                const price =
                  typeof item.product?.price === "number"
                    ? item.product.price
                    : parseFloat(
                        String(item.product?.price || "0").replace(/[₹,]/g, "")
                      ) || 0;

                const itemTotal = price * item.quantity;

                return (
                  <div
                    key={`${item.product._id}-${item.size}`}
                    className="flex flex-col md:flex-row items-center bg-gradient-to-r from-slate-800 to-slate-700 p-8 rounded-2xl shadow-2xl border border-slate-600 hover:shadow-3xl transition-all duration-300 cursor-pointer hover:border-emerald-500/50"
                    onClick={() => navigate(`/product/${item.product._id}`)}
                  >
                    <img
                      src={`${import.meta.env.VITE_API_URL}${item.product?.img}`}
                      alt={item.product?.name}
                      className="w-full max-w-36 h-auto object-cover rounded-2xl mb-6 md:mb-0 shadow-xl border border-slate-600"
                    />
                    <div className="flex-1 md:ml-10 flex flex-col justify-between h-full w-full">
                      <div className="flex justify-between items-start md:items-center w-full mb-4">
                        <h3 className="font-bold text-2xl md:text-3xl text-white">
                          {item.product?.name}{" "}
                          {item.size && <span className="text-emerald-400">- Size: {item.size}</span>}
                        </h3>
                        <p className="font-bold text-2xl md:text-3xl text-emerald-400">
                          {formatCurrency(itemTotal)}
                        </p>
                      </div>
                      <p className="text-emerald-400 font-semibold text-xl">
                        {formatCurrency(price)} × {item.quantity} ={" "}
                        {formatCurrency(itemTotal)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary & Payment */}
            <div className="space-y-8">
              {/* Delivery Address */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-8 rounded-2xl shadow-2xl border border-slate-600">
                <h2 className="text-3xl font-bold text-emerald-400 mb-6 flex items-center gap-3">
                  <MapPin size={32} />
                  Delivery Address
                </h2>

                <div className="bg-slate-600 p-6 rounded-xl text-white space-y-4 shadow-lg">
                  <p className="text-xl font-semibold text-emerald-400">
                    {deliveryAddress.fullName}
                  </p>

                  <p className="text-slate-300 text-lg">
                    {deliveryAddress.address}, {deliveryAddress.city},{" "}
                    {deliveryAddress.state} - {deliveryAddress.postalCode}
                  </p>

                  <p className="text-slate-300 text-lg">{deliveryAddress.country}</p>

                  <p className="text-slate-300 font-semibold text-lg">
                    Phone: {deliveryAddress.phone}
                  </p>

                  <button
                    onClick={() => navigate("/cart")}
                    className="mt-4 text-emerald-400 hover:text-emerald-300 underline font-semibold cursor-pointer text-lg transition-colors duration-200"
                  >
                    ✏️ Edit Address
                  </button>
                </div>
              </div>

              {/* Price Details */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-8 rounded-2xl shadow-2xl border border-slate-600">
                <h2 className="text-3xl font-bold text-emerald-400 mb-6 flex items-center gap-3">
                  <CreditCard size={32} />
                  Order Summary
                </h2>

                <div className="space-y-4">
                  <div className="flex justify-between text-lg">
                    <span className="text-slate-300">Subtotal:</span>
                    <span className="font-semibold text-white">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="text-slate-300">Discount (5%):</span>
                    <span className="text-emerald-400 font-semibold">
                      - {formatCurrency(discountAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="text-slate-300">Platform Fee:</span>
                    <span className="font-semibold text-white">
                      {formatCurrency(platformFee)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="text-slate-300">Shipping:</span>
                    <span className="font-semibold text-white">
                      {formatCurrency(shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="text-slate-300">Tax (5% GST):</span>
                    <span className="font-semibold text-white">
                      {formatCurrency(taxAmount)}
                    </span>
                  </div>

                  <hr className="border-slate-500 my-6" />

                  <div className="flex justify-between font-bold text-3xl text-emerald-400">
                    <span>Total Payable:</span>
                    <span>{formatCurrency(totalPayable)}</span>
                  </div>
                </div>

                <button
                  onClick={handleMockPayment}
                  disabled={isPaying}
                  className={`w-full py-5 rounded-2xl font-bold text-xl transition-all duration-300 mt-8 ${
                    isPaying
                      ? "bg-slate-600 cursor-not-allowed"
                      : "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 cursor-pointer shadow-xl hover:shadow-2xl transform hover:scale-105"
                  }`}
                >
                  {isPaying ? "Processing Payment..." : "Complete Purchase"}
                </button>

                <button
                  onClick={clearCart}
                  className="w-full text-red-400 hover:text-red-300 underline font-semibold cursor-pointer text-lg mt-4 transition-colors duration-200"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
