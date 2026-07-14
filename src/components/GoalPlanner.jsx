import React, { useState } from "react";
import { Target, TrendingUp, Calendar, ArrowRight, X, Sparkles, Plus, Check } from "lucide-react";

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

  return <div className="max-w-[1000px] mx-auto flex flex-col h-full">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-[40px] font-semibold text-white tracking-[-0.02em] mb-2 leading-none">Goal Planner</h1>
          <p className="text-[#a1a1aa] text-[16px]">Track savings targets and AI action plans.</p>
        </div>
        <button onClick={() => setIsCreateModalOpen(true)} className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal) => {
    const percentage = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
    return <div key={goal.id} className="bg-[#18181b] border border-[#27272a] rounded-2xl p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#27272a] flex items-center justify-center" style={{ color: goal.color }}>
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-[16px]">{goal.name}</h3>
                    <p className="text-[#a1a1aa] text-sm">Target: ${goal.target.toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-semibold text-white">${goal.current.toLocaleString()}</div>
                  <div className="text-sm text-[#a1a1aa]">{percentage.toFixed(1)}% completed</div>
                </div>
              </div>

              <div className="w-full bg-[#27272a] rounded-full h-2.5 mb-6 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, percentage)}%`, backgroundColor: goal.color }} />
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-[#27272a] pt-6">
                <div>
                  <div className="text-[#a1a1aa] text-xs uppercase tracking-wider font-semibold mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Timeline
                  </div>
                  <div className="text-white font-medium">{goal.timeline}</div>
                </div>
                <div>
                  <div className="text-[#a1a1aa] text-xs uppercase tracking-wider font-semibold mb-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Monthly Target
                  </div>
                  <div className="text-white font-medium">${goal.monthlyTarget.toLocaleString()}</div>
                </div>
              </div>

              <div onClick={() => setActiveActionPlan(goal)} className="mt-6 bg-[#202022] rounded-xl p-4 flex justify-between items-center group cursor-pointer border border-transparent hover:border-[#3f3f46] transition-colors">
                <div className="flex items-center gap-2 text-sm text-[#e4e4e7]">
                  <Sparkles className="w-4 h-4 text-[#8b5cf6]" />
                  View AI Action Plan
                </div>
                <ArrowRight className="w-4 h-4 text-[#a1a1aa] group-hover:text-white transition-colors" />
              </div>
            </div>;
  })}
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#09090b] border border-[#27272a] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#27272a] flex items-center justify-between">
              <h2 className="text-white font-semibold text-lg">Create New Goal</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-[#71717a] hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateGoal} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#e4e4e7] mb-1.5">Goal Name</label>
                <input required type="text" value={newGoal.name} onChange={(e) => setNewGoal({...newGoal, name: e.target.value})} placeholder="e.g. Vacation Fund" className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#3b82f6] transition-colors" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#e4e4e7] mb-1.5">Target Amount ($)</label>
                  <input required type="number" min="0" value={newGoal.target} onChange={(e) => setNewGoal({...newGoal, target: e.target.value})} placeholder="10000" className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#3b82f6] transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#e4e4e7] mb-1.5">Current Saved ($)</label>
                  <input type="number" min="0" value={newGoal.current} onChange={(e) => setNewGoal({...newGoal, current: e.target.value})} placeholder="0" className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#3b82f6] transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#e4e4e7] mb-1.5">Monthly Target ($)</label>
                  <input type="number" min="0" value={newGoal.monthlyTarget} onChange={(e) => setNewGoal({...newGoal, monthlyTarget: e.target.value})} placeholder="500" className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#3b82f6] transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#e4e4e7] mb-1.5">Timeline</label>
                  <input type="text" value={newGoal.timeline} onChange={(e) => setNewGoal({...newGoal, timeline: e.target.value})} placeholder="e.g. Dec 2024" className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-[#3b82f6] transition-colors" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#e4e4e7] mb-2">Color Label</label>
                <div className="flex gap-3">
                  {['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map(color => (
                    <button type="button" key={color} onClick={() => setNewGoal({...newGoal, color})} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${newGoal.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#09090b] scale-110' : ''}`} style={{ backgroundColor: color }}>
                      {newGoal.color === color && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 bg-[#202022] hover:bg-[#27272a] text-white py-2.5 rounded-xl text-sm font-medium transition-colors border border-[#3f3f46]">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-[#3b82f6] hover:bg-[#2563eb] text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeActionPlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#09090b] border border-[#27272a] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-[#27272a] flex items-center justify-between bg-gradient-to-r from-[#8b5cf6]/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#8b5cf6]/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-[#8b5cf6]" />
                </div>
                <div>
                  <h2 className="text-white font-semibold text-lg">AI Action Plan</h2>
                  <p className="text-[#a1a1aa] text-sm">For {activeActionPlan.name}</p>
                </div>
              </div>
              <button onClick={() => setActiveActionPlan(null)} className="text-[#71717a] hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
              <div className="p-5 rounded-xl border border-[#27272a] bg-[#18181b]">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" /> Current Trajectory
                </h3>
                <p className="text-[#a1a1aa] text-sm leading-relaxed">
                  Based on your current monthly contribution of <span className="text-white font-medium">${activeActionPlan.monthlyTarget.toLocaleString()}</span>, you are on track to reach your <span className="text-white font-medium">${activeActionPlan.target.toLocaleString()}</span> goal by <span className="text-emerald-500 font-medium">{activeActionPlan.timeline}</span>.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#8b5cf6]" /> Recommended Actions
                </h3>
                
                <div className="flex gap-4 p-4 rounded-xl border border-[#27272a] bg-[#18181b] hover:border-[#3f3f46] transition-colors">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-blue-500 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">Increase Monthly Contribution</h4>
                    <p className="text-[#a1a1aa] text-sm leading-relaxed">
                      By redirecting $200 from your Dining Out budget (which was 12% higher last month), you could increase your monthly contribution to ${(activeActionPlan.monthlyTarget + 200).toLocaleString()}, reaching your goal 3 months faster.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-xl border border-[#27272a] bg-[#18181b] hover:border-[#3f3f46] transition-colors">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-blue-500 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-1">High-Yield Savings</h4>
                    <p className="text-[#a1a1aa] text-sm leading-relaxed">
                      Moving your current ${activeActionPlan.current.toLocaleString()} to a High-Yield Savings Account (HYSA) earning 4.5% APY would generate approximately ${(activeActionPlan.current * 0.045).toFixed(0)} in interest over the next year.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-[#27272a] bg-[#18181b] flex justify-end">
              <button onClick={() => setActiveActionPlan(null)} className="bg-[#27272a] hover:bg-[#3f3f46] text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
                Close Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>;
}
export {
  GoalPlanner
};

