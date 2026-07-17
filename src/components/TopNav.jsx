import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Search, Bell, ChevronDown, LogOut } from "lucide-react";

export function TopNav({ activeView, onViewChange, onToggleChat }) {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const navItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "expenses", label: "Expenses" },
    { id: "stocks", label: "Stocks" },
    { id: "portfolio", label: "Portfolio" },
    { id: "reports", label: "Reports" },
    { id: "markets", label: "Markets" },
    { id: "alerts", label: "Alerts" },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isProfileDropdownOpen]);

  const handleLogout = () => {
    // Clear any stored authentication data
    localStorage.clear();
    sessionStorage.clear();
    
    // Close the dropdown
    setIsProfileDropdownOpen(false);
    
    // Optionally reset app state or redirect
    // You can add custom logout logic here (e.g., API call, redirect to login, etc.)
    console.log("User logged out");
  };

  return (
    <nav className="w-full h-[72px] bg-[#0A0A0A] border-b border-white/5 flex items-center justify-between px-6 shrink-0 z-20">
      
      {/* Left: Logo */}
      <div className="flex items-center gap-3 w-[240px]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg">
          F
        </div>
        <div className="flex flex-col">
          <span className="text-white font-bold text-[16px] leading-tight tracking-tight">FinPilot AI</span>
          <span className="text-[#3b82f6] text-[9px] font-bold tracking-widest uppercase">AI Financial OS</span>
        </div>
      </div>

      {/* Center: Navigation Links */}
      <div className="flex items-center gap-1 hidden md:flex">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange?.(item.id)}
              className={`px-4 pb-2 pt-3 text-[14px] font-medium transition-colors ${isActive ? "text-white border-b-2 border-[#8b5cf6]" : "text-[#a1a1aa] hover:text-[#e4e4e7]"}`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4 w-[500px] justify-end">
        
        {/* Ask Nexus AI Button */}
        <button
          onClick={onToggleChat}
          className="flex items-center gap-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:from-[#4f46e5] hover:to-[#9333ea] text-white text-[13px] font-bold px-4 py-2 rounded-lg transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] active:scale-95 border border-white/10"
        >
          <Sparkles className="w-4 h-4" />
          Ask Nexus AI
        </button>

        {/* Search Bar */}
        <div className="relative hidden lg:block w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
          <input
            type="text"
            placeholder="Search expenses, stocks, reports..."
            className="w-full bg-[#121214] border border-white/5 rounded-lg pl-9 pr-10 py-2 text-[13px] text-white placeholder:text-[#52525b] focus:outline-none focus:border-[#52525b] transition-all"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-5 bg-[#27272a] rounded text-[10px] text-[#a1a1aa] font-bold border border-[#3f3f46]">
            ⌘K
          </div>
        </div>

        {/* Notifications */}
        <div className="flex items-center gap-3">
          <button className="relative p-2 text-[#a1a1aa] hover:text-white transition-colors rounded-full hover:bg-[#18181b]">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-[#09090b] rounded-full" />
          </button>
          
          <div className="h-5 w-px bg-[#27272a]"></div>

          {/* Profile */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-2.5 pl-1 group"
            >
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
                  alt="Maya"
                  className="w-8 h-8 rounded-full border border-white/5 object-cover group-hover:border-[#52525b] transition-colors"
                />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-[#09090b] rounded-full text-[8px] font-bold text-white flex items-center justify-center">3</span>
              </div>
              <div className="flex flex-col items-start hidden sm:flex">
                <div className="flex items-center gap-1">
                  <span className="text-[13px] font-semibold text-white leading-tight">Maya</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#71717a] transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
                <span className="text-[10px] font-bold text-[#a855f7] leading-none mt-0.5 bg-purple-500/10 px-1.5 py-0.5 rounded-sm">Pro Plan</span>
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-[#121214] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
                {/* Profile Info */}
                <div className="px-4 py-3 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150"
                      alt="Maya"
                      className="w-10 h-10 rounded-full border border-white/5 object-cover"
                    />
                    <div>
                      <p className="text-white text-[13px] font-semibold">Maya Sharma</p>
                      <p className="text-[#a1a1aa] text-[11px]">maya@example.com</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button className="w-full px-4 py-2.5 text-left text-[13px] text-[#a1a1aa] hover:text-white hover:bg-[#1f1f24] transition-colors flex items-center gap-3">
                    <span className="w-4 h-4 flex items-center justify-center">👤</span>
                    View Profile
                  </button>
                  <button className="w-full px-4 py-2.5 text-left text-[13px] text-[#a1a1aa] hover:text-white hover:bg-[#1f1f24] transition-colors flex items-center gap-3">
                    <span className="w-4 h-4 flex items-center justify-center">⚙️</span>
                    Settings
                  </button>
                  <button className="w-full px-4 py-2.5 text-left text-[13px] text-[#a1a1aa] hover:text-white hover:bg-[#1f1f24] transition-colors flex items-center gap-3">
                    <span className="w-4 h-4 flex items-center justify-center">❓</span>
                    Help & Support
                  </button>
                </div>

                {/* Logout Button */}
                <div className="border-t border-white/5 py-2">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-[13px] text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors flex items-center gap-3"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </nav>
  );
}
