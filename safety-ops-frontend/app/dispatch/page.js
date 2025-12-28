"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';
import IntelViewer from '../components/IntelViewer';

export default function DispatchPage() {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAgency, setSelectedAgency] = useState({}); // Track agency per incident
    const [viewingIncident, setViewingIncident] = useState(null); // For Intel Viewer

    // Fetch ONLY PENDING incidents for dispatch
    useEffect(() => {
        const token = localStorage.getItem('jwt');
        
        // 👇 FIX: Use Environment Variable
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1801';

        axios.get(`${API_URL}/api/incidents`, {
            headers: { Authorization: `Bearer ${token}` }
        }) 
            .then(res => {
                const allData = Array.isArray(res.data) ? res.data : res.data.data;
                // Filter: We only want PENDING items to dispatch
                const pending = allData.filter(i => i.status === 'pending');
                setIncidents(pending);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const handleAssign = async (id) => {
        const agency = selectedAgency[id];
        if (!agency) return alert("⚠️ SELECT UNIT BEFORE DISPATCHING");

        try {
            const token = localStorage.getItem('jwt');
            
            // 👇 FIX: Use Environment Variable
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1801';

            await axios.post(`${API_URL}/api/incidents/${id}/assign`, 
                { agency: agency },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            alert("✅ UNIT DISPATCHED SUCCESSFULLY");
            // Remove from list locally for instant UI update
            setIncidents(prev => prev.filter(i => i.id !== id));
        } catch (error) {
            console.error(error);
            alert("❌ DISPATCH FAILED: Network Error");
        }
    };

    // Helper to update state for specific dropdowns
    const handleAgencyChange = (id, value) => {
        setSelectedAgency(prev => ({ ...prev, [id]: value }));
    };

    return (
        <DashboardLayout title="DISPATCH CONTROL">
            
            {/* INTEL VIEWER POPUP */}
            {viewingIncident && (
                <IntelViewer 
                    incident={viewingIncident} 
                    onClose={() => setViewingIncident(null)} 
                />
            )}

            <div className="grid grid-cols-1 gap-6">
                
                {/* Header Stats */}
                <div className="flex items-center justify-between bg-[#0a0a0a]/50 p-4 rounded-xl border border-blue-900/30">
                    <div>
                        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest">Pending Assignments</h3>
                        <p className="text-2xl font-bold text-white">{incidents.length}</p>
                    </div>
                    <div className="flex gap-2">
                        <span className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></span>
                        <span className="text-yellow-500 font-mono text-xs">AWAITING ACTION</span>
                    </div>
                </div>

                {/* List */}
                {loading ? (
                    <div className="text-center py-20 text-blue-500 font-mono animate-pulse">SCANNING FOR DISTRESS SIGNALS...</div>
                ) : incidents.length === 0 ? (
                    <div className="p-12 text-center border border-dashed border-gray-800 rounded-xl bg-[#0a0a0a]/30">
                        <svg className="w-16 h-16 text-green-500/50 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <h3 className="text-white font-bold text-lg">ALL CLEAR</h3>
                        <p className="text-gray-500 text-sm">No pending incidents require dispatch.</p>
                    </div>
                ) : (
                    incidents.map(incident => (
                        <div key={incident.id} className="bg-[#0a0a0a] p-6 rounded-xl border border-gray-800 hover:border-blue-500/50 transition-all shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group">
                            
                            {/* Left: Incident Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                        Pending
                                    </span>
                                    <span className="text-gray-500 font-mono text-xs">ID-#{incident.id}</span>
                                </div>
                                <h3 className="text-white font-bold text-lg mb-1 group-hover:text-blue-400 transition-colors">{incident.title}</h3>
                                <p className="text-gray-400 text-sm mb-3 line-clamp-1">{incident.description}</p>
                                
                                {/* Evidence Button */}
                                <button 
                                    onClick={() => setViewingIncident(incident)}
                                    className="text-blue-500 text-xs font-bold hover:text-white flex items-center gap-1 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                                    REVIEW EVIDENCE
                                </button>
                            </div>

                            {/* Right: Dispatch Controls */}
                            <div className="flex flex-col sm:flex-row gap-3 items-end w-full md:w-auto bg-[#111] p-3 rounded-lg border border-gray-800">
                                <div className="flex flex-col w-full sm:w-48">
                                    <label className="text-[10px] text-gray-500 font-bold uppercase mb-1 ml-1">Assign Unit</label>
                                    <select
                                        className="bg-[#0a0a0a] text-white border border-gray-700 text-sm rounded p-2 focus:border-blue-500 outline-none"
                                        onChange={(e) => handleAgencyChange(incident.id, e.target.value)}
                                        defaultValue=""
                                    >
                                        <option value="" disabled>Select Unit...</option>
                                        
                                        <optgroup label="Police Dept">
                                            <option value="Alpha Team">Alpha Team</option>
                                            <option value="Bravo Team">Bravo Team</option>
                                            <option value="Special Ops">Special Ops</option>
                                        </optgroup>
                                        
                                        <optgroup label="Fire Service">
                                            <option value="Station 5">Station 5</option>
                                            <option value="Station 9">Station 9</option>
                                        </optgroup>

                                        <optgroup label="Medical">
                                            <option value="Rapid Response A">Rapid Response A</option>
                                            <option value="ICU Team B">ICU Team B</option>
                                        </optgroup>
                                    </select>
                                </div>

                                <button
                                    onClick={() => handleAssign(incident.id)}
                                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded font-bold text-xs transition-all shadow-lg shadow-blue-900/20 h-[38px] flex items-center justify-center gap-2"
                                >
                                    <span>DISPATCH</span>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </DashboardLayout>
    );
}