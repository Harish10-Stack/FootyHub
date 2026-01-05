import React from "react";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import Swal from "sweetalert2";
import { useAuth } from "../Explore/AuthContext.jsx";
import NotificationBell from "../Notifications/NotificationBell.jsx";

const CheckoutHeader = ({ quote = "Gear up like a Pro" }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleUserClick = () => {
    Swal.fire({
      icon: "info",
      title: "Profile Updates",
      text: "Profile changes can only be made on the main page.",
      showCancelButton: true,
      confirmButtonText: "OK",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#22c55e",
    });
  };

  return (
    <header className="fixed top-0 left-0 w-full text-white p-2 md:p-4 flex items-center justify-between z-[1000] bg-gray-900 bg-opacity-95 shadow-lg border-b border-gray-800 min-h-[60px] md:min-h-[70px]">
      {/* Left: Logo */}
      <div
        className="flex items-center cursor-pointer"
        onClick={() => navigate("/")}
      >
        <span className="text-green-500 font-extrabold text-2xl md:text-3xl">Footy</span>
        <span className="text-white font-extrabold text-2xl md:text-3xl ml-1">Hub</span>
        <span className="ml-1 text-2xl md:text-3xl">⚽</span>

      </div>

      {/* Center Quote */}
      <div className="hidden lg:absolute lg:inset-0 lg:flex lg:flex-col lg:justify-center lg:items-center lg:text-center lg:pointer-events-none">
        <span className="text-green-400 font-extrabold text-2xl md:text-3xl tracking-wide animate-pulse">
          {quote}
        </span>
      </div>

      {/* Right: Bell + User Name Only */}
      <div className="flex items-center space-x-2 md:space-x-4 px-2 md:px-4 py-2">
        {user && !user.isAdmin && <NotificationBell user={user} />}

        {user && (
          <button
            onClick={handleUserClick}
            className="flex items-center space-x-2 px-3 md:px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition font-semibold cursor-pointer text-sm md:text-base"
          >
            <User size={20} />
            <span className="text-green-400">{user.name}</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default CheckoutHeader;












