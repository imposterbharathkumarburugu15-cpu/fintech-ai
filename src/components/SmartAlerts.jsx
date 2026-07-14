import React, { useState } from "react";
import { AlertTriangle, ShieldCheck, TrendingDown, Clock } from "lucide-react";

function SmartAlerts() {
  const [alerts, setAlerts] = useState([
    { id: 1, title: "Budget Exceeded", description: "Dining out expenses have exceeded the monthly budget by 15%.", time: "2 hours ago", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
    { id: 2, title: "Unusual Spending", description: 'A transaction of $450 at "Best Buy" is higher than your usual pattern.', time: "Yesterday", icon: TrendingDown, color: "text-rose-500", bg: "bg-rose-500/10" },
    { id: 3, title: "Goal Milestone", description: "You have reached 50% of your Emergency Fund goal.", time: "2 days ago", icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { id: 4, title: "Subscription Reminder", description: "Your Netflix subscription ($15.99) will renew in 3 days.", time: "3 days ago", icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" }
  ]);

  return <div className="max-w-[1000px] mx-auto flex flex-col h-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-[40px] font-semibold text-white tracking-[-0.02em] mb-2 leading-none">Smart Alerts</h1>
          <p className="text-[#a1a1aa] text-[16px]">Proactive notifications for your financial health.</p>
        </div>
        {alerts.length > 0 && (
          <button onClick={() => setAlerts([])} className="text-sm font-medium text-[#71717a] hover:text-white transition-colors">Mark all as read</button>
        )}
      </div>

      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-8 flex flex-col items-center justify-center text-center">
            <ShieldCheck className="w-12 h-12 text-[#a1a1aa] mb-4" />
            <h3 className="text-white font-medium mb-2">All caught up!</h3>
            <p className="text-[#71717a] text-sm">You have no new alerts.</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="bg-[#18181b] border border-[#27272a] rounded-2xl p-5 flex items-start gap-4 hover:bg-[#202022] transition-colors relative group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${alert.bg}`}>
                <alert.icon className={`w-5 h-5 ${alert.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-white font-medium text-[15px]">{alert.title}</h3>
                  <span className="text-[#71717a] text-xs whitespace-nowrap ml-4">{alert.time}</span>
                </div>
                <p className="text-[#a1a1aa] text-sm leading-relaxed">{alert.description}</p>
              </div>
              <button 
                onClick={() => setAlerts(alerts.filter(a => a.id !== alert.id))}
                className="absolute top-4 right-4 text-[#71717a] opacity-0 group-hover:opacity-100 hover:text-white transition-all text-xs border border-[#3f3f46] px-2 py-1 rounded-md bg-[#202022]"
              >
                Dismiss
              </button>
            </div>
          ))
        )}
      </div>
    </div>;
}
export {
  SmartAlerts
};
