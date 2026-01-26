// src/Components/Cart and Checkout/Cart.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../Cart and Checkout/CartContext.jsx";
import CartHeader from "../Headers/CartHeader.jsx";
import Swal from "sweetalert2";
import { useAuth } from "../Explore/AuthContext.jsx";
import { ShoppingCart, Plus, Minus, Trash2, MapPin, CreditCard, ArrowRight } from "lucide-react";

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, totalAmount } = useCart();
  const { user, saveDeliveryAddress } = useAuth();
  const navigate = useNavigate();

  if (user?.isAdmin) {
    return (
      <>
        <CartHeader quote="🛒 Every cart matters!" />
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-gray-300 pt-[100px]">
          <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
          <p className="text-gray-500">Admin users cannot access the cart.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-green-500 hover:bg-green-600 transition text-white px-6 py-2 rounded-lg font-bold cursor-pointer mt-4"
          >
            Go to Home
          </button>
        </div>
      </>
    );
  }

  const shippingCost = totalAmount > 0 ? 199 : 0;
  const tax = totalAmount * 0.05;
  const grandTotal = totalAmount + shippingCost + tax;

  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.deliveryAddress?.fullName || "",
    address: user?.deliveryAddress?.address || "",
    city: user?.deliveryAddress?.city || "",
    state: user?.deliveryAddress?.state || "",
    postalCode: user?.deliveryAddress?.postalCode || "",
    phone: user?.deliveryAddress?.phone || "",
  });
  const [addressSaved, setAddressSaved] = useState(false);

  const handleChange = (e) => setShippingInfo({ ...shippingInfo, [e.target.name]: e.target.value });

  const handleSaveAddress = async () => {
    const allFilled = Object.values(shippingInfo).every((v) => v.trim() !== "");
    if (!allFilled) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Information",
        text: "Please fill out all shipping fields before saving.",
        confirmButtonColor: "#22c55e",
      });
      return;
    }

    try {
      await saveDeliveryAddress(shippingInfo);
      setAddressSaved(true);
      Swal.fire({
        icon: "success",
        title: "Address saved",
        text: "Delivery address saved to your profile.",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Save failed",
        text: err.message || "Failed to save address.",
      });
    }
  };

  if (!cartItems || cartItems.length === 0)
    return (
      <>
        <CartHeader quote="🛒 Every cart matters!" />
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-gray-300 pt-[100px]">
          <h2 className="text-2xl font-semibold mb-4">Your cart is empty 🛒</h2>
          <button
            onClick={() => navigate("/shop")}
            className="bg-green-500 hover:bg-green-600 transition text-white px-6 py-2 rounded-lg font-bold cursor-pointer"
          >
            Back to Shop
          </button>
        </div>
      </>
    );

  return (
    <>
      <CartHeader quote="🛒 Every cart matters!" />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-200 px-4 sm:px-6 pt-24 sm:pt-28 pb-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-emerald-400 mb-12 sm:mb-16 text-center">
            🛒 Your Cart
          </h1>

          {/* Shop Prompt */}
          {cartItems.length > 0 && (
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-5 sm:p-8 rounded-2xl flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
              <span className="text-base sm:text-xl">
                Looking to expand your collection? Continue shopping to add more products to your cart.
              </span>
              <button
                onClick={() => navigate("/shop")}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 text-white px-8 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                Shop Now
              </button>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-8">
              {cartItems.map((item) => {
                const price = Number(
                  String(item.product?.price || 0).replace(/[₹,]/g, "")
                );
                const itemTotal = price * (item.quantity || 1);

                return (
                  <div
                    key={`${item.product._id}-${item.size}`}
                    className="flex flex-col md:flex-row justify-between items-center bg-gradient-to-r from-slate-800 to-slate-700 p-5 sm:p-8 rounded-2xl shadow-2xl border border-slate-600 hover:shadow-3xl transition-all duration-300 hover:border-emerald-500/50"
                  >
                    <img
                      src={`${import.meta.env.VITE_API_URL}${item.product?.img}`}
                      alt={item.product?.name}
                      className="w-32 h-32 sm:w-40 sm:h-40 object-cover rounded-2xl mb-6 md:mb-0 shadow-xl border border-slate-600"
                    />
                    <div className="flex-1 md:ml-10 flex flex-col justify-between h-full">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-3">{item.product?.name}</h3>
                        {item.size && <p className="text-slate-300 mt-2 text-lg">Size: {item.size}</p>}
                        <p className="text-emerald-400 font-bold mt-4 text-xl">₹{price.toLocaleString()}</p>
                      </div>
                      <div className="flex flex-wrap items-center mt-6 gap-4 sm:gap-8">
                        <div className="flex items-center bg-slate-600 rounded-xl shadow-lg">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product._id,
                                Math.max(item.quantity - 1, 1),
                                item.size
                              )
                            }
                            className="px-5 py-3 hover:bg-slate-500 transition-all duration-200 rounded-l-xl cursor-pointer"
                          >
                            <Minus size={18} />
                          </button>
                          <span className="px-8 py-3 font-semibold text-lg">{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.product._id, item.quantity + 1, item.size)
                            }
                            className="px-5 py-3 hover:bg-slate-500 transition-all duration-200 rounded-r-xl cursor-pointer"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product._id, item.size)}
                          className="text-red-400 hover:text-red-300 transition-all duration-200 font-semibold cursor-pointer flex items-center gap-2 text-lg"
                        >
                          <Trash2 size={20} />
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="mt-6 md:mt-0 md:ml-10 text-right">
                      <p className="text-3xl font-bold text-emerald-400">₹{itemTotal.toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Shipping & Order Summary */}
            <div className="space-y-8">
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-8 rounded-2xl shadow-2xl border border-slate-600">
                <h2 className="text-3xl font-bold text-emerald-400 mb-6 flex items-center gap-3">
                  <MapPin size={32} />
                  Shipping Address
                </h2>
                {["fullName","address","city","state","postalCode","phone"].map((key) => (
                  <input
                    key={key}
                    type="text"
                    name={key}
                    placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                    value={shippingInfo[key]}
                    onChange={handleChange}
                    className="w-full p-4 sm:p-5 rounded-xl bg-slate-600 text-white border border-slate-500 focus:border-emerald-400 focus:outline-none transition-all duration-200 placeholder-slate-400 mb-4"
                  />
                ))}
                <button
                  onClick={handleSaveAddress}
                  className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 text-white px-8 py-4 rounded-2xl font-bold cursor-pointer mt-6 shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  Save Address
                </button>
              </div>

              {addressSaved && (
                <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-8 rounded-2xl shadow-2xl border border-slate-600">
                  <h2 className="text-3xl font-bold text-emerald-400 mb-6">Order Summary</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between text-lg">
                      <span className="text-slate-300">Subtotal:</span>
                      <span className="font-semibold text-white">₹{totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span className="text-slate-300">Shipping:</span>
                      <span className="font-semibold text-white">₹{shippingCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-lg">
                      <span className="text-slate-300">Tax (5% GST):</span>
                      <span className="font-semibold text-white">₹{tax.toLocaleString()}</span>
                    </div>
                    <hr className="my-6 border-slate-500" />
                    <div className="flex justify-between text-2xl font-bold text-emerald-400">
                      <span>Total:</span>
                      <span>₹{grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-6 mt-8">
                    <button
                      onClick={() => navigate("/checkout")}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 text-white px-8 py-4 rounded-2xl font-bold cursor-pointer shadow-xl hover:shadow-2xl transform hover:scale-105"
                    >
                      Proceed to Checkout
                    </button>
                    <button
                      onClick={clearCart}
                      className="flex-1 bg-red-500 hover:bg-red-600 transition-all duration-300 text-white px-8 py-4 rounded-2xl font-bold cursor-pointer shadow-xl hover:shadow-2xl transform hover:scale-105"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;




