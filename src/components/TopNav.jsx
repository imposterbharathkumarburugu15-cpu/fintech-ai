import React, { useState } from "react";
import { Sparkles, Search, Bell, ChevronDown, LogOut } from "lucide-react";
import { supabase } from "../supabaseClient";

export function TopNav({ activeView, onViewChange, onToggleChat, user }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "expenses", label: "Expenses" },
    { id: "stocks", label: "Stocks" },
    { id: "portfolio", label: "Portfolio" },
    { id: "reports", label: "Reports" },
    { id: "markets", label: "Markets" },
    { id: "alerts", label: "Alerts" },
  ];

  // derive a display name + initials from the logged-in user
  const fullName = user?.user_metadata?.full_name || user?.email || "User";
  const initials = fullName
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function handleLogout() {
    await supabase.auth.signOut();   // onAuthStateChange in App swaps back to Login
  }

  return (
    <nav className="w-full h-[72px] bg-[#09090b] border-b border-[#27272a] flex items-center justify-between px-6 shrink-0 z-20">
      {/* Left: Logo */}
      <div className="flex items-center gap-3 w-[240px]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg">F</div>
        <div className="flex flex-col">
          <span className="text-white font-bold text-[16px] leading-tight tracking-tight">FinPilot AI</span>
          <span className="text-[#3b82f6] text-[9px] font-bold tracking-widest uppercase">AI Financial OS</span>
        </div>
      </div>

      {/* Center: Nav */}
      <div className="flex items-center gap-1 hidden md:flex">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button key={item.id} onClick={() => onViewChange?.(item.id)}
              className={`px-4 pb-2 pt-3 text-[14px] font-medium transition-colors ${isActive ? "text-white border-b-2 border-[#8b5cf6]" : "text-[#a1a1aa] hover:text-[#e4e4e7]"}`}>
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Right */}
      <div className="flex items-center gap-4 w-[500px] justify-end">
        <button onClick={onToggleChat}
          className="flex items-center gap-2 bg-gradient-to-r from-[#6366f1] to-[#a855f7] hover:from-[#4f46e5] hover:to-[#9333ea] text-white text-[13px] font-bold px-4 py-2 rounded-lg transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] active:scale-95 border border-white/10">
          <Sparkles className="w-4 h-4" /> Ask Nexus AI
        </button>

        <div className="relative hidden lg:block w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
          <input type="text" placeholder="Search expenses, stocks, reports..."
            className="w-full bg-[#121214] border border-[#27272a] rounded-lg pl-9 pr-10 py-2 text-[13px] text-white placeholder:text-[#52525b] focus:outline-none focus:border-[#52525b] transition-all" />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-5 bg-[#27272a] rounded text-[10px] text-[#a1a1aa] font-bold border border-[#3f3f46]">⌘K</div>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative p-2 text-[#a1a1aa] hover:text-white transition-colors rounded-full hover:bg-[#18181b]">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-[#09090b] rounded-full" />
          </button>

          <div className="h-5 w-px bg-[#27272a]"></div>

          {/* Profile — real user, with logout dropdown */}
          <div className="relative">
            <button onClick={() => setMenuOpen((v) => !v)} className="flex items-center gap-2.5 pl-1 group">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-[11px] font-semibold text-white border border-[#27272a]">
                {initials}
              </div>
              <div className="flex flex-col items-start hidden sm:flex">
                <div className="flex items-center gap-1">
                  <span className="text-[13px] font-semibold text-white leading-tight">{fullName}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#71717a]" />
                </div>
                <span className="text-[10px] font-bold text-[#a855f7] leading-none mt-0.5 bg-purple-500/10 px-1.5 py-0.5 rounded-sm">Pro Plan</span>
              </div>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#18181b] border border-[#27272a] rounded-xl shadow-2xl py-1 z-30">
                <div className="px-4 py-2 border-b border-[#27272a]">
                  <p className="text-[12px] text-[#71717a] truncate">{user?.email}</p>
                </div>
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-[13px] text-[#ef4444] hover:bg-[#27272a] transition-colors">
                  <LogOut className="w-4 h-4" /> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}