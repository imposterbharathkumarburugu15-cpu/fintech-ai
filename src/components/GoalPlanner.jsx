import React, { useState } from "react";
import { Target, TrendingUp, Calendar, ArrowRight, X, Sparkles, Plus, Check, Info } from "lucide-react";

function GoalPlanner() {
  const [goals, setGoals] = useState([
    { id: 1, name: "House Down Payment", target: 100000, current: 45000, monthlyTarget: 2500, timeline: "Dec 2027", color: "#3b82f6" },
    { id: 2, name: "Emergency Fund", target: 20000, current: 15500, monthlyTarget: 500, timeline: "Mar 2025", color: "#22c55e" }
  ]);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeActionPlan, setActiveActionPlan] = useState(null);

  const [newGoal, setNewGoal] = useState({ name: "", target: "", current: "", monthlyTarget: "", timeline: "", color: "#3b82f6" });

  const handleCreateGoal = (e) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.target) return;
    
    setGoals([
      ...goals, 
      { 
        id: Date.now(), 
        name: newGoal.name, 
        target: parseFloat(newGoal.target) || 0, 
        current: parseFloat(newGoal.current) || 0, 
        monthlyTarget: parseFloat(newGoal.monthlyTarget) || 0, 
        timeline: newGoal.timeline || "TBD", 
        color: newGoal.color 
      }
    ]);
    setIsCreateModalOpen(false);
    setNewGoal({ name: "", target: "", current: "", monthlyTarget: "", timeline: "", color: "#3b82f6" });
  };

  return (
    <div className="max-w-[1080px] mx-auto flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-end mb-8 animate-fade-in-up">
        <div>
           <p className="text-[#3b82f6] text-[11px] font-bold tracking-[0.12em] mb-2 uppercase">Planning</p>
          <h1 className="text-[38px] font-semibold text-white tracking-[-0.025em] mb-2 leading-none">Goal Planner</h1>
          <p className="text-[#71717a] text-[15px]">Track savings targets and get AI-optimized action plans.</p>
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all flex items-center gap-2 shadow-[0_4px_12px_rgba(59,130,246,0.3)]">
          <Plus className="w-4 h-4" /> Create Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up stagger-1">
        {goals.map((goal) => {
          const percentage = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
          return (
            <div key={goal.id} className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6 flex flex-col hover:border-[#3f3f46] transition-all group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${goal.color}15`, color: goal.color }}>
                  <Target className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <div className="text-[22px] font-bold text-white font-mono leading-none mb-1">${goal.current.toLocaleString()}</div>
                  <div className="text-[12px] text-[#a1a1aa] font-medium">of ${goal.target.toLocaleString()}</div>
                </div>
              </div>

              <h3 className="text-white font-bold text-[17px] mb-4">{goal.name}</h3>

              <div className="w-full bg-[#09090b] rounded-full h-2.5 mb-2 overflow-hidden border border-[#27272a]">
                <div className="h-full rounded-full transition-all duration-1000 relative" style={{ width: `${Math.min(100, percentage)}%`, backgroundColor: goal.color }}>
                   <div className="absolute inset-0 bg-white/20 w-full h-full" style={{ animation: "shimmer 2s infinite" }} />
                </div>
              </div>
              <div className="flex justify-between text-[12px] font-semibold mb-6">
                 <span style={{ color: goal.color }}>{percentage.toFixed(1)}%</span>
                 <span className="text-[#71717a]">{100 - Math.round(percentage)}% left</span>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-[#27272a] pt-5 mb-5 mt-auto">
                <div>
                  <div className="text-[#71717a] text-[11px] uppercase tracking-wider font-bold mb-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Timeline
                  </div>
                  <div className="text-white font-semibold text-[14px]">{goal.timeline}</div>
                </div>
                <div>
                  <div className="text-[#71717a] text-[11px] uppercase tracking-wider font-bold mb-1.5 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" /> Monthly
                  </div>
                  <div className="text-white font-semibold text-[14px]">${goal.monthlyTarget.toLocaleString()}</div>
                </div>
              </div>

              <button 
                onClick={() => setActiveActionPlan(goal)} 
                className="w-full bg-[#202022] hover:bg-[#27272a] rounded-xl p-3 flex justify-between items-center group/btn border border-[#27272a] hover:border-[#3b82f6]/50 transition-all"
              >
                <div className="flex items-center gap-2 text-[13px] font-semibold text-[#e4e4e7] group-hover/btn:text-[#3b82f6] transition-colors">
                  <Sparkles className="w-4 h-4 text-[#8b5cf6] group-hover/btn:text-[#3b82f6]" />
                  AI Action Plan
                </div>
                <ArrowRight className="w-4 h-4 text-[#71717a] group-hover/btn:text-[#3b82f6] group-hover/btn:translate-x-1 transition-all" />
              </button>
            </div>
          );
        })}

        {/* Add Goal Card */}
        <button 
           onClick={() => setIsCreateModalOpen(true)}
           className="bg-[#18181b] border-2 border-dashed border-[#27272a] hover:border-[#3b82f6]/50 hover:bg-[#3b82f6]/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all group min-h-[340px]"
        >
           <div className="w-12 h-12 rounded-full bg-[#27272a] group-hover:bg-[#3b82f6] flex items-center justify-center mb-4 transition-colors">
              <Plus className="w-6 h-6 text-[#a1a1aa] group-hover:text-white transition-colors" />
           </div>
           <h3 className="text-white font-bold text-[16px] mb-1 group-hover:text-[#3b82f6] transition-colors">Create New Goal</h3>
           <p className="text-[#71717a] text-[13px]">Set a target and let AI build your plan.</p>
        </button>
      </div>

      {/* Modals */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#09090b] border border-[#27272a] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="p-6 border-b border-[#27272a] flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">Create New Goal</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1.5 text-[#71717a] hover:text-white hover:bg-[#18181b] rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateGoal} className="p-6 space-y-5">
              <div>
                <label className="block text-[13px] font-semibold text-[#e4e4e7] mb-1.5">Goal Name</label>
                <input required type="text" value={newGoal.name} onChange={(e) => setNewGoal({...newGoal, name: e.target.value})} placeholder="e.g. Vacation Fund" className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-3 text-[14px] text-white focus:outline-none focus:border-[#3b82f6] focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-[#e4e4e7] mb-1.5">Target Amount ($)</label>
                  <input required type="number" min="0" value={newGoal.target} onChange={(e) => setNewGoal({...newGoal, target: e.target.value})} placeholder="10000" className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-3 text-[14px] text-white focus:outline-none focus:border-[#3b82f6] transition-all" />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#e4e4e7] mb-1.5">Current Saved ($)</label>
                  <input type="number" min="0" value={newGoal.current} onChange={(e) => setNewGoal({...newGoal, current: e.target.value})} placeholder="0" className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-3 text-[14px] text-white focus:outline-none focus:border-[#3b82f6] transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-[#e4e4e7] mb-1.5">Monthly Target ($)</label>
                  <input type="number" min="0" value={newGoal.monthlyTarget} onChange={(e) => setNewGoal({...newGoal, monthlyTarget: e.target.value})} placeholder="500" className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-3 text-[14px] text-white focus:outline-none focus:border-[#3b82f6] transition-all" />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#e4e4e7] mb-1.5">Timeline</label>
                  <input type="text" value={newGoal.timeline} onChange={(e) => setNewGoal({...newGoal, timeline: e.target.value})} placeholder="e.g. Dec 2024" className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-3 text-[14px] text-white focus:outline-none focus:border-[#3b82f6] transition-all" />
                </div>
              </div>
              
              <div>
                <label className="block text-[13px] font-semibold text-[#e4e4e7] mb-3">Theme Color</label>
                <div className="flex gap-3">
                  {['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'].map(color => (
                    <button type="button" key={color} onClick={() => setNewGoal({...newGoal, color})} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${newGoal.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#09090b] scale-110' : 'hover:scale-110'}`} style={{ backgroundColor: color }}>
                      {newGoal.color === color && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 bg-[#18181b] hover:bg-[#27272a] text-white py-3 rounded-xl text-[13px] font-semibold transition-colors border border-[#3f3f46]">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-[#3b82f6] hover:bg-[#2563eb] text-white py-3 rounded-xl text-[13px] font-semibold transition-colors shadow-[0_4px_12px_rgba(59,130,246,0.3)]">
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeActionPlan && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#09090b] border border-[#27272a] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col animate-fade-in-up">
            <div className="p-6 border-b border-[#27272a] flex items-center justify-between bg-gradient-to-r from-[#8b5cf6]/10 to-transparent">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#8b5cf6]/20 border border-[#8b5cf6]/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#8b5cf6]" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-xl">AI Action Plan</h2>
                  <p className="text-[#a1a1aa] text-[13px]">Optimized path for: <strong className="text-white">{activeActionPlan.name}</strong></p>
                </div>
              </div>
              <button onClick={() => setActiveActionPlan(null)} className="p-2 text-[#71717a] hover:text-white hover:bg-[#18181b] rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto max-h-[70vh] space-y-6 custom-scrollbar">
              <div className="p-5 rounded-xl border border-[#27272a] bg-[#18181b] flex items-start gap-4">
                <Info className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                   <h3 className="text-white font-semibold mb-1 text-[15px]">Current Trajectory</h3>
                   <p className="text-[#a1a1aa] text-[13px] leading-relaxed">
                     Based on your current monthly contribution of <span className="text-white font-semibold">${activeActionPlan.monthlyTarget.toLocaleString()}</span>, you are on track to reach your <span className="text-white font-semibold">${activeActionPlan.target.toLocaleString()}</span> goal by <span className="text-emerald-500 font-semibold">{activeActionPlan.timeline}</span>.
                   </p>
                </div>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-4 text-[16px] flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#8b5cf6]" /> Recommended Actions
                </h3>
                
                <div className="space-y-3">
                  <div className="flex gap-4 p-5 rounded-xl border border-[#27272a] bg-[#18181b] hover:border-[#3f3f46] transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <span className="text-blue-500 font-bold text-[13px]">1</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1 text-[15px]">Optimize Monthly Contribution</h4>
                      <p className="text-[#a1a1aa] text-[13px] leading-relaxed mb-3">
                        By redirecting $200 from your Dining Out budget (which was 12% higher last month), you could increase your monthly contribution to <strong className="text-white">${(activeActionPlan.monthlyTarget + 200).toLocaleString()}</strong>, reaching your goal 3 months faster.
                      </p>
                      <button className="bg-[#27272a] hover:bg-[#3f3f46] text-white px-4 py-2 rounded-lg text-[12px] font-semibold transition-colors">Apply Strategy</button>
                    </div>
                  </div>

                  <div className="flex gap-4 p-5 rounded-xl border border-[#27272a] bg-[#18181b] hover:border-[#3f3f46] transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                      <span className="text-blue-500 font-bold text-[13px]">2</span>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1 text-[15px]">High-Yield Savings Switch</h4>
                      <p className="text-[#a1a1aa] text-[13px] leading-relaxed mb-3">
                        Moving your current <strong className="text-white">${activeActionPlan.current.toLocaleString()}</strong> to a High-Yield Savings Account (HYSA) earning 4.5% APY would generate approximately <strong className="text-emerald-500">${(activeActionPlan.current * 0.045).toFixed(0)}</strong> in risk-free interest over the next year.
                      </p>
                      <button className="bg-[#27272a] hover:bg-[#3f3f46] text-white px-4 py-2 rounded-lg text-[12px] font-semibold transition-colors">Compare HYSA Rates</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-[#27272a] bg-[#09090b] flex justify-end shrink-0">
              <button onClick={() => setActiveActionPlan(null)} className="bg-[#18181b] hover:bg-[#27272a] text-white px-6 py-2.5 rounded-xl text-[13px] font-semibold transition-colors border border-[#3f3f46]">
                Close Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { GoalPlanner };
