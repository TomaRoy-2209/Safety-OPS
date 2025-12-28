"use client";
import { useEffect, useState, useRef } from "react";
import axios from 'axios';
import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";
import IntelViewer from "../components/IntelViewer";
import { requestForToken, onMessageListener } from '../../firebase'; 

export default function WorkerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [workerType, setWorkerType] = useState(null); // 'EMERGENCY' or 'MAINTENANCE'
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertState, setAlertState] = useState(null); 

  // Tracking for new alerts
  const knownIdsRef = useRef(new Set());
  const isFirstLoad = useRef(true);

  // Sound Effect (Only plays for Emergency)
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

      // 👇 FIX: Use Environment Variable
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1801';

      try {
          // 1. Get Profile & Determine Type (Once)
          let currentUser = user;
          let currentType = workerType;

          if (!currentUser) {
              // Replaced http://localhost:1801 with API_URL
              const profileRes = await axios.get(`${API_URL}/api/auth/profile`, {
                 headers: { Authorization: `Bearer ${token}` }
              });
              currentUser = profileRes.data.user || profileRes.data;
              setUser(currentUser);

              // DETERMINE TYPE BASED ON AGENCY
              const emergencyAgencies = ['Police Dept', 'Fire Service', 'Medical Team', 'RAB', 'Traffic Police'];
              currentType = (currentUser.agency && emergencyAgencies.includes(currentUser.agency)) 
                            ? 'EMERGENCY' 
                            : 'MAINTENANCE'; // Default to City Corp/WASA
              setWorkerType(currentType);
          }

          // 2. Fetch Data Based on Type
          let url = "";
          if (currentType === 'EMERGENCY') {
              // Replaced http://localhost:1801 with API_URL
              url = `${API_URL}/api/incidents`; // Your assigned emergency tasks
          } else {
              // Replaced http://localhost:1801 with API_URL
              url = `${API_URL}/api/admin/maintenance/all`; // All maintenance tickets
          }

          const taskRes = await axios.get(url, {
             headers: { Authorization: `Bearer ${token}` }
          });
          
          // Normalize data structure
          let incomingTasks = Array.isArray(taskRes.data) ? taskRes.data : (taskRes.data.data || []);
          
          // For Maintenance, filter out 'resolved' ones so they focus on open work
          if (currentType === 'MAINTENANCE') {
              incomingTasks = incomingTasks.filter(t => t.status !== 'resolved');
          }

          // 3. Alert Logic (For New Incoming Tasks)
          if (!isFirstLoad.current && incomingTasks.length > 0) {
              const newTasks = incomingTasks.filter(t => !knownIdsRef.current.has(t.id));
              
              if (newTasks.length > 0) {
                  const prefix = currentType === 'EMERGENCY' ? '🚨 DISPATCH ALERT' : '🛠️ NEW WORK ORDER';
                  setAlertState(`${prefix} #${newTasks[0].id}`);
                  
                  // Only play loud siren for emergencies
                  if (currentType === 'EMERGENCY') playSiren(); 
                  
                  setTimeout(() => setAlertState(null), 8000);
              }
          }

          // Update Ref
          knownIdsRef.current = new Set(incomingTasks.map(t => t.id));

          setTasks(incomingTasks);
          setLoading(false);
          isFirstLoad.current = false;

      } catch (err) {
          console.error("Polling Error:", err);
      }
  };

  // Maintenance Action: Fix Pothole
  const resolveMaintenance = async (id) => {
      const token = localStorage.getItem("jwt");
      // 👇 FIX: Use Environment Variable
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1801';

      try {
          // Replaced http://localhost:1801 with API_URL
          await axios.put(`${API_URL}/api/admin/maintenance/${id}`, 
              { status: 'resolved' },
              { headers: { Authorization: `Bearer ${token}` } }
          );
          alert("✅ Work Order Completed");
          fetchData(); // Refresh list immediately
      } catch (e) {
          alert("Failed to update ticket");
      }
  };

  useEffect(() => {
      fetchData();
      const interval = setInterval(fetchData, 5000); // Poll every 5s

      // Token Sync
      const syncToken = async () => {
        if (typeof window !== 'undefined') {
            try { await requestForToken(); } catch (err) { console.error(err); }
        }
      };
      syncToken();

      // FCM Listener
      onMessageListener().then((payload) => {
           alert(`🔔 ${payload.notification.title}: ${payload.notification.body}`);
           if (workerType === 'EMERGENCY') playSiren();
        }).catch((err) => console.log('failed: ', err));

      return () => clearInterval(interval);
  }, [workerType]); // Re-run if workerType is determined

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#020617] text-gray-500 font-mono animate-pulse">
        ESTABLISHING SECURE UPLINK...
    </div>
  );

  return (
    <DashboardLayout title={workerType === 'EMERGENCY' ? "EMERGENCY RESPONSE UNIT" : "MUNICIPALITY MAINTENANCE UNIT"}>
      
      {/* INTEL VIEWER (Only for Emergency) */}
      {selectedTask && <IntelViewer incident={selectedTask} onClose={() => setSelectedTask(null)} />}

      {/* POPUP ALERT */}
      {alertState && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[99999] animate-bounce w-[90%] max-w-lg">
            <div className={`text-white p-6 rounded-xl border-4 border-white flex flex-col items-center text-center shadow-2xl ${
                workerType === 'EMERGENCY' ? 'bg-red-600 shadow-red-900/50' : 'bg-yellow-600 shadow-yellow-900/50 text-black'
            }`}>
                <span className="text-4xl mb-2">{workerType === 'EMERGENCY' ? '🚓' : '🚧'}</span>
                <h2 className="text-3xl font-bold uppercase tracking-wider blink">
                    {workerType === 'EMERGENCY' ? 'PRIORITY DISPATCH' : 'NEW WORK ORDER'}
                </h2>
                <p className="font-mono mt-2 text-lg font-bold">{alertState}</p>
            </div>
        </div>
      )}

      <div className="space-y-8">
        
        {/* HEADER CARD */}
        <div className="bg-[#0a0a0a] border border-gray-800 p-8 rounded-xl relative overflow-hidden">
             <div className="flex justify-between items-start relative z-10">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{user?.agency}</h2>
                    <div className={`inline-block px-3 py-1 rounded text-sm font-mono font-bold border ${
                        workerType === 'EMERGENCY' 
                        ? 'bg-blue-900/30 text-blue-400 border-blue-500/30' 
                        : 'bg-yellow-900/30 text-yellow-500 border-yellow-500/30'
                    }`}>
                        UNIT ID: {user?.unit || 'General'}
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
                    <p className="text-[10px] text-gray-500 font-mono mt-1">SYSTEMS NOMINAL</p>
                </div>
             </div>
        </div>

        {/* TASK LIST */}
        <div>
            <div className="flex items-center gap-3 mb-4 border-b border-gray-800 pb-2">
                <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                    {workerType === 'EMERGENCY' ? 'Active Incidents' : 'Maintenance Queue'}
                </h3>
                <span className="bg-gray-800 text-white text-xs px-2 py-0.5 rounded-full">{tasks.length}</span>
            </div>

            {tasks.length === 0 ? (
                <div className="p-16 text-center border-2 border-dashed border-gray-800 rounded-xl bg-[#0a0a0a]/50">
                    <h4 className="text-gray-400 font-bold text-lg">All Clear</h4>
                    <p className="text-gray-600 text-sm mt-1">No active assignments pending.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {tasks.map(task => (
                        <div key={task.id} className={`bg-[#111] border-l-4 p-6 rounded-r-xl shadow-lg hover:bg-[#151515] transition-colors flex flex-col md:flex-row justify-between items-start md:items-center ${
                            workerType === 'EMERGENCY' ? 'border-l-red-500 border-gray-800' : 'border-l-yellow-500 border-gray-800'
                        }`}>
                            
                            <div className="mb-4 md:mb-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`font-bold text-lg tracking-tight ${
                                        workerType === 'EMERGENCY' ? 'text-red-500' : 'text-yellow-500'
                                    }`}>
                                        {workerType === 'EMERGENCY' ? `INCIDENT #${task.id}` : `TICKET #${task.id}`}
                                    </span>
                                    <span className="text-[10px] bg-gray-900 text-gray-400 px-2 py-0.5 rounded border border-gray-700 font-bold uppercase">
                                        {task.category || task.type}
                                    </span>
                                </div>
                                <h4 className="text-white font-bold text-xl mb-2">{task.title}</h4>
                                <p className="text-gray-400 text-sm mb-4 leading-relaxed max-w-2xl">{task.description}</p>
                                
                                <div className="flex gap-6 text-xs font-mono text-gray-500">
                                    <span>{new Date(task.created_at).toLocaleTimeString()}</span>
                                    <span>GPS: {Number(task.latitude).toFixed(4)}, {Number(task.longitude).toFixed(4)}</span>
                                </div>
                            </div>

                            {/* DYNAMIC BUTTONS BASED ON TYPE */}
                            {workerType === 'EMERGENCY' ? (
                                <button 
                                    onClick={() => setSelectedTask(task)}
                                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded font-bold shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                                >
                                    <span>VIEW INTEL</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                </button>
                            ) : (
                                <button 
                                    onClick={() => resolveMaintenance(task.id)}
                                    className="w-full md:w-auto bg-green-600 hover:bg-green-500 text-white px-8 py-4 rounded font-bold shadow-lg shadow-green-900/20 flex items-center justify-center gap-2"
                                >
                                    <span>MARK FIXED</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                </button>
                            )}

                        </div>
                    ))}
                </div>
            )}
        </div>
      </div>
    </DashboardLayout>
  );
}