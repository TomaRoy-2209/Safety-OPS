"use client";
import { useEffect, useState, useRef } from "react";
import axios from 'axios';
import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";
import IntelViewer from "../components/IntelViewer";
import { requestForToken, onMessageListener } from '../../firebase'; // ✅ 1. Import Firebase

export default function WorkerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertState, setAlertState] = useState(null); 

  // We track the IDs we have already seen.
  const knownIdsRef = useRef(new Set());
  const isFirstLoad = useRef(true);

  // Sound Effect
  const playSiren = () => {
    try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => console.log("Audio permission needed"));
    } catch (e) { console.error(e); }
  };

  const fetchData = async () => {
      const token = localStorage.getItem("jwt");
      if(!token) { router.push('/login'); return; }

      try {
          // 1. Get Profile (Once)
          let currentUser = user;
          if (!currentUser) {
              const profileRes = await axios.get("http://localhost:1801/api/auth/profile", {
                 headers: { Authorization: `Bearer ${token}` }
              });
              currentUser = profileRes.data.user || profileRes.data;
              setUser(currentUser);
          }

          // 2. Get ONLY My Assigned Tasks
          const taskRes = await axios.get("http://localhost:1801/api/incidents", {
             headers: { Authorization: `Bearer ${token}` }
          });
          
          const myTasks = Array.isArray(taskRes.data) ? taskRes.data : taskRes.data.data;

          // 3. THE INTERNAL ALERT LOGIC (For New Tasks)
          if (!isFirstLoad.current) {
              const newIncomingTasks = myTasks.filter(t => !knownIdsRef.current.has(t.id));
              
              if (newIncomingTasks.length > 0) {
                  setAlertState(`🚨 COMMAND HAS ASSIGNED INCIDENT #${newIncomingTasks[0].id}`);
                  playSiren();
                  setTimeout(() => setAlertState(null), 10000);
              }
          }

          // Update Known IDs
          const currentIds = new Set(myTasks.map(t => t.id));
          knownIdsRef.current = currentIds;

          setTasks(myTasks);
          setLoading(false);
          isFirstLoad.current = false;

      } catch (err) {
          console.error("Polling Error:", err);
      }
  };

  useEffect(() => {
      fetchData();
      const interval = setInterval(fetchData, 3000); 

      // ✅ 4. NEW: Token Sync Logic (Saves Token to DB)
      const syncToken = async () => {
        if (typeof window !== 'undefined') {
            try {
                await requestForToken(); 
                console.log("✅ Worker Token Synced");
            } catch (err) {
                console.error("Token sync failed", err);
            }
        }
      };
      syncToken();

      // ✅ 5. NEW: Listen for DISASTER ALERTS (Popup)
      onMessageListener()
        .then((payload) => {
            // Browser Popup
            alert(`🚨 ${payload.notification.title}: ${payload.notification.body}`);
            // Trigger the Dashboard Siren for extra effect!
            playSiren();
        })
        .catch((err) => console.log('failed: ', err));

      return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#020617] text-blue-500 font-mono animate-pulse">
        CONNECTING TO DISPATCH SERVER...
    </div>
  );

  const dashboardTitle = user?.unit ? `UNIT: ${user.unit.toUpperCase()}` : "WORKER DASHBOARD";

  return (
    <DashboardLayout title={dashboardTitle}>
      
      {selectedTask && <IntelViewer incident={selectedTask} onClose={() => setSelectedTask(null)} />}

      {/* DISPATCH ALERT POPUP (Internal Task Alert) */}
      {alertState && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[99999] animate-bounce w-[90%] max-w-lg">
            <div className="bg-red-600 text-white p-6 rounded-xl shadow-[0_0_50px_rgba(220,38,38,0.8)] border-4 border-white flex flex-col items-center text-center">
                <span className="text-4xl mb-2">👷‍♂️</span>
                <h2 className="text-3xl font-bold uppercase tracking-wider blink">New Dispatch Order</h2>
                <p className="font-mono mt-2 text-lg font-bold">{alertState}</p>
                <p className="text-xs mt-4 uppercase">Check Active Directives Below</p>
            </div>
        </div>
      )}

      <div className="space-y-8">
        
        {/* TOP CARD: Unit Status */}
        <div className="bg-[#0a0a0a] border border-gray-800 p-8 rounded-xl relative overflow-hidden">
             <div className="flex justify-between items-start relative z-10">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{user?.agency}</h2>
                    <div className="inline-block bg-blue-900/30 text-blue-400 border border-blue-500/30 px-3 py-1 rounded text-sm font-mono font-bold">
                        UNIT ID: {user?.unit}
                    </div>
                </div>
                <div className="text-right">
                    <div className="flex items-center justify-end gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <span className="text-emerald-500 font-bold text-sm">ONLINE</span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-mono mt-1">AWAITING ORDERS</p>
                </div>
             </div>
             {/* BG Icon */}
             <div className="absolute right-0 top-0 p-8 opacity-5">
                <svg className="w-48 h-48 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
            </div>
        </div>

        {/* TASK LIST */}
        <div>
            <div className="flex items-center gap-3 mb-4 border-b border-gray-800 pb-2">
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest">Assigned Directives</h3>
                <span className="bg-gray-800 text-white text-xs px-2 py-0.5 rounded-full">{tasks.length}</span>
            </div>

            {tasks.length === 0 ? (
                // EMPTY STATE
                <div className="p-16 text-center border-2 border-dashed border-gray-800 rounded-xl bg-[#0a0a0a]/50 flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-900/50 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    <h4 className="text-gray-400 font-bold text-lg">No Active Assignments</h4>
                    <p className="text-gray-600 text-sm mt-1 max-w-sm">
                        Your unit queue is clear. Maintain readiness. Notifications will appear here when Command dispatches an incident.
                    </p>
                </div>
            ) : (
                // LIST OF ASSIGNED TASKS
                <div className="space-y-4">
                    {tasks.map(task => (
                        <div key={task.id} className="bg-[#111] border border-l-4 border-l-red-500 border-gray-800 p-6 rounded-r-xl shadow-lg hover:bg-[#151515] transition-colors flex flex-col md:flex-row justify-between items-start md:items-center">
                            
                            <div className="mb-4 md:mb-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-red-500 font-bold text-lg tracking-tight">INCIDENT #{task.id}</span>
                                    <span className="text-[10px] bg-red-900/20 text-red-500 px-2 py-0.5 rounded border border-red-500/20 font-bold uppercase">
                                        Action Required
                                    </span>
                                </div>
                                <h4 className="text-white font-bold text-xl mb-2">{task.title}</h4>
                                <p className="text-gray-400 text-sm mb-4 leading-relaxed max-w-2xl">{task.description}</p>
                                
                                <div className="flex gap-6 text-xs font-mono text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        {new Date(task.created_at).toLocaleTimeString()}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                        GPS: {Number(task.latitude).toFixed(4)}, {Number(task.longitude).toFixed(4)}
                                    </span>
                                </div>
                            </div>

                            <button 
                                onClick={() => setSelectedTask(task)}
                                className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded font-bold shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                            >
                                <span>VIEW INTEL</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                            </button>

                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </DashboardLayout>
  );
}