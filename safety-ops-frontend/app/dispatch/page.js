"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';

export default function DispatchPage() {
    const [incidents, setIncidents] = useState([]);
    const [selectedAgency, setSelectedAgency] = useState("");

    // Fetch only PENDING incidents
    useEffect(() => {
        axios.get('http://localhost:1429/api/my-reports') // adjust to your real admin route
            .then(res => {
                // Filter locally for demo
                const pending = res.data.data.filter(i => i.status === 'pending');
                setIncidents(pending);
            })
            .catch(err => {
                console.error(err);
            });
    }, []);

    const handleAssign = async (id) => {
        if (!selectedAgency) return alert("Select an agency first!");

        try {
            await axios.post(`http://localhost:1429/api/incidents/${id}/assign`, {
                agency: selectedAgency
            });
            alert("Unit Dispatched!");
            // Remove from list locally
            setIncidents(prev => prev.filter(i => i.id !== id));
        } catch (error) {
            console.error(error);
            alert("Failed to assign.");
        }
    };

    return (
        <DashboardLayout title="Dispatch Control">
            <div className="grid grid-cols-1 gap-6">
                {incidents.length === 0 ? (
                    <p className="text-white">No pending incidents.</p>
                ) : (
                    incidents.map(incident => (
                        <div key={incident.id} className="bg-cyber-panel p-6 rounded-xl border border-cyber-border flex justify-between items-center">
                            <div>
                                <h3 className="text-white font-bold text-lg">{incident.title}</h3>
                                <p className="text-cyber-muted text-sm">{incident.description}</p>
                                <span className="text-xs text-yellow-500 font-mono mt-2 block">
                                    STATUS: PENDING
                                </span>
                            </div>

                            <div className="flex gap-2 items-center">
                                <select
                                    className="bg-cyber-black text-white border border-cyber-border p-2 rounded"
                                    onChange={(e) => setSelectedAgency(e.target.value)}
                                >
                                    <option value="">Select Agency</option>
                                    <option value="Police Unit 1">Police Unit 1</option>
                                    <option value="Fire Station 5">Fire Station 5</option>
                                    <option value="Medical Team A">Medical Team A</option>
                                </select>

                                <button
                                    onClick={() => handleAssign(incident.id)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-bold text-sm"
                                >
                                    DISPATCH
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </DashboardLayout>
    );
}
