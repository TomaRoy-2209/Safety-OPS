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
        setError('');

        // 👇 FIX: Use the Environment Variable for the URL
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1801';

        try {
            const res = await axios.post(`${API_URL}/api/auth/login`, {
                email,
                password
            });

            // 1. Save Token & Role
            localStorage.setItem('jwt', res.data.token);
            localStorage.setItem('role', res.data.user.role);
            localStorage.setItem('user_id', res.data.user.id);

            // 2. Redirect based on Role
            const role = res.data.user.role;

            if (role === 'admin') {
                router.push('/admin-dashboard');
            } 
            else if (role === 'responder') {
                router.push('/worker-dashboard');
            } 
            else if (role === 'worker') {
                router.push('/worker-dashboard');
            } 
            else {
                router.push('/dashboard');
            }

        } catch (err) {
            console.error(err);
            setError('Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        // --- MAIN CONTAINER ---
        <main className="min-h-screen flex flex-col items-center justify-center bg-[#020617] relative overflow-hidden isolate">
            
            {/* 1. Digital Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)] -z-30 pointer-events-none"></div>

            {/* 2. SONAR SCAN EFFECT CONTAINER */}
            <div className="absolute inset-0 flex items-center justify-center -z-20 pointer-events-none overflow-hidden">
                <div className="absolute border border-blue-500/30 h-[20rem] w-[20rem] rounded-full"></div>
                <div className="absolute border border-blue-500/20 h-[40rem] w-[40rem] rounded-full"></div>
                <div className="absolute border border-blue-500/10 h-[60rem] w-[60rem] rounded-full"></div>
                <div className="absolute border border-blue-900/30 h-[80rem] w-[80rem] rounded-full"></div>
                <div className="absolute h-[150vmax] w-[150vmax] animate-[spin_4s_linear_infinite]">
                    <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(59,130,246,0.5)_0deg,rgba(59,130,246,0.1)_15deg,transparent_60deg)]"></div>
                </div>
                <div className="absolute h-4 w-4 bg-blue-500 rounded-full animate-ping opacity-75"></div>
                <div className="absolute h-[30rem] w-[30rem] bg-blue-900/30 blur-[100px] rounded-full"></div>
            </div>
            
            {/* --- FORM CONTAINER --- */}
            <div className="w-full max-w-md p-1 z-10">
                <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-gray-800/50 rounded-xl shadow-2xl overflow-hidden relative">
                    
                    {/* Header */}
                    <div className="bg-[#111]/50 p-6 text-center border-b border-gray-800/50 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent -translate-x-full animate-[shimmer_3s_infinite]"></div>
                        <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20 relative z-10">
                            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-wide drop-shadow-lg relative z-10">SECURE LOGIN</h2>
                        <p className="text-gray-400 text-xs uppercase tracking-widest mt-1 relative z-10">SafeCity Operations Network</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="p-8 space-y-5">
                        
                        {/* Email Input */}
                        <div>
                            <label className="block text-xs font-bold text-blue-400 uppercase mb-2 ml-1">Identity (Email)</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="officer@safecity.com"
                                className="w-full bg-black/50 border border-gray-700 text-white rounded-lg p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-600"
                                required
                            />
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-xs font-bold text-blue-400 uppercase mb-2 ml-1">Access Key (Password)</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-black/50 border border-gray-700 text-white rounded-lg p-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder-gray-600"
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-2 mt-4 relative overflow-hidden group"
                        >
                             <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                             <div className="relative flex items-center justify-center gap-2">
                                {loading ? (
                                    <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                                    <span>AUTHENTICATING...</span>
                                    </>
                                ) : (
                                    "INITIATE SESSION"
                                )}
                            </div>
                        </button>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-red-900/20 border border-red-500/50 rounded flex items-center gap-2 text-red-400 text-sm animate-pulse">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                {error}
                            </div>
                        )}

                        {/* Footer Link */}
                        <p className="text-center text-gray-500 text-sm pt-4 border-t border-gray-800/50">
                            No Clearance? <Link href="/register" className="text-blue-400 hover:text-blue-300 font-bold ml-1 hover:underline transition-colors">Register Citizen ID</Link>
                        </p>

                    </form>
                </div>
            </div>
        </main>
    );
}