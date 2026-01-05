import React from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, User } from "lucide-react";
import { useCart } from "../Cart and Checkout/CartContext.jsx";
import { useAuth } from "../Explore/AuthContext.jsx";
import Swal from "sweetalert2";
import NotificationBell from "../Notifications/NotificationBell.jsx";

const FixturesHeader = () => {
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const { user } = useAuth();
  const totalCart = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const links = ["Home", "Shop", "News"];

  return (
    <header className="fixed top-0 left-0 w-full text-white px-4 sm:px-6 py-3 flex items-center justify-between z-[1000] bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-opacity-95 backdrop-blur-md shadow-xl border-b border-gray-700/50">

      {/* Left: Logo + Navigation */}
      <div className="flex items-center">
        <div
          className="flex items-center cursor-pointer ml-2"
          onClick={() => navigate("/")}
        >
          <span className="text-green-500 text-2xl sm:text-3xl font-extrabold">Footy</span>
          <span className="text-white text-2xl sm:text-3xl font-extrabold ml-1">Hub</span>
          <span className="ml-1 text-2xl sm:text-3xl">⚽</span>
        </div>

        <nav className="hidden md:flex md:space-x-2 ml-4 sm:ml-6 items-center">
          {links.map((name) => (
            <button
              key={name}
              onClick={() => navigate(name === "Home" ? "/" : `/${name.toLowerCase()}`)}
              className="px-3 py-2 rounded hover:bg-gray-800 transition font-medium text-gray-300 hover:text-green-400 cursor-pointer text-sm sm:text-base"
            >
              {name}
            </button>
          ))}
        </nav>
      </div>

      {/* Center Quote */}
      <div className="hidden lg:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex-col justify-center items-center text-center pointer-events-none">
        <span className="text-green-400 font-extrabold text-2xl md:text-3xl tracking-wide animate-pulse">
          ⚽ Every minute counts.
        </span>
      </div>


      {/* Right: Cart + Bell + User */}
      <div className="flex items-center gap-2 sm:gap-4 px-2 sm:px-4 py-1 sm:py-2">

        {/* Cart */}
        {user && !user.isAdmin && (
          <button
            onClick={() => navigate("/cart")}
            className="relative p-2 sm:p-3 rounded-full hover:text-green-400 hover:bg-gray-800 transition flex-shrink-0"
          >
            <ShoppingCart size={22} />
            {totalCart > 0 && (
              <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold border-2 border-gray-900">
                {totalCart}
              </span>
            )}
          </button>
        )}

        {/* Notifications */}
        {user && !user.isAdmin && <NotificationBell user={user} />}

        {/* User Button - No Dropdown */}
        {user && (
          <button
            onClick={() =>
              Swal.fire({
                title: "Go to main page",
                text: "Go to main page to make changes to your profile",
                icon: "info",
                confirmButtonText: "OK",
              })
            }
            className="flex items-center px-2 sm:px-3 py-1 sm:py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition font-semibold cursor-pointer"
          >
            <User size={18} />
            <span className="hidden sm:inline text-green-400 truncate max-w-[120px] md:max-w-[150px] ml-2">
              {user.name}
            </span>
          </button>
        )}

      </div>
    </header>
  );
};

export default FixturesHeader;


