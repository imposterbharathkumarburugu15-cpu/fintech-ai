// src/components/GoalTracker.tsx

import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { X, Plus, Target, CheckCircle } from 'lucide-react';

interface Goal {
  id: string;
  name: string;
  target_amount: number;
  progress: number;
  created_at: string;
}

interface GoalTrackerProps {
  userId: string;
  onGoalUpdate?: () => void;
}

const GoalTracker: React.FC<GoalTrackerProps> = ({ userId, onGoalUpdate }) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', target_amount: 0 });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId && supabase && isSupabaseConfigured) {
      fetchGoals();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const fetchGoals = async () => {
    if (!supabase || !isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (err: any) {
      console.error('Error fetching goals:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!supabase || !isSupabaseConfigured) {
      setError('Supabase not configured');
      return;
    }

    if (!newGoal.name || newGoal.target_amount <= 0) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('goals')
        .insert([
          {
            user_id: userId,
            name: newGoal.name,
            target_amount: newGoal.target_amount,
            progress: 0
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setGoals([data, ...goals]);
      setShowModal(false);
      setNewGoal({ name: '', target_amount: 0 });
      setError(null);
      if (onGoalUpdate) onGoalUpdate();
    } catch (err: any) {
      console.error('Error adding goal:', err);
      setError(err.message);
    }
  };

  const handleUpdateProgress = async (goalId: string, progress: number) => {
    if (!supabase || !isSupabaseConfigured) return;

    try {
      const { error } = await supabase
        .from('goals')
        .update({ progress: Math.min(Math.max(progress, 0), 100) })
        .eq('id', goalId);

      if (error) throw error;

      setGoals(goals.map(g => 
        g.id === goalId ? { ...g, progress: Math.min(Math.max(progress, 0), 100) } : g
      ));
      if (onGoalUpdate) onGoalUpdate();
    } catch (err: any) {
      console.error('Error updating goal:', err);
      setError(err.message);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!supabase || !isSupabaseConfigured) return;

    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      setGoals(goals.filter(g => g.id !== goalId));
      if (onGoalUpdate) onGoalUpdate();
    } catch (err: any) {
      console.error('Error deleting goal:', err);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Goal Tracker</h2>
            <p className="text-sm text-gray-400">Track your financial goals</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Goal
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/20 border border-red-800/30 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {goals.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
            <Target className="w-8 h-8 text-gray-600" />
          </div>
          <p className="text-gray-400">No goals set yet</p>
          <p className="text-gray-500 text-sm mt-2">Start by adding your first financial goal</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => {
            const progress = goal.progress || 0;
            const remaining = goal.target_amount * (100 - progress) / 100;
            const achieved = progress >= 100;

            return (
              <div
                key={goal.id}
                className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 hover:border-gray-600 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-white font-semibold">{goal.name}</h3>
                      {achieved && (
                        <span className="px-2 py-0.5 bg-green-900/50 text-green-400 text-xs rounded-full flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Achieved!
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">
                      Target: ₹{goal.target_amount.toLocaleString()}
                    </p>
                    <div className="mt-2">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-400">Progress</span>
                        <span className="font-medium text-blue-400">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all bg-blue-500"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="mt-2 flex gap-4 text-sm">
                      <span className="text-gray-500">
                        Remaining: ₹{Math.round(remaining).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 ml-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progress}
                      onChange={(e) => handleUpdateProgress(goal.id, Number(e.target.value))}
                      className="w-32 accent-blue-600"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateProgress(goal.id, Math.min(progress + 10, 100))}
                        className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-xs text-gray-300 rounded transition"
                      >
                        +10%
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="p-1 text-gray-500 hover:text-red-400 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">Create New Goal</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddGoal} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-1">
                  Goal Name
                </label>
                <input
                  type="text"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  placeholder="e.g., BMW Car, Emergency Fund"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-600 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-1">
                  Target Amount (₹)
                </label>
                <input
                  type="number"
                  value={newGoal.target_amount || ''}
                  onChange={(e) => setNewGoal({ ...newGoal, target_amount: Number(e.target.value) })}
                  placeholder="e.g., 500000"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-600 transition"
                  required
                  min="1"
                />
              </div>

              {error && (
                <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition"
                >
                  Create Goal
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2.5 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalTracker;