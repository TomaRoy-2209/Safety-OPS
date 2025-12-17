"use client";
import { useEffect, useState, useRef } from "react";
import axios from 'axios';
import { useRouter } from "next/navigation";
import DashboardLayout from "../components/DashboardLayout";
import IntelViewer from "../components/IntelViewer";

export default function WorkerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // We use REF to hold the "Previous State" so the Interval can read it accurately
  const taskIdsRef = useRef(new Set()); 
  const isFirstRun = useRef(true);

  const playSiren = () => {
    try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.volume = 1.0;
        audio.play().catch(() => console.log("Click the page to enable audio"));
    } catch (e) { console.error(e); }
  };

  const pollServer = async () => {
      const token = localStorage.getItem("jwt");
      if(!token) return;

      try {
          // 1. Fetch Profile (Only if we don't have it)
          if (!user) {
             const profile = await axios.get("http://localhost:1801/api/auth/profile", { headers: { Authorization: `Bearer ${token}` } });
             setUser(profile.data.user || profile.data);
          }

          // 2. Fetch Tasks (Backend filters by 'worker' role automatically)
          const res = await axios.get("http://localhost:1801/api/incidents", { 
              headers: { Authorization: `Bearer ${token}` } 
          });
          
          const serverTasks = Array.isArray(res.data) ? res.data : res.data.data;
          
          // 3. THE NOTIFICATION LOGIC
          // Calculate if there are ANY IDs in serverTasks that are NOT in taskIdsRef
          const newTasks = serverTasks.filter(task => !taskIdsRef.current.has(task.id));

          if (newTasks.length > 0) {
              // We found a new task!
              if (!isFirstRun.current) {
                  console.log("NEW TASK DETECTED:", newTasks);
                  setAlert(`🚨 COMMAND DISPATCHED: INCIDENT #${newTasks[0].id}`);
                  playSiren();
                  // Alert stays for 10 seconds
                  setTimeout(() => setAlert(null), 10000);
              }
          }

          // 4. Update Reference & State
          // We update the Ref so the next loop knows these IDs are "old" now
          const currentIds = new Set(serverTasks.map(t => t.id));
          taskIdsRef.current = currentIds;
          
          setTasks(serverTasks);
          setLoading(false);
          isFirstRun.current = false;

      } catch (err) {
          console.error("Polling Error:", err);
      }
  };

  useEffect(() => {
      // Run once immediately
      pollServer();

      // Run every 3 seconds
      const interval = setInterval(pollServer, 3000);
      return () => clearInterval(interval);
  }, []); // Run on mount

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#020617] text-blue-500 animate-pulse font-mono">ESTABLISHING SECURE CONNECTION...</div>;

  return (
    <DashboardLayout title={`UNIT: ${user?.unit?.toUpperCase() || 'FIELD UNIT'}`}>
      
      {selectedTask && <IntelViewer incident={selectedTask} onClose={() => setSelectedTask(null)} />}

      {/* DISPATCH ALERT POPUP - Fixed Position, High Z-Index */}
      {alert && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-red-600 text-white p-8 rounded-2xl shadow-[0_0_100px_rgba(220,38,38,1)] border-4 border-white flex flex-col items-center text-center max-w-lg mx-4">
                <span className="text-6xl mb-4 animate-bounce">🚨</span>
                <h2 className="text-4xl font-black uppercase tracking-widest blink">Dispatch Alert</h2>
                <div className="h-1 w-full bg-white/30 my-4"></div>
                <p className="font-mono text-xl font-bold">{alert}</p>
                <button 
                    onClick={() => setAlert(null)}
                    className="mt-8 bg-white text-red-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors"
                >
                    ACKNOWLEDGE
                </button>
            </div>
        </div>
      )}

      {/* DASHBOARD CONTENT */}
      <div className="space-y-8">
        
        {/* Status Card */}
        <div className="bg-[#0a0a0a] border border-gray-800 p-8 rounded-xl relative">
             <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{user?.agency}</h2>
                    <div className="inline-block bg-blue-900/30 text-blue-400 border border-blue-500/30 px-3 py-1 rounded text-sm font-mono font-bold">
                        UNIT ID: {user?.unit}
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-emerald-500 font-bold text-sm animate-pulse">● SYSTEM ONLINE</p>
                </div>
             </div>
        </div>

        {/* Task List */}
        <div>
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Assigned Directives</h3>
            {tasks.length === 0 ? (
                <div className="p-16 text-center border-2 border-dashed border-gray-800 rounded-xl bg-[#0a0a0a]/50">
                    <h4 className="text-gray-400 font-bold text-lg">No Active Assignments</h4>
                    <p className="text-gray-600 text-sm mt-1">Stand by for Command dispatch.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {tasks.map(task => (
                        <div key={task.id} className="bg-[#111] border-l-4 border-red-500 p-6 rounded-r-xl flex flex-col md:flex-row justify-between items-center shadow-lg animate-in slide-in-from-right duration-500">
                            <div className="mb-4 md:mb-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-red-500 font-bold text-lg">INCIDENT #{task.id}</span>
                                    <span className="bg-red-900/20 text-red-500 px-2 py-0.5 rounded border border-red-500/20 text-[10px] font-bold uppercase">Priority</span>
                                </div>
                                <h4 className="text-white font-bold text-xl">{task.title}</h4>
                                <p className="text-gray-400 text-sm">{task.description}</p>
                            </div>
                            <button onClick={() => setSelectedTask(task)} className="bg-blue-600 px-8 py-3 rounded text-white font-bold hover:bg-blue-500 transition-colors shadow-lg">
                                VIEW ORDERS
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