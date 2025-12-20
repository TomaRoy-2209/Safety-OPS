"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from 'axios';
import DashboardLayout from "../components/DashboardLayout";
import IntelViewer from "../components/IntelViewer";
import Link from 'next/link'; 
import { requestForToken, onMessageListener } from '../../firebase'; // ✅ 1. Import This

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, active: 0, resolved: 0 });
  const [recentIncidents, setRecentIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get Token
    const token = localStorage.getItem("jwt");
    const role = localStorage.getItem("role");

    // 2. Security Check
    if (!token || role !== "admin") {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const profileReq = await axios.get("http://localhost:1801/api/auth/profile", config);
            const incidentsReq = await axios.get("http://localhost:1801/api/incidents", config);

            setUser(profileReq.data.user || profileReq.data);

            const allIncidents = Array.isArray(incidentsReq.data) ? incidentsReq.data : incidentsReq.data.data;
            
            setStats({
                total: allIncidents.length,
                pending: allIncidents.filter(i => i.status === 'pending').length,
                active: allIncidents.filter(i => i.status === 'dispatched').length,
                resolved: allIncidents.filter(i => i.status === 'resolved').length,
            });

            setRecentIncidents(allIncidents.slice(0, 4));
            setLoading(false);

        } catch (error) {
            console.error("Dashboard Load Error:", error);
            if (error.response && error.response.status === 401) {
                alert("Session Expired. Please login again.");
                localStorage.removeItem('jwt');
                localStorage.removeItem('role');
                window.location.href = '/login'; 
            }
            setLoading(false);
        }
    };

    // ✅ 3. NEW: Token Sync Logic
    // This runs in the background to ensure 'fcm_token' is filled in the DB
    const syncToken = async () => {
        if (typeof window !== 'undefined') {
            await requestForToken(); 
        }
    };

    fetchData();
    syncToken(); // <--- Execute Sync

  }, [router]);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#020617] text-blue-500 font-mono animate-pulse">
        ESTABLISHING COMMAND UPLINK...
    </div>
  );

  return (
    <DashboardLayout title="COMMAND OVERVIEW">
      
      {selectedIncident && (
        <IntelViewer 
            incident={selectedIncident} 
            onClose={() => setSelectedIncident(null)} 
        />
      )}

      <div className="space-y-8">
        
        {/* STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#0a0a0a] border border-gray-800 p-4 rounded-xl flex flex-col items-center justify-center shadow-lg">
                <span className="text-gray-500 text-[10px] uppercase tracking-widest font-bold mb-1">Total Signals</span>
                <span className="text-3xl font-mono text-white font-bold">{stats.total}</span>
            </div>
            <div className="bg-[#0a0a0a] border border-red-900/30 p-4 rounded-xl flex flex-col items-center justify-center shadow-lg shadow-red-900/10">
                <span className="text-red-500 text-[10px] uppercase tracking-widest font-bold mb-1">Danger / Pending</span>
                <span className="text-3xl font-mono text-red-500 font-bold">{stats.pending}</span>
            </div>
            <div className="bg-[#0a0a0a] border border-blue-900/30 p-4 rounded-xl flex flex-col items-center justify-center shadow-lg shadow-blue-900/10">
                <span className="text-blue-500 text-[10px] uppercase tracking-widest font-bold mb-1">Units Deployed</span>
                <span className="text-3xl font-mono text-blue-500 font-bold">{stats.active}</span>
            </div>
            <div className="bg-[#0a0a0a] border border-green-900/30 p-4 rounded-xl flex flex-col items-center justify-center shadow-lg shadow-green-900/10">
                <span className="text-green-500 text-[10px] uppercase tracking-widest font-bold mb-1">Resolved</span>
                <span className="text-3xl font-mono text-green-500 font-bold">{stats.resolved}</span>
            </div>
        </div>

        {/* WELCOME & RECENT ACTIVITY */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left: Welcome Panel */}
            <div className="lg:col-span-2 bg-[#0a0a0a]/80 backdrop-blur-md border border-gray-800 rounded-xl p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <svg className="w-40 h-40 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Welcome back, {user?.name}</h2>
                <p className="text-gray-400 mb-6 max-w-lg leading-relaxed">
                    System integrity is optimal. You have <span className="text-white font-bold">{stats.pending} pending incidents</span> requiring immediate review and dispatch assignment.
                </p>
                <div className="flex gap-4 relative z-10">
                      <button onClick={() => router.push('/dispatch')} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold text-sm transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2">
                        <span>GO TO DISPATCH</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                      </button>
                      <button onClick={() => router.push('/map')} className="bg-[#1a1a1a] hover:bg-[#222] border border-gray-700 text-gray-300 px-6 py-2 rounded-lg font-bold text-sm transition-all">
                        VIEW LIVE MAP
                      </button>
                      
                      {/* ✅ 4. NEW: DISASTER BUTTON */}
                      <Link href="/admin/disaster">
                        <button className="bg-red-900/30 hover:bg-red-600 border border-red-800 text-red-200 px-6 py-2 rounded-lg font-bold text-sm transition-all shadow-[0_0_10px_rgba(220,38,38,0.2)] flex items-center gap-2">
                            <span>⚠️ EMERGENCY</span>
                        </button>
                      </Link>
                </div>
            </div>

            {/* Right: Recent Alerts Feed */}
            <div className="bg-[#0a0a0a]/80 backdrop-blur-md border border-gray-800 rounded-xl p-6 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest">Recent Activity</h3>
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </div>

                <div className="space-y-3 flex-1 overflow-auto max-h-[300px] pr-2 custom-scrollbar">
                    {recentIncidents.length === 0 ? (
                        <p className="text-gray-600 text-sm text-center py-4">No recent activity.</p>
                    ) : (
                        recentIncidents.map(incident => (
                            <div 
                                key={incident.id} 
                                onClick={() => setSelectedIncident(incident)}
                                className="p-3 bg-[#111] hover:bg-[#1a1a1a] border border-gray-800 rounded-lg cursor-pointer transition-colors group"
                            >
                                <div className="flex justify-between items-start">
                                    <h4 className="text-white text-sm font-bold truncate pr-2 group-hover:text-blue-400">{incident.title}</h4>
                                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                        incident.status === 'pending' ? 'bg-red-900/30 text-red-500' : 'bg-blue-900/30 text-blue-500'
                                    }`}>
                                        {incident.status}
                                    </span>
                                </div>
                                <div className="flex justify-between items-end mt-2">
                                    <span className="text-[10px] text-gray-500 font-mono">ID-#{incident.id}</span>
                                    <span className="text-[10px] text-blue-500 group-hover:underline">View Evidence &rarr;</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>
      </div>
    </DashboardLayout>
  );
}