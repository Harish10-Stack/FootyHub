import React from "react";
import { Search, LogOut, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Explore/AuthContext.jsx";

export default function AdminHeader({ collapsed, setCollapsed, title }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <header className="h-16 bg-[#050607] border-b border-[#0f1416] flex items-center px-4 justify-between">
      <div className="flex items-center gap-4">
        <button onClick={() => setCollapsed(!collapsed)} className="p-2 rounded hover:bg-[#0f1720]">
          <span className="sr-only">Toggle sidebar</span>
          {/* simple hamburger */}
          <svg className="w-5 h-5 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
        <h2 className="text-lg font-semibold text-white">{title}</h2>

      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <input
            type="search"
            placeholder="Search..."
            className="bg-[#0b1114] placeholder:text-gray-500 text-sm rounded px-3 py-2 w-60 focus:outline-none border border-[#1b2226]"
          />
          <div className="absolute right-2 top-2 text-gray-400"><Search size={14} /></div>
        </div>

        <div className="px-3 py-1 bg-[#0f1720] border border-[#1b2226] rounded text-sm">Admin</div>

        <button
          onClick={() => navigate('/')}
          className="p-2 rounded hover:bg-[#0f1720] text-gray-300 hover:text-blue-400"
          title="Back to Home"
        >
          <Home size={18} />
        </button>
      </div>
    </header>
  );
}

