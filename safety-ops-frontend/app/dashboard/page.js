"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from 'axios';
import DashboardLayout from "../components/DashboardLayout"; 
import LiveChat from "../components/LiveChat"; 
import { requestForToken, onMessageListener } from '../../firebase'; // ✅ 1. Import Firebase Helpers

export default function CitizenDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [myReports, setMyReports] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New State for Chat
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
            
            // Fetch User
            const profileRes = await axios.get("http://localhost:1801/api/auth/profile", config);
            setUser(profileRes.data.user || profileRes.data);

            // Fetch Reports
            const reportsRes = await axios.get("http://localhost:1801/api/my-reports", config);
            setMyReports(reportsRes.data);
            
            setLoading(false);
        } catch (error) {
            console.error("Dashboard Error:", error);
            setLoading(false);
        }
    };

    // ✅ 2. NEW: Token Sync (Generates fcm_token in DB)
    const syncToken = async () => {
        if (typeof window !== 'undefined') {
            try {
                await requestForToken(); 
                console.log("✅ Citizen Token Synced");
            } catch (err) {
                console.error("Token sync failed", err);
            }
        }
    };

    // ✅ 3. NEW: Listen for Alerts (Popup)
    // ✅ 3. DEBUG LISTENER
    // ✅ 3. DEBUG LISTENER (Replace your existing onMessageListener block)
    onMessageListener()
        .then((payload) => {
            console.log("🔥 MESSAGE RECEIVED!", payload); // Look for this in F12 Console
            
            const title = payload?.notification?.title || "ALERT";
            const body = payload?.notification?.body || "Emergency Broadcast";

            // Try BOTH a standard alert and a console warning
            alert(`🚨 ${title}: ${body}`);
            console.warn(`🚨 ${title}: ${body}`); 
        })
        .catch((err) => console.log('failed: ', err));

    fetchData();
    syncToken(); // <--- Run the sync

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
                Use the "Open Comms" button to chat directly with Dispatch.
            </p>
            <button 
                onClick={() => router.push('/report')}
                className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-red-900/20 transition-all flex items-center gap-2"
            >
                <span>+ REPORT EMERGENCY</span>
            </button>
         </div>
         {/* Decorative Background Icon */}
         <div className="absolute top-0 right-0 p-8 opacity-10">
            <svg className="w-40 h-40 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>
         </div>
      </div>

      {/* 2. REPORTS GRID */}
      <div className="space-y-4">
        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Your Incident Log</h3>
        
        {myReports.length === 0 ? (
            <div className="p-10 border border-dashed border-gray-800 rounded-xl text-center text-gray-600">
                No incidents reported. Stay safe.
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-4">
                {myReports.map(report => (
                    <div key={report.id} className="bg-[#0a0a0a] border border-gray-800 p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center group hover:border-blue-900/50 transition-all">
                        
                        {/* Left: Info */}
                        <div className="mb-4 md:mb-0">
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`w-2 h-2 rounded-full ${
                                    report.status === 'pending' ? 'bg-red-500 animate-pulse' : 
                                    report.status === 'dispatched' ? 'bg-blue-500' : 'bg-green-500'
                                }`}></span>
                                <h3 className="font-bold text-white text-lg">{report.title}</h3>
                                <span className="text-[10px] bg-gray-900 text-gray-400 px-2 py-1 rounded border border-gray-800 uppercase">
                                    {report.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-400 max-w-xl truncate">{report.description}</p>
                            <span className="text-xs text-gray-600 font-mono mt-2 block">
                                ID: #{report.id} • {new Date(report.created_at).toLocaleDateString()}
                            </span>
                        </div>

                        {/* Right: Actions */}
                        <button 
                            onClick={() => setSelectedIncident(report)}
                            className="bg-blue-900/20 hover:bg-blue-600 hover:text-white text-blue-400 border border-blue-900/50 px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                        >
                            <span>OPEN COMMS</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                        </button>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* 3. LIVE CHAT MODAL */}
      {selectedIncident && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-[#0a0a0a] w-full max-w-lg rounded-xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                
                {/* Modal Header */}
                <div className="p-4 bg-gray-900 border-b border-gray-700 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <h3 className="font-bold text-white text-sm uppercase tracking-wide">Secure Uplink #{selectedIncident.id}</h3>
                    </div>
                    <button 
                        onClick={() => setSelectedIncident(null)}
                        className="text-gray-400 hover:text-white transition-colors p-2"
                    >
                        ✕
                    </button>
                </div>

                {/* The Component */}
                <div className="p-0 bg-black flex-1 overflow-hidden">
                    <LiveChat incidentId={selectedIncident.id} user={user} />
                </div>

            </div>
        </div>
      )}

    </DashboardLayout>
  );
}