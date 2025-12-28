"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [role, setRole] = useState("citizen");
  const [phone, setPhone] = useState(""); 
  const [adminSecret, setAdminSecret] = useState(""); 
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Helper to check if role requires a secret code
  const isRestricted = role === 'admin' || role === 'responder';

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
        const res = await fetch("http://localhost:1801/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            password,
            password_confirmation: passwordConfirmation,
            role,
            phone,
            admin_secret: adminSecret, 
          })
        });

        const data = await res.json();
        
        if (res.ok) { 
          setSuccess("Identity Verified. Redirecting to Terminal...");
          setTimeout(() => {
            router.push("/login");
          }, 1500);
          
        } else {
          setError(data.error || "Registration Failed.");
        }
    } catch (err) {
        console.error(err);
        setError("System Connection Failed.");
    } finally {
        setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#020617] relative overflow-hidden isolate">
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)] -z-30 pointer-events-none"></div>
      <div className="absolute inset-0 flex items-center justify-center -z-20 pointer-events-none overflow-hidden">
          <div className="absolute border border-blue-500/20 h-[40rem] w-[40rem] rounded-full"></div>
          <div className="absolute h-[150vmax] w-[150vmax] animate-[spin_4s_linear_infinite]">
              <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(59,130,246,0.5)_0deg,rgba(59,130,246,0.1)_15deg,transparent_60deg)]"></div>
          </div>
      </div>
      
      <div className="w-full max-w-md p-1 z-10">
        <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-gray-800/50 rounded-xl shadow-2xl overflow-hidden relative">
            
            {/* Header */}
            <div className="bg-[#111]/50 p-6 text-center border-b border-gray-800/50">
                <h2 className="text-2xl font-bold text-white tracking-wide">NEW USER ACCESS</h2>
                <p className="text-gray-400 text-xs uppercase tracking-widest mt-1">SafeCity Operations Network</p>
            </div>

            <form onSubmit={handleRegister} className="p-8 space-y-5">
                
                {/* Basic Info */}
                <div>
                    <label className="block text-xs font-bold text-blue-400 uppercase mb-2 ml-1">Full Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-black/50 border border-gray-700 text-white rounded-lg p-3 focus:border-blue-500 outline-none" required />
                </div>
                <div>
                    <label className="block text-xs font-bold text-blue-400 uppercase mb-2 ml-1">Email Address</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black/50 border border-gray-700 text-white rounded-lg p-3 focus:border-blue-500 outline-none" required />
                </div>

                {/* ROLE SELECTION */}
                <div>
                    <label className="block text-xs font-bold text-blue-400 uppercase mb-2 ml-1">Clearance Level</label>
                    <select
                        value={role}
                        onChange={e => setRole(e.target.value)}
                        className="w-full bg-black/50 border border-gray-700 text-white rounded-lg p-3 focus:border-blue-500 outline-none cursor-pointer"
                    >
                        <option value="citizen">Citizen (Public)</option>
                        {/* ✅ ADDED BACK RESPONDER */}
                        <option value="responder">Emergency Responder</option>
                        <option value="admin">System Admin (Restricted)</option>
                    </select>
                </div>

                {/* 🔒 DYNAMIC SECURITY CHECK */}
                {/* Shows for BOTH Admin and Responder now */}
                {isRestricted && (
                    <div className={`animate-fadeIn p-4 rounded-lg border ${role === 'admin' ? 'bg-red-900/10 border-red-500/30' : 'bg-blue-900/10 border-blue-500/30'}`}>
                        <label className={`flex justify-between text-xs font-bold uppercase mb-2 ${role === 'admin' ? 'text-red-500' : 'text-blue-400'}`}>
                            <span>{role === 'admin' ? 'Master Admin Key' : 'Department Badge Code'}</span>
                            <span className="text-[10px] opacity-70">REQUIRED</span>
                        </label>
                        <input 
                            type="password" 
                            value={adminSecret} 
                            onChange={(e) => setAdminSecret(e.target.value)} 
                            placeholder={role === 'admin' ? "Enter Secret Key..." : "Enter Unit Code..."}
                            className={`w-full bg-black/50 rounded-lg p-3 outline-none shadow-inner ${role === 'admin' ? 'border border-red-500/50 text-red-200 focus:border-red-500' : 'border border-blue-500/50 text-blue-200 focus:border-blue-500'}`}
                            required
                        />
                    </div>
                )}

                {/* Password & Phone */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-blue-400 uppercase mb-2 ml-1">Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/50 border border-gray-700 text-white rounded-lg p-3 focus:border-blue-500 outline-none" required />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-blue-400 uppercase mb-2 ml-1">Confirm</label>
                        <input type="password" value={passwordConfirmation} onChange={e => setPasswordConfirmation(e.target.value)} className="w-full bg-black/50 border border-gray-700 text-white rounded-lg p-3 focus:border-blue-500 outline-none" required />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-blue-400 uppercase mb-2 ml-1">Mobile (Alerts)</label>
                    <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+88017..." className="w-full bg-black/50 border border-gray-700 text-white rounded-lg p-3 focus:border-blue-500 outline-none" />
                </div>

                {/* Submit */}
                <button 
                    type="submit" 
                    disabled={loading}
                    className={`w-full font-bold py-3 rounded-lg transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 mt-4 relative overflow-hidden group ${
                        role === 'admin' 
                        ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20' 
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20'
                    }`}
                >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                      <div className="relative flex items-center justify-center gap-2">
                        {loading ? "PROCESSING..." : (role === 'citizen' ? "INITIATE REGISTRATION" : "VERIFY & REGISTER")}
                    </div>
                </button>

                {/* Messages */}
                {error && (
                    <div className="p-3 bg-red-900/20 border border-red-500/50 rounded flex items-center gap-2 text-red-400 text-sm animate-pulse">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {error}
                    </div>
                )}
                {success && (
                    <div className="p-3 bg-green-900/20 border border-green-500/50 rounded flex items-center gap-2 text-green-400 text-sm animate-bounce">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        {success}
                    </div>
                )}

                <p className="text-center text-gray-500 text-sm pt-4 border-t border-gray-800/50">
                    Existing Personnel? <Link href="/login" className="text-blue-400 hover:text-blue-300 font-bold ml-1 hover:underline transition-colors">Secure Login</Link>
                </p>

            </form>
        </div>
      </div>
    </main>
  );
}