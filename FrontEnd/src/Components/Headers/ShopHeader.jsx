import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, User, Heart, LogOut } from "lucide-react";
import { useCart } from "../Cart and Checkout/CartContext.jsx";
import { useAuth } from "../Explore/AuthContext.jsx";
import { useWishlist } from "../Explore/WishListContext.jsx";
import Swal from "sweetalert2";
import NotificationBell from "../Notifications/NotificationBell.jsx";

const ShopHeader = () => {
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const { wishlist } = useWishlist();
  const wishlistCount = wishlist.length;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [animatingHeart, setAnimatingHeart] = useState(false);

  const links = [
    { name: "Home", path: "/" },
    { name: "Fixtures", path: "/fixtures" },
    { name: "News", path: "/news" },
  ];

  // Animate heart when wishlist changes
  useEffect(() => {
    if (wishlistCount > 0) {
      setAnimatingHeart(true);
      const timer = setTimeout(() => setAnimatingHeart(false), 400);
      return () => clearTimeout(timer);
    } else {
      setAnimatingHeart(false);
    }
  }, [wishlistCount]);

  // Logout with SweetAlert2 confirmation
  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out from your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626", // red
      cancelButtonColor: "#6b7280", // gray
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        logout(); // original logout function
        Swal.fire({
          title: "Logged out!",
          text: "You have been successfully logged out.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  return (
    <header className="fixed top-0 left-0 w-full text-white p-4 flex items-center justify-between z-[1000] bg-gray-900 bg-opacity-95 shadow-lg border-b border-gray-800">
      {/* Left: Logo + Nav Links */}
      <div className="flex items-center space-x-4">
        <div
          className="flex items-center cursor-pointer"
          onClick={() => navigate("/")}
        >
          <span className="text-green-500 text-xl sm:text-2xl md:text-3xl font-extrabold">Footy</span>
          <span className="text-white text-xl sm:text-2xl md:text-3xl font-extrabold ml-1">Hub</span>
          <span className="ml-1 text-xl sm:text-2xl md:text-3xl">⚽</span>

        </div>

        {/* Navigation links */}
        <nav className="hidden md:flex md:space-x-2 ml-6 items-center">
          {links.map((link) => (
            <button
              key={link.name}
              onClick={() => navigate(link.path)}
              className="px-3 py-2 rounded cursor-pointer hover:bg-gray-800 transition font-medium text-gray-300 hover:text-green-400"
            >
              {link.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Center Quote */}
      <div className="hidden lg:absolute lg:inset-0 lg:flex lg:flex-col lg:justify-center lg:items-center lg:text-center lg:pointer-events-none">
        <span className="text-green-400 font-extrabold text-2xl md:text-3xl tracking-wide animate-pulse">
          ⚽ Every minute counts.
        </span>
      </div>
      {/* Right */}
      <div className="flex items-center gap-2 sm:gap-4 px-2 sm:px-4 py-1 md:py-2">
        
        {/* Cart */}
        {user && !user.isAdmin && (
          <button
            onClick={() => navigate("/cart")}
            className="relative p-2 sm:p-3 rounded-full hover:text-green-400 hover:bg-gray-800 transition flex-shrink-0"
          >
            <ShoppingCart size={24} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold border-2 border-gray-900">
                {totalItems}
              </span>
            )}
          </button>
        )}

        {/* Wishlist */}
        {user && !user.isAdmin && (
          <button
            onClick={() => navigate("/wishlist")}
            className="relative p-2 rounded hover:bg-gray-700 transition flex-shrink-0"
          >
            <Heart
              size={24}
              className={`transition-all duration-300 ${
                wishlistCount > 0 ? "text-red-500" : "text-white"
              } ${animatingHeart ? "animate-pop" : ""}`}
            />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>
        )}

        {/* Notifications Bell */}
        {user && !user.isAdmin && <NotificationBell user={user} />}

        {/* User Dropdown */}
        {user && !user.isAdmin && (
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center px-2 sm:px-3 py-1 sm:py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition font-semibold cursor-pointer"
            >
              <User size={20} />
              <span className="hidden sm:inline text-green-400 truncate max-w-[120px] md:max-w-[150px] ml-2">
                {user.name}
              </span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50">
                <button
                  onClick={() => {
                    navigate("/profile");
                    setDropdownOpen(false);
                  }}
                  className="flex items-center px-4 py-2 w-full text-white hover:text-green-400 hover:bg-gray-800 transition cursor-pointer"
                >
                  <User size={18} className="mr-2" /> Profile
                </button>

                <button
                  onClick={() => {
                    navigate("/orders");
                    setDropdownOpen(false);
                  }}
                  className="flex items-center px-4 py-2 w-full hover:bg-gray-800 hover:text-green-500 transition cursor-pointer"
                >
                  🛒 Orders
                </button>

                <button
                  onClick={() => {
                    handleLogout();
                    setDropdownOpen(false);
                  }}
                  className="flex items-center px-4 py-2 w-full text-white hover:text-red-500 hover:bg-gray-800 transition cursor-pointer"
                >
                  <LogOut size={18} className="mr-2" /> Logout
                </button>
              </div>
            )}
          </div>
        )}

        {/* Admin Display */}
        {user && user.isAdmin && (
          <div className="flex items-center space-x-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg bg-gray-800 font-semibold">
            <User size={20} />
            <span className="hidden sm:inline text-green-400 truncate max-w-[120px] md:max-w-[150px]">
              {user.name}
            </span>
          </div>
        )}

      </div>

    </header>
  );
};

export default ShopHeader;
