import { useState } from "react";
import { Sparkles, ShieldCheck, Mail, Lock, User, ArrowRight, Info } from "lucide-react";
import { supabase } from "../supabaseClient";
import { motion } from "framer-motion";

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
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#050505] flex items-center justify-center p-6 font-sans selection:bg-blue-500/30">
      
      {/* Background Glow Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] -left-[10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[25%] -right-[10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* LOGO AREA */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-2xl shadow-blue-900/40 mb-4">
            <span className="text-2xl font-black text-white">F</span>
          </div>
          <h2 className="text-white font-bold text-2xl tracking-tighter">FinPilot AI</h2>
          <span className="text-[10px] font-black tracking-[0.4em] text-blue-500 uppercase mt-1">Financial Operating System</span>
        </div>

        {/* DEMO CREDENTIALS BOX */}
        <div className="mb-6 p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Institutional Demo Access</p>
            <p className="text-xs text-zinc-400">
              User: <span className="text-white font-mono">user@gmail.com</span><br/>
              Pass: <span className="text-white font-mono">123456</span>
            </p>
          </div>
        </div>

        {/* MAIN AUTH CARD */}
        <div className="bg-[#0c0c0e]/80 border border-white/5 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <h1 className="text-white font-bold text-xl tracking-tight">
              {mode === "login" ? "Executive Login" : "Initialize Account"}
            </h1>
          </div>
          <p className="text-zinc-500 text-sm mb-8 font-medium">
            {mode === "login" ? "Enter your terminal access keys." : "Configure your AI financial profile."}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "signup" && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Full Identity</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white/[0.03] border border-white/10 text-white text-sm rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-zinc-700"
                    placeholder="Full Name"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Secure Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 text-white text-sm rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-zinc-700"
                  placeholder="name@institution.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Access Key</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 text-white text-sm rounded-xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-zinc-700"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                <p className="text-rose-400 text-[11px] font-medium">{error}</p>
              </motion.div>
            )}

            <button 
              type="submit" 
              disabled={busy}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all disabled:opacity-50 shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2 group"
            >
              {busy ? (
                <div className="h-5 w-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span className="text-xs uppercase tracking-[0.2em]">{mode === "login" ? "Authorize Terminal" : "Initialize Setup"}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* TOGGLE MODE */}
          <div className="mt-8 text-center">
            <button 
              onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); }} 
              className="text-[11px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors"
            >
              {mode === "login" ? "Register New Identifier" : "Return to Secure Login"}
            </button>
          </div>
        </div>

        {/* SECURITY FOOTER */}
        <div className="mt-10 flex items-center justify-center gap-4 text-zinc-600">
           <div className="flex items-center gap-1.5">
             <ShieldCheck className="w-3.5 h-3.5" />
             <span className="text-[10px] font-bold uppercase tracking-widest">AES-256 Encrypted</span>
           </div>
           <div className="h-3 w-px bg-white/5" />
           <span className="text-[10px] font-bold uppercase tracking-widest">Supabase Auth v2</span>
        </div>
      </motion.div>
    </div>
  );
}