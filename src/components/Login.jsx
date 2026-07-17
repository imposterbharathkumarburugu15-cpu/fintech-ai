// src/components/Login.jsx
// Email + password login / signup screen, styled to match FinPilot's dark UI.
// Email confirmation is OFF, so signUp logs the user straight in.

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { supabase } from "../supabaseClient";

export function Login() {
  const [mode, setMode] = useState("login");   // 'login' | 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },  // stored in auth metadata; our trigger copies it to profiles
        });
        if (error) throw error;
        // with email confirmation OFF, signUp also creates a session.
        // onAuthStateChange in App will detect it and swap to the app.
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#040405] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg">
            F
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-[18px] leading-tight tracking-tight">FinPilot AI</span>
            <span className="text-[#3b82f6] text-[9px] font-bold tracking-widest uppercase">AI Financial OS</span>
          </div>
        </div>

        <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-[#3b82f6]" />
            <h1 className="text-white font-semibold text-xl">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
          </div>
          <p className="text-[#71717a] text-[13px] mb-6">
            {mode === "login" ? "Log in to your financial copilot." : "Start managing your finances with AI."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-[13px] font-medium text-[#a1a1aa] mb-1.5">Full Name</label>
                <input
                  type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#121214] border border-[#27272a] text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#3b82f6] placeholder:text-[#52525b]"
                  placeholder="Your name"
                />
              </div>
            )}
            <div>
              <label className="block text-[13px] font-medium text-[#a1a1aa] mb-1.5">Email</label>
              <input
                type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#121214] border border-[#27272a] text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#3b82f6] placeholder:text-[#52525b]"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#a1a1aa] mb-1.5">Password</label>
              <input
                type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#121214] border border-[#27272a] text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#3b82f6] placeholder:text-[#52525b]"
                placeholder="At least 6 characters"
              />
            </div>

            {error && <p className="text-[#ef4444] text-[13px]">{error}</p>}

            <button type="submit" disabled={busy}
              className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50">
              {busy ? "Please wait…" : mode === "login" ? "Log In" : "Sign Up"}
            </button>
          </form>

          <div className="mt-6 text-center text-[13px] text-[#71717a]">
            {mode === "login" ? (
              <>Don't have an account?{" "}
                <button onClick={() => { setMode("signup"); setError(null); }} className="text-[#3b82f6] hover:text-[#60a5fa] font-medium">Sign up</button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button onClick={() => { setMode("login"); setError(null); }} className="text-[#3b82f6] hover:text-[#60a5fa] font-medium">Log in</button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}