"use client";
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation'; 
import DashboardLayout from '../components/DashboardLayout';
import IntelViewer from '../components/IntelViewer';

export default function LiveFeedPage() {
    const router = useRouter(); 
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [alert, setAlert] = useState(null); 

    const prevCountRef = useRef(0);

    const playAlertSound = () => {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); 
        audio.play().catch(e => console.log("Audio blocked by browser", e));
    };

    const fetchLiveData = async () => {
        // 1. GET TOKEN
        const token = localStorage.getItem('jwt');
        
        // 2. IF NO TOKEN, STOP & REDIRECT
        if (!token) {
            router.push('/login');
            return;
        }

        // 👇 FIX: Use Environment Variable
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1801';

        try {
            // Replaced http://localhost:1801 with API_URL
            const res = await axios.get(`${API_URL}/api/incidents`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // 🛡️ DATA FINDER (Same as Admin Dashboard)
            const raw = res.data;
            const newData = 
                Array.isArray(raw) ? raw :                 
                (Array.isArray(raw.data) ? raw.data :      
                (Array.isArray(raw.incidents) ? raw.incidents : 
                []));                                     

            // Alert logic (Play sound if list grows)
            if (prevCountRef.current > 0 && newData.length > prevCountRef.current) {
                setAlert("⚠️ NEW INCIDENT DETECTED");
                playAlertSound();
                setTimeout(() => setAlert(null), 3000);
            }

            prevCountRef.current = newData.length;
            setIncidents(newData);

        } catch (error) {
            console.error("Live Feed Error", error);
            // Handle Token Expiry
            if (error.response && error.response.status === 401) {
                localStorage.removeItem('jwt');
                localStorage.removeItem('role');
                router.push('/login');
            }
        } finally {
            // ✅ CRITICAL FIX: This ensures loading ALWAYS turns off
            setLoading(false);
        }
    };

    useEffect(() => {
        // 4. CHECK AUTH ON MOUNT
        const token = localStorage.getItem('jwt');
        if (!token) {
            router.push('/login');
            return;
        }

        // Initial Fetch
        fetchLiveData();

        // Polling Interval (Every 3 seconds)
        const intervalId = setInterval(fetchLiveData, 3000);

        return () => clearInterval(intervalId);
    }, [router]);

    return (
        <DashboardLayout title="LIVE INTEL FEED">
            
            {selectedIncident && (
                <IntelViewer 
                    incident={selectedIncident} 
                    onClose={() => setSelectedIncident(null)} 
                />
            )}

            {alert && (
                <div className="fixed top-24 right-8 z-[100] animate-bounce">
                    <div className="bg-red-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 border-2 border-white">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                        </span>
                        <span className="font-bold tracking-widest">{alert}</span>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                
                <div className="flex items-center justify-between bg-[#0a0a0a] border border-gray-800 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                        </div>
                        <span className="text-green-500 font-mono text-sm tracking-widest">REAL-TIME CONNECTION ESTABLISHED</span>
                    </div>
                    <div className="text-gray-500 text-xs font-mono">
                        AUTO-REFRESH: 3s
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 text-center text-blue-500 font-mono animate-pulse">DECRYPTING SIGNAL...</div>
                ) : (
                    <div className="space-y-3">
                        {Array.isArray(incidents) && incidents.length > 0 ? (
                            incidents.map((incident, index) => (
                                <div 
                                    key={incident.id} 
                                    className={`
                                        relative p-5 rounded-xl border transition-all duration-300 flex justify-between items-start group
                                        ${index === 0 ? 'bg-blue-900/10 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-[#0a0a0a] border-gray-800 hover:border-gray-600'}
                                    `}
                                >
                                    {index === 0 && (
                                        <span className="absolute -top-2 -left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg animate-pulse">
                                            LATEST
                                        </span>
                                    )}

                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-xs font-mono text-gray-500">#{incident.id}</span>
                                            <h3 className="text-white font-bold text-lg group-hover:text-blue-400 transition-colors">{incident.title}</h3>
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                                                incident.status === 'pending' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                                                'bg-green-500/10 text-green-500 border-green-500/20'
                                            }`}>
                                                {incident.status}
                                            </span>
                                        </div>
                                        <p className="text-gray-400 text-sm mb-3">{incident.description}</p>
                                        <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
                                            <span>{new Date(incident.created_at).toLocaleTimeString()}</span>
                                            <span>LOC: {Number(incident.latitude).toFixed(4)}, {Number(incident.longitude).toFixed(4)}</span>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => setSelectedIncident(incident)}
                                        className="bg-[#111] hover:bg-blue-600 hover:text-white text-gray-400 border border-gray-700 px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                        INTEL
                                    </button>
                                </div>
                            ))
                        ) : (
                             <div className="py-10 text-center text-gray-500 border border-dashed border-gray-800 rounded-lg">
                                 NO ACTIVE SIGNALS DETECTED
                             </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}