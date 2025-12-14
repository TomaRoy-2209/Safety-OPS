"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
        const res = await fetch("http://localhost:1801/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        
        if (data.token) {
            localStorage.setItem("jwt", data.token);
            localStorage.setItem("role", data.user.role);

            if (data.user.role === "admin") {
                router.push("/admin-dashboard");
            } else if (data.user.role === "responder") {
                router.push("/responder-dashboard");
            } else {
                router.push("/dashboard");
            }
        } else {
            setError(data.error || "Access Denied: Invalid Credentials");
        }
    } catch (err) {
        console.error(err);
        setError("System Error: Server Unreachable");
    } finally {
        setLoading(false);
    }
  }

  return (
    // --- MAIN CONTAINER ---
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#020617] relative overflow-hidden isolate">
      
      {/* 1. Digital Grid Overlay (Base Layer) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)] -z-30 pointer-events-none"></div>

      {/* 2. SONAR SCAN EFFECT CONTAINER */}
      <div className="absolute inset-0 flex items-center justify-center -z-20 pointer-events-none overflow-hidden">
          
          {/* A. Static Concentric Rings (The Radar Scope) */}
          <div className="absolute border border-blue-500/30 h-[20rem] w-[20rem] rounded-full"></div>
          <div className="absolute border border-blue-500/20 h-[40rem] w-[40rem] rounded-full"></div>
          <div className="absolute border border-blue-500/10 h-[60rem] w-[60rem] rounded-full"></div>
          <div className="absolute border border-blue-900/30 h-[80rem] w-[80rem] rounded-full"></div>
          
          {/* B. The Sweeping Scanner Arm */}
          {/* We make it huge so it covers the corners as it spins */}
          <div className="absolute h-[150vmax] w-[150vmax] animate-[spin_4s_linear_infinite]">
              <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(59,130,246,0.5)_0deg,rgba(59,130,246,0.1)_15deg,transparent_60deg)]"></div>
          </div>

          {/* C. Central "Ping" Pulse */}
          <div className="absolute h-4 w-4 bg-blue-500 rounded-full animate-ping opacity-75"></div>
          <div className="absolute h-[30rem] w-[30rem] bg-blue-900/30 blur-[100px] rounded-full"></div>
      </div>

      {/* --- FORM CONTAINER (Z-Index set to appear above background) --- */}
      <div className="w-full max-w-md p-1 z-10">
        {/* Card Container */}
        <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-gray-800/50 rounded-xl shadow-2xl overflow-hidden relative">
            
            {/* Header */}
            <div className="bg-[#111]/50 p-8 text-center border-b border-gray-800/50 relative overflow-hidden">
                {/* Subtle scanner line in header */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent -translate-x-full animate-[shimmer_3s_infinite]"></div>
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20 relative z-10">
                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                <h2 className="text-3xl font-bold text-white tracking-wide drop-shadow-lg relative z-10">SECURE LOGIN</h2>
                <p className="text-gray-400 text-xs uppercase tracking-widest mt-2 relative z-10">SafetyOps Command Access</p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="p-8 space-y-6">
                
                {/* Email Input */}
                <div className="group">
                    <label className="block text-xs font-bold text-blue-400 uppercase mb-2 ml-1 group-focus-within:text-blue-300 transition-colors">Identifier (Email)</label>
                    <div className="relative">
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="officer@safecity.com"
                            className="w-full bg-black/50 border border-gray-700 text-white rounded-lg p-3 pl-10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-600"
                            required
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        </div>
                    </div>
                </div>

                {/* Password Input */}
                <div className="group">
                    <label className="block text-xs font-bold text-blue-400 uppercase mb-2 ml-1 group-focus-within:text-blue-300 transition-colors">Access Key (Password)</label>
                    <div className="relative">
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-black/50 border border-gray-700 text-white rounded-lg p-3 pl-10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-600"
                            required
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-2 mt-2 relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <div className="relative flex items-center justify-center gap-2">
                        {loading ? (
                            <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                            <span>AUTHENTICATING...</span>
                            </>
                        ) : (
                            "AUTHENTICATE"
                        )}
                    </div>
                </button>

                {/* Error Message */}
                {error && (
                    <div className="p-3 bg-red-900/20 border border-red-500/50 rounded flex items-center gap-3 text-red-400 text-sm animate-pulse">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        <span>{error}</span>
                    </div>
                )}

                {/* Footer Link */}
                <p className="text-center text-gray-500 text-sm pt-4 border-t border-gray-800/50">
                    Need Access Clearance? <Link href="/register" className="text-blue-400 hover:text-blue-300 font-bold ml-1 hover:underline transition-colors">Register New ID</Link>
                </p>

            </form>
        </div>
      </div>
    </main>
  );
}