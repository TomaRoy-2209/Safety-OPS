"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";

export default function ResponderDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("active"); // active, busy, offline

  useEffect(() => {
    // Basic User Load
    const token = localStorage.getItem("jwt");
    fetch("http://localhost:1801/api/auth/profile", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUser(data.user || data))
      .catch(err => console.error(err));
  }, []);

  return (
    <DashboardLayout title="UNIT CONTROL PANEL">
      
      <div className="space-y-8">
        
        {/* 1. STATUS CONTROLLER (The core feature of this page) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Status Switcher */}
            <div className="bg-[#0a0a0a] border border-gray-800 p-8 rounded-xl relative overflow-hidden">
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Set Operational Status</h3>
                
                <div className="flex gap-4">
                    <button 
                        onClick={() => setStatus('active')}
                        className={`flex-1 py-4 rounded-lg font-bold border transition-all ${
                            status === 'active' 
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]' 
                            : 'bg-[#111] text-gray-500 border-gray-800 hover:border-gray-600'
                        }`}
                    >
                        AVAILABLE
                    </button>
                    <button 
                        onClick={() => setStatus('busy')}
                        className={`flex-1 py-4 rounded-lg font-bold border transition-all ${
                            status === 'busy' 
                            ? 'bg-red-600 text-white border-red-500 shadow-[0_0_20px_rgba(220,38,38,0.4)]' 
                            : 'bg-[#111] text-gray-500 border-gray-800 hover:border-gray-600'
                        }`}
                    >
                        BUSY / EN ROUTE
                    </button>
                </div>

                <p className="mt-4 text-xs text-gray-500 font-mono">
                    CURRENT STATE: <span className="text-white uppercase">{status}</span> // LAST UPDATED: {new Date().toLocaleTimeString()}
                </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
                <div 
                    onClick={() => router.push('/live-feed')}
                    className="bg-blue-900/10 border border-blue-500/20 hover:bg-blue-900/20 hover:border-blue-500/50 p-6 rounded-xl cursor-pointer transition-all flex flex-col justify-center items-center text-center group"
                >
                    <svg className="w-10 h-10 text-blue-500 mb-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    <h3 className="text-white font-bold">Open Live Feed</h3>
                    <p className="text-xs text-blue-400 mt-1">View All Incidents</p>
                </div>

                <div 
                    onClick={() => router.push('/map')}
                    className="bg-purple-900/10 border border-purple-500/20 hover:bg-purple-900/20 hover:border-purple-500/50 p-6 rounded-xl cursor-pointer transition-all flex flex-col justify-center items-center text-center group"
                >
                    <svg className="w-10 h-10 text-purple-500 mb-3 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                    <h3 className="text-white font-bold">Tactical Map</h3>
                    <p className="text-xs text-purple-400 mt-1">GPS Navigation</p>
                </div>
            </div>
        </div>

        {/* 2. CURRENT ASSIGNMENT (Simulated) */}
        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-8">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-bold text-white">Current Mission Directive</h3>
                    <p className="text-sm text-gray-500">Assignments dispatched directly from Command.</p>
                </div>
                {status === 'busy' ? (
                     <span className="px-3 py-1 bg-red-500/20 text-red-500 text-xs font-bold uppercase rounded border border-red-500/30 animate-pulse">
                        Mission Active
                     </span>
                ) : (
                    <span className="px-3 py-1 bg-gray-800 text-gray-500 text-xs font-bold uppercase rounded border border-gray-700">
                        Standby
                    </span>
                )}
            </div>

            {/* Empty State / Active State Logic */}
            {status === 'busy' ? (
                <div className="bg-red-900/10 border border-red-500/30 rounded-lg p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-red-500/20 rounded-lg text-red-500">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        </div>
                        <div>
                            <h4 className="text-white font-bold text-lg">Fire Reported at Sector 4</h4>
                            <p className="text-red-400 text-sm font-mono">PRIORITY: CRITICAL // ID-4092</p>
                        </div>
                    </div>
                    <div className="h-1 bg-gray-800 rounded-full overflow-hidden mb-4">
                        <div className="h-full bg-red-500 w-2/3"></div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button className="text-xs font-bold text-gray-400 hover:text-white uppercase">Request Backup</button>
                        <button 
                            onClick={() => setStatus('active')}
                            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded text-xs font-bold"
                        >
                            MARK RESOLVED
                        </button>
                    </div>
                </div>
            ) : (
                <div className="border-2 border-dashed border-gray-800 rounded-lg p-12 text-center">
                    <div className="w-16 h-16 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-600">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <h4 className="text-gray-300 font-bold">No Active Assignments</h4>
                    <p className="text-gray-600 text-sm mt-1">Remain at station or patrol designated sector.</p>
                </div>
            )}
        </div>

      </div>
    </DashboardLayout>
  );
}