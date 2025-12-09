"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
// Importing the layout I created
import DashboardLayout from '../components/DashboardLayout';

export default function ReportPage() {
    const router = useRouter();
    const [form, setForm] = useState({ title: '', description: '', latitude: '', longitude: '' });
    const [loading, setLoading] = useState(false);
    const [gps, setGps] = useState("Locating...");

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
            // Ensure port matches your local backend (1801 or 8000)
            await axios.post('http://127.0.0.1:8000/api/incidents', form);
            alert("Incident Logged Successfully.");
            // router.push('/dashboard'); 
        } catch (error) {
            console.error(error);
            alert("Transmission Failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout title="New Incident Report">
            <div className="max-w-2xl mx-auto bg-cyber-panel border border-cyber-border p-8 rounded-xl shadow-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title Input */}
                    <div>
                        <label className="block text-xs font-bold text-cyber-primary uppercase mb-2">Subject</label>
                        <input 
                            type="text" 
                            className="w-full bg-cyber-black border border-cyber-border rounded-lg p-3 text-white focus:border-cyber-primary outline-none"
                            placeholder="e.g. Fire at Sector 7"
                            onChange={e => setForm({...form, title: e.target.value})}
                        />
                    </div>

                    {/* Description Input */}
                    <div>
                        <label className="block text-xs font-bold text-cyber-primary uppercase mb-2">Details</label>
                        <textarea 
                            rows="4"
                            className="w-full bg-cyber-black border border-cyber-border rounded-lg p-3 text-white focus:border-cyber-primary outline-none"
                            placeholder="Describe the situation..."
                            onChange={e => setForm({...form, description: e.target.value})}
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
                        {loading ? "TRANSMITTING..." : "SUBMIT REPORT"}
                    </button>
                </form>
            </div>
        </DashboardLayout>
    );
}
