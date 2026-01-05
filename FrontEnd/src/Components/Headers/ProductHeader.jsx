import React from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../Cart and Checkout/CartContext.jsx";
import { useAuth } from "../Explore/AuthContext.jsx";
import NotificationBell from "../Notifications/NotificationBell.jsx";

const ProductHeader = ({ quote = "Product Details" }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { totalItems } = useCart();

  return (
    <header className="fixed top-0 left-0 w-full text-white px-4 sm:px-8 py-4 sm:py-6 flex items-center z-[1000] bg-gray-900 shadow-2xl transition-all duration-300">
      <div className="flex items-center space-x-4">
        <div
          className="flex items-center cursor-pointer"
          onClick={() => navigate("/")}
        >
          <span className="text-green-500 text-3xl font-extrabold">Footy</span>
          <span className="text-white text-3xl font-extrabold ml-1">Hub</span>
          <span className="ml-1 text-3xl">⚽</span>
        </div>
      </div>

      {/* Center */}
      <div className="hidden sm:flex flex-1 text-center text-lg sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 hover:scale-105 transition-all duration-300">
        {quote}
      </div>

      <div className="flex items-center space-x-4 sm:space-x-8">
        {/* Only show cart for non-admin users */}
        {user && !user.isAdmin && (
          <button
            onClick={() => navigate("/cart")}
            className="relative p-2 sm:p-3 rounded-full hover:text-green-400 hover:bg-gray-800 transition cursor-pointer"
          >
            <ShoppingCart size={24} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold border-2 border-gray-900">
                {totalItems}
              </span>
            )}
          </button>
        )}

        {/* Notification Bell */}
        {user && <NotificationBell user={user} />}

        {user ? (
          <span className="px-3 sm:px-4 py-2 rounded-lg bg-green-500 font-bold text-black shadow-md text-sm sm:text-base max-w-[120px] truncate">
            {user.name}
          </span>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 transition font-bold text-black shadow-md text-sm md:text-base cursor-pointer"
          >
            Login / Sign Up
          </button>
        )}
      </div>
    </header>
  );
};

export default ProductHeader;















