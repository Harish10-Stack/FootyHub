import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, X, User, LogOut, Heart, Trash2 } from "lucide-react";
import { useCart } from "../Cart and Checkout/CartContext.jsx";
import { useAuth } from "../Explore/AuthContext.jsx";
import { useWishlist } from "../Explore/WishListContext.jsx";
import LoginModal from "../Login/LoginModal.jsx";
import DeleteAccountModal from "../Login/DeleteAccountModal.jsx";
import Swal from "sweetalert2";
import NotificationBell from "../Notifications/NotificationBell.jsx";

const Header = () => {
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const { user, logout } = useAuth();
  const { wishlist } = useWishlist();

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [animatingHeart, setAnimatingHeart] = useState(false);

  const links = ["Shop", "Fixtures", "News"];

  // Update wishlist count and animate heart
  useEffect(() => {
    setWishlistCount(wishlist.length);
    if (wishlist.length > 0) {
      setAnimatingHeart(true);
      const timer = setTimeout(() => setAnimatingHeart(false), 400);
      return () => clearTimeout(timer);
    }
  }, [wishlist]);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      await logout();
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full text-white px-4 sm:px-6 py-3 flex items-center justify-between z-[1000] bg-gray-900 bg-opacity-95 shadow-xl border-b border-gray-800 h-[56px] sm:h-[64px]">
        
        {/* Left: Logo + Desktop Nav */}
        <div className="flex items-center">
          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded hover:text-green-400 transition cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <div
            className="flex items-center cursor-pointer ml-2"
            onClick={() => navigate("/")}
          >
            <span className="text-green-500 font-extrabold text-2xl sm:text-3xl md:text-3xl">
              Footy
            </span>
            <span className="text-white font-extrabold text-2xl sm:text-3xl md:text-3xl ml-1">
              Hub
            </span>
            <span className="ml-1 text-2xl sm:text-3xl md:text-3xl">⚽</span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex space-x-2 lg:space-x-4 ml-4 lg:ml-6 items-center">
            {links.map((name) => (
              <button
                key={name}
                onClick={() => navigate(`/${name.toLowerCase()}`)}
                className="px-3 py-2 rounded hover:bg-gray-800 transition font-medium text-gray-300 hover:text-green-400"
              >
                {name}
              </button>
            ))}
          </nav>
        </div>

        {/* Center Quote (Desktop Only) */}
        <div className="hidden lg:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex-col justify-center items-center text-center pointer-events-none">
          <span className="text-green-400 font-extrabold text-2xl md:text-3xl tracking-wide animate-pulse">
            ⚽ Every minute counts.
          </span>
        </div>

        {/* Right: Cart + Wishlist + Notification + User */}
        <div className="flex items-center gap-2 sm:gap-4 px-2 sm:px-4 py-1 sm:py-2">

          {/* Notifications */}
          {user && <NotificationBell user={user} />}

          {/* Cart */}
          {user && !user.isAdmin && (
            <button
              onClick={() => navigate("/cart")}
              className="relative p-2 sm:p-3 rounded-full hover:text-green-400 hover:bg-gray-800 transition flex-shrink-0"
            >
              <ShoppingCart size={22} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold border-2 border-gray-900">
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
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold border-2 border-gray-900">
                  {wishlistCount}
                </span>
              )}
            </button>
          )}

          {/* User Icon + Dropdown */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 px-2 sm:px-3 py-1 sm:py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition font-semibold cursor-pointer"
              >
                <User size={20} />
                <span className="hidden md:inline text-green-400 max-w-[120px] truncate">
                  {user.name}
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50">
                  {user?.isAdmin && (
                    <button
                      onClick={() => {
                        navigate("/admin");
                        setDropdownOpen(false);
                      }}
                      className="flex items-center px-4 py-2 w-full hover:bg-gray-800 hover:text-blue-500 transition cursor-pointer"
                    >
                      ⚙️ Admin Panel
                    </button>
                  )}

                  <button
                    onClick={() => {
                      navigate("/profile");
                      setDropdownOpen(false);
                    }}
                    className="flex items-center px-4 py-2 w-full hover:bg-gray-800 hover:text-green-500 transition cursor-pointer"
                  >
                    <User size={18} className="mr-2" /> My Profile
                  </button>

                  {!user.isAdmin && (
                    <button
                      onClick={() => {
                        navigate("/orders");
                        setDropdownOpen(false);
                      }}
                      className="flex items-center px-4 py-2 w-full hover:bg-gray-800 hover:text-green-500 transition cursor-pointer"
                    >
                      🛒 Orders
                    </button>
                  )}

                  <button
                    onClick={() => {
                      handleLogout();
                      setDropdownOpen(false);
                    }}
                    className="flex items-center px-4 py-2 w-full hover:bg-gray-800 hover:text-red-500 transition cursor-pointer"
                  >
                    <LogOut size={18} className="mr-2" /> Logout
                  </button>

                  <button
                    onClick={() => setDeleteModalOpen(true)}
                    className="flex items-center px-4 py-2 w-full hover:bg-gray-800 hover:text-red-500 transition cursor-pointer"
                  >
                    <Trash2 size={18} className="mr-2" /> Delete Account
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 transition font-bold text-black shadow-md text-sm md:text-base cursor-pointer"
            >
              Login / Sign Up
            </button>
          )}
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden fixed top-[56px] sm:top-[64px] left-0 w-full bg-gray-900 z-[999] shadow-xl border-b border-gray-800">
          <div className="flex flex-col space-y-2 p-4">
            {links.map((name) => (
              <button
                key={name}
                onClick={() => {
                  navigate(`/${name.toLowerCase()}`);
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-3 rounded text-lg hover:bg-green-500 hover:text-white transition font-medium w-full text-left bg-gray-800 cursor-pointer"
              >
                {name}
              </button>
            ))}
          </div>
        </nav>
      )}

      <LoginModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      <DeleteAccountModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
      />
    </>
  );
};

export default Header;


