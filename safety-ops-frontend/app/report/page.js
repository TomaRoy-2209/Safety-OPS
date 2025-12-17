"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../components/DashboardLayout';
// 1. IMPORT YOUR COMPONENT
import EvidenceUpload from '../components/EvidenceUpload';

export default function ReportPage() {
    const router = useRouter();
    const [form, setForm] = useState({ title: '', description: '', latitude: '', longitude: '' });
    const [loading, setLoading] = useState(false);
    const [gps, setGps] = useState("Locating...");
    
    // 2. NEW STATE: To store the ID of the report we just made
    const [createdIncidentId, setCreatedIncidentId] = useState(null);

    // Auto-Get Location
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setForm(prev => ({...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude}));
                    setGps(`LOCKED: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
                },
                () => setGps("⚠️ GPS SIGNAL LOST")
            );
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // 3. SEND REPORT
            // NOTE: Check your terminal. If your backend is on port 1801, change 1801 to 1801.
            const res = await axios.post('http://127.0.0.1:1801/api/incidents', form);
            
            // 4. CAPTURE THE ID FROM BACKEND RESPONSE
            const newId = res.data.incident.id; 
            setCreatedIncidentId(newId);
            
            alert("Report Logged! Please attach evidence now.");
            // We DO NOT redirect yet. We stay here to upload files.
        } catch (error) {
            console.error(error);
            alert("Transmission Failed. Check console for details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout title="New Incident Report">
            <div className="max-w-2xl mx-auto">
                
                {/* 5. CONDITIONAL RENDERING: Show Upload Screen AFTER Submit */}
                
                {createdIncidentId ? (
                    // --- VIEW 2: EVIDENCE UPLOAD (YOUR FEATURE) ---
                    <div className="bg-cyber-panel border border-cyber-border p-8 rounded-xl shadow-2xl animate-fade-in">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">✓</div>
                            <h2 className="text-2xl font-bold text-white">Incident #{createdIncidentId} Logged</h2>
                            <p className="text-cyber-muted mt-2">Attach photos or videos to complete the dossier.</p>
                        </div>

                        {/* YOUR COMPONENT (Connected to the real ID!) */}
                        <EvidenceUpload incidentId={createdIncidentId} />

                        <button 
                            onClick={() => router.push('/dashboard')}
                            className="mt-6 w-full py-3 text-sm text-cyber-muted hover:text-white underline"
                        >
                            Skip / Return to Dashboard
                        </button>
                    </div>

                ) : (
                    // --- VIEW 1: REPORT FORM (SABRINA'S FEATURE) ---
                    <div className="bg-cyber-panel border border-cyber-border p-8 rounded-xl shadow-2xl">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Title Input */}
                            <div>
                                <label className="block text-xs font-bold text-cyber-primary uppercase mb-2">Subject</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-cyber-black border border-cyber-border rounded-lg p-3 text-white focus:border-cyber-primary outline-none transition-all"
                                    placeholder="e.g. Fire at Sector 7"
                                    onChange={e => setForm({...form, title: e.target.value})}
                                    required
                                />
                            </div>

                            {/* Description Input */}
                            <div>
                                <label className="block text-xs font-bold text-cyber-primary uppercase mb-2">Details</label>
                                <textarea 
                                    rows="4"
                                    className="w-full bg-cyber-black border border-cyber-border rounded-lg p-3 text-white focus:border-cyber-primary outline-none transition-all"
                                    placeholder="Describe the situation..."
                                    onChange={e => setForm({...form, description: e.target.value})}
                                    required
                                ></textarea>
                            </div>

                            {/* GPS Status */}
                            <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded text-blue-400 text-xs font-mono">
                                {gps}
                            </div>

                            {/* Submit Button */}
                            <button 
                                disabled={loading}
                                className="w-full bg-cyber-primary hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-all"
                            >
                                {loading ? "TRANSMITTING..." : "NEXT: ATTACH EVIDENCE"}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}