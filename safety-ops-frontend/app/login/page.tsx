"use client";
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("http://localhost:1801/api/auth/login", {
        email,
        password,
      });

      // 🔍 DEBUG: Check exactly what the backend sends
      console.log("🔐 LOGIN RESPONSE STRUCTURE:", res.data);

      // 🛡️ SAFETY CHECK: Find the data wherever it is hiding
      // Some backends send { access_token: ... }, others send { token: ... }
      const token = res.data.access_token || res.data.token;
      
      // Some backends send { user: ... }, others send { data: { user: ... } }
      const user = res.data.user || (res.data.data ? res.data.data.user : null);

      if (!token || !user) {
         console.error("❌ Login succeeded but data is missing!", res.data);
         setError("Login Error: Server response format invalid.");
         setLoading(false);
         return;
      }

      // Save to Storage
      localStorage.setItem("jwt", token);
      
      // ✅ Now this line won't crash because we checked 'user' exists above
      localStorage.setItem("role", user.role); 
      
      if (user.unit) {
          localStorage.setItem("unit", user.unit);
      }

      // 3. SMART REDIRECT LOGIC
      // If user is admin -> Go to Admin Dashboard
      if (user.role === 'admin') {
        router.push('/admin-dashboard');
      } 
      // If user is responder -> Go to Dispatch
      else if (user.role === 'responder') {
        router.push('/dispatch');
      }
      // If user is citizen -> Go to My Reports
      else {
        router.push('/dashboard');
      }

    } catch (err) {
      console.error("Login Failed", err);
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

    return (
        <main className="h-screen w-full flex items-center justify-center bg-[#020617] relative overflow-hidden">
            
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>

            <div className="w-full max-w-md p-8 bg-[#0a0a0a] border border-gray-800 rounded-2xl shadow-2xl relative z-10">
                
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-blue-600/20 text-blue-500 rounded-xl flex items-center justify-center border border-blue-600/30 mx-auto mb-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white tracking-wide">
                        SAFETY<span className="text-blue-500">OPS</span>
                    </h1>
                    <p className="text-gray-500 text-sm mt-2">Secure Command Uplink</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    
                    {error && (
                        <div className="p-3 bg-red-900/20 border border-red-500/50 rounded text-red-500 text-xs font-bold text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 ml-1">Identity (Email)</label>
                        <input 
                            type="email" 
                            required
                            className="w-full bg-[#111] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            placeholder="officer@safetyops.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1 ml-1">Access Key (Password)</label>
                        <input 
                            type="password" 
                            required
                            className="w-full bg-[#111] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-900/20 transition-all transform active:scale-95"
                    >
                        {loading ? 'AUTHENTICATING...' : 'INITIATE SESSION'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-600 text-xs">
                        Don't have clearance? <Link href="/register" className="text-blue-500 hover:text-blue-400 font-bold">Register Citizen ID</Link>
                    </p>
                </div>
            </div>
        </main>
    );
}