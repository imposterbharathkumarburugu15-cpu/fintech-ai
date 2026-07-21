import React, { useState } from "react";
import { 
  Plus, TrendingUp, TrendingDown, Wallet, Sparkles, 
  Search, Filter, ArrowUpRight, ArrowDownRight, 
  BrainCircuit, LayoutGrid, List as ListIcon, Bell
} from "lucide-react";
import { motion } from "framer-motion";
import { AddExpenseModal } from "../components/AddExpenseModal";

const Dashboard = () => {
  const [isModalOpen, setModalOpen] = useState(false);

  // Animation variants for staggered list entry
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-300 selection:bg-indigo-500/30">
      {/* 1. TOP NAVIGATION / HEADER */}
      <nav className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-md border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <BrainCircuit className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight hidden sm:block">Nexus <span className="text-indigo-400">AI</span></h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search transactions..." 
                className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 w-64 transition-all"
              />
            </div>
            <button className="p-2 text-zinc-400 hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-[#050505]"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 overflow-hidden">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-10">
        
        {/* 2. AI HERO SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 relative group overflow-hidden p-8 rounded-[32px] bg-gradient-to-br from-indigo-600/20 via-transparent to-transparent border border-white/10">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4 text-indigo-400">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Financial Health</span>
              </div>
              <h2 className="text-4xl font-bold text-white mb-2">Good evening, Alex.</h2>
              <p className="text-zinc-400 max-w-md leading-relaxed">
                Your savings are up <span className="text-emerald-400 font-semibold">12%</span> this month. 
                Our AI suggests you could save an additional ₹3,400 by optimizing your subscription renewals.
              </p>
              <div className="mt-8 flex gap-4">
                <button 
                  onClick={() => setModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-all active:scale-95 shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  Add Transaction
                </button>
                <button className="px-6 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all">
                  Analyze Insights
                </button>
              </div>
            </div>
            {/* Background Decoration */}
            <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full group-hover:bg-indigo-600/30 transition-all duration-700" />
          </div>

          <div className="p-8 rounded-[32px] bg-white/[0.02] border border-white/5 flex flex-col justify-between overflow-hidden relative">
             <div>
                <p className="text-zinc-500 text-sm font-medium">Net Balance</p>
                <h3 className="text-4xl font-bold text-white mt-1">₹8,42,000</h3>
             </div>
             <div className="mt-8 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">Monthly Cap</span>
                  <span className="text-white">72% used</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '72%' }}
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" 
                  />
                </div>
             </div>
          </div>
        </section>

        {/* 3. KPI STATS GRID */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Monthly Income', value: '₹1,20,000', trend: '+4.5%', icon: ArrowUpRight, color: 'text-emerald-400' },
            { label: 'Total Spending', value: '₹45,200', trend: '-12%', icon: ArrowDownRight, color: 'text-red-400' },
            { label: 'Investments', value: '₹2,10,000', trend: '+18%', icon: ArrowUpRight, color: 'text-indigo-400' },
            { label: 'Active Goals', value: '4', trend: 'On Track', icon: Sparkles, color: 'text-purple-400' },
          ].map((stat, i) => (
            <motion.div 
              whileHover={{ y: -5 }}
              key={i} 
              className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/20 transition-all cursor-pointer"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-white/5 rounded-lg">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 ${stat.color}`}>
                  {stat.trend}
                </span>
              </div>
              <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">{stat.label}</p>
              <h4 className="text-2xl font-bold text-white mt-1">{stat.value}</h4>
            </motion.div>
          ))}
        </section>

        {/* 4. TRANSACTION FEED */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Recent Transactions</h3>
              <p className="text-sm text-zinc-500">Intelligent activity tracking</p>
            </div>
            <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              <button className="p-2 bg-white/10 text-white rounded-lg"><LayoutGrid className="w-4 h-4" /></button>
              <button className="p-2 text-zinc-500 hover:text-zinc-300"><ListIcon className="w-4 h-4" /></button>
            </div>
          </div>

          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {[
              { m: 'Amazon.in', c: 'Shopping', a: '₹4,200', d: '2 hours ago', i: TrendingDown, color: 'text-red-400' },
              { m: 'Freelance Payout', c: 'Income', a: '₹25,000', d: 'Yesterday', i: TrendingUp, color: 'text-emerald-400' },
              { m: 'Uber India', c: 'Transport', a: '₹450', d: 'Yesterday', i: TrendingDown, color: 'text-red-400' },
              { m: 'Netflix Subscription', c: 'Entertainment', a: '₹649', d: '3 days ago', i: TrendingDown, color: 'text-red-400' },
            ].map((tx, idx) => (
              <motion.div 
                variants={item}
                key={idx}
                className="group flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <tx.i className={`w-5 h-5 ${tx.color}`} />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-white">{tx.m}</h5>
                    <p className="text-xs text-zinc-500">{tx.c} • {tx.d}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${tx.color}`}>{tx.i === TrendingUp ? '+' : '-'}{tx.a}</p>
                  <p className="text-[10px] text-zinc-600 font-medium">Confirmed</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          <button className="w-full py-4 text-sm font-semibold text-zinc-500 hover:text-white transition-colors">
            View All Historical Data
          </button>
        </section>
      </main>

      {/* REUSABLE MODAL COMPONENT */}
      <AddExpenseModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        onSaved={() => {/* Add Refresh Logic Here */}}
      />
    </div>
  );
};

export default Dashboard;
