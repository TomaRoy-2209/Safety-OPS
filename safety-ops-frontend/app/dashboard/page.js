"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from 'axios';
import DashboardLayout from "../components/DashboardLayout"; 
import LiveChat from "../components/LiveChat"; 
import { requestForToken, onMessageListener } from '../../firebase';
import NearbyFeed from '../components/NearbyFeed';

export default function CitizenDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [myReports, setMyReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedIncident, setSelectedIncident] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    const role = localStorage.getItem('role');

    if (!token || role !== 'citizen') {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1801';
            
            const profileRes = await axios.get(`${API_URL}/api/auth/profile`, config);
            setUser(profileRes.data.user || profileRes.data);

            const emergencyRes = await axios.get(`${API_URL}/api/my-reports`, config);
            const maintenanceRes = await axios.get(`${API_URL}/api/maintenance/my-tickets`, config);

            const emergencyList = emergencyRes.data.map(item => ({ ...item, reportType: 'emergency' }));
            const maintenanceList = maintenanceRes.data.map(item => ({ ...item, reportType: 'maintenance' }));

            const combined = [...emergencyList, ...maintenanceList].sort((a, b) => 
                new Date(b.created_at) - new Date(a.created_at)
            );

            setMyReports(combined);
            setLoading(false);

        } catch (error) {
            console.error("Dashboard Error:", error);
            setLoading(false);
        }
    };

    const syncToken = async () => {
        if (typeof window !== 'undefined') {
            try { await requestForToken(); } catch (err) { console.error(err); }
        }
    };

    onMessageListener().then((payload) => {
        const title = payload?.notification?.title || "ALERT";
        const body = payload?.notification?.body || "Update Received";
        alert(`🔔 ${title}: ${body}`);
    }).catch((err) => console.log('failed: ', err));

    fetchData();
    syncToken();

  }, [router]);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#020617] text-blue-500 font-mono animate-pulse">
        AUTHENTICATING CITIZEN ID...
    </div>
  );

  return (
    <DashboardLayout title="CITIZEN COMMAND">
      
      {/* 1. WELCOME SECTION */}
      <div className="bg-[#0a0a0a]/80 backdrop-blur-md border border-gray-800 rounded-xl p-8 mb-8 relative overflow-hidden">
         <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome back, {user?.name}</h2>
            <p className="text-gray-400 mb-6 max-w-lg">
                You have <span className="text-white font-bold">{myReports.length} active reports</span>. 
            </p>
            
            {/* ACTION BUTTONS ROW */}
            <div className="flex flex-wrap gap-4">
                {/* Report Button */}
                <button 
                    onClick={() => router.push('/report')}
                    className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-red-900/20 transition-all flex items-center gap-2"
                >
                    <span>+ REPORT NEW ISSUE</span>
                </button>

                {/* ✅ SAFETY MAP BUTTON (NEW) */}
                <button 
                    onClick={() => router.push('/safety-map')}
                    className="bg-blue-900/30 hover:bg-blue-800/50 text-blue-300 border border-blue-800 px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2"
                >
                    <span className="text-xl">🗺️</span>
                    <span>VIEW SAFETY MAP</span>
                </button>
            </div>
         </div>
      </div>
      <div>
        <NearbyFeed />
      </div>

      {/* 2. REPORTS GRID */}
      <div className="space-y-4">
        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Incident & Maintenance Log</h3>
        
        {myReports.length === 0 ? (
            <div className="p-10 border border-dashed border-gray-800 rounded-xl text-center text-gray-600">
                No active reports.
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-4">
                {myReports.map(report => (
                    <div key={`${report.reportType}-${report.id}`} className="bg-[#0a0a0a] border border-gray-800 p-6 rounded-xl relative group hover:border-gray-600 transition-all">
                        
                        {/* --- TOP ROW: TITLE (Left) vs TAGS (Right) --- */}
                        <div className="flex justify-between items-start mb-4">
                            
                            {/* LEFT: Title & Status Dot */}
                            <div className="flex items-center gap-3">
                                <span className={`w-2 h-2 rounded-full shrink-0 ${
                                    report.status === 'pending' || report.status === 'open' ? 'bg-red-500 animate-pulse' : 
                                    report.status === 'dispatched' || report.status === 'in_progress' ? 'bg-blue-500' : 'bg-green-500'
                                }`}></span>
                                <h3 className="font-bold text-white text-lg leading-tight">{report.title}</h3>
                            </div>

                            {/* RIGHT: Badges (Corner) */}
                            <div className="flex flex-col items-end gap-2 pl-4">
                                {/* Type Badge */}
                                <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold tracking-wider ${
                                    report.reportType === 'emergency' 
                                    ? 'bg-red-900/20 text-red-500 border-red-900/30' 
                                    : 'bg-yellow-900/20 text-yellow-500 border-yellow-900/30'
                                }`}>
                                    {report.reportType === 'emergency' ? '🚨 EMERGENCY' : '🛠️ MAINTENANCE'}
                                </span>
                                
                                {/* Status Badge */}
                                <span className="text-[10px] bg-gray-900 text-gray-400 px-2 py-0.5 rounded border border-gray-800 uppercase font-mono">
                                    {report.status}
                                </span>
                            </div>
                        </div>

                        {/* --- MIDDLE: Description --- */}
                        <p className="text-sm text-gray-400 max-w-3xl mb-6 leading-relaxed">
                            {report.description}
                        </p>

                        {/* --- BOTTOM ROW: ID/Date (Left) vs Actions (Right) --- */}
                        <div className="flex justify-between items-end border-t border-gray-800/50 pt-4 mt-2">
                            <span className="text-xs text-gray-600 font-mono">
                                ID: #{report.id} • {new Date(report.created_at).toLocaleDateString()}
                            </span>

                            {/* ACTION BUTTON (Bottom Right) */}
                            {report.reportType === 'emergency' && (
                                <button 
                                    onClick={() => setSelectedIncident(report)}
                                    className="bg-blue-900/20 hover:bg-blue-600 hover:text-white text-blue-400 border border-blue-900/50 px-4 py-2 rounded text-xs font-bold transition-all flex items-center gap-2"
                                >
                                    <span>OPEN COMMS</span>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                                </button>
                            )}
                        </div>

                    </div>
                ))}
            </div>
        )}
      </div>

      {/* 3. LIVE CHAT MODAL */}
      {selectedIncident && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-[#0a0a0a] w-full max-w-lg rounded-xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-4 bg-gray-900 border-b border-gray-700 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <h3 className="font-bold text-white text-sm uppercase tracking-wide">Secure Uplink #{selectedIncident.id}</h3>
                    </div>
                    <button onClick={() => setSelectedIncident(null)} className="text-gray-400 hover:text-white transition-colors p-2">✕</button>
                </div>
                <div className="p-0 bg-black flex-1 overflow-hidden">
                    <LiveChat incidentId={selectedIncident.id} user={user} />
                </div>
            </div>
        </div>
      )}

    </DashboardLayout>
  );
}
