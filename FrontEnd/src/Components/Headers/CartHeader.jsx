import React from "react";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { useAuth } from "../Explore/AuthContext.jsx";
import Swal from "sweetalert2";
import NotificationBell from "../Notifications/NotificationBell.jsx";

const CartHeader = ({ quote = "🛒 Every cart matters!" }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Show professional alert when user clicks on username
  const handleUserClick = () => {
    Swal.fire({
      icon: "info",
      title: "Profile Management",
      text: "To update your profile information, please navigate to the main profile page.",
      confirmButtonText: "OK",
      confirmButtonColor: "#22c55e",
    });
  };

  return (
    <header className="fixed top-0 left-0 w-full text-white px-4 sm:px-6 py-3 flex items-center justify-between z-[1000] bg-gray-900 bg-opacity-95 shadow-lg border-b border-gray-800 h-[56px] sm:h-[64px]">
      {/* Left: Logo */}
      <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
        <span className="text-green-500 text-2xl sm:text-3xl font-extrabold">Footy</span>
        <span className="text-white text-2xl sm:text-3xl font-extrabold ml-1">Hub</span>
        <span className="ml-1 text-2xl sm:text-3xl">⚽</span> 
      </div>

      {/* Center Quote */}
      <div className="hidden lg:absolute lg:inset-0 lg:flex lg:flex-col lg:justify-center lg:items-center lg:text-center lg:pointer-events-none">
        <span className="text-green-400 font-extrabold text-2xl md:text-3xl tracking-wide animate-pulse">
          {quote}
        </span>
      </div>

      {/* Right: Bell + Username */}
      <div className="flex items-center space-x-4 sm:space-x-8">
        {user && !user.isAdmin && <NotificationBell user={user} />}

        {user && (
          <button
            onClick={handleUserClick}
            className="flex items-center px-2 sm:px-3 py-1 sm:py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition font-semibold cursor-pointer"
          >
            <User size={20} />
            <span className="hidden sm:inline text-green-400 truncate max-w-[120px] md:max-w-[150px] ml-2">
              {user.name}
            </span>
          </button>
        )}

      </div>
    </header>
  );
};

export default CartHeader;















