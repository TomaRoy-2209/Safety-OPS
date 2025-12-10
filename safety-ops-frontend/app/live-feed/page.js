"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import DashboardLayout from '../components/DashboardLayout';

export default function LiveFeedPage() {
    const [incidents, setIncidents] = useState([]);

    useEffect(() => {
        // 1. Initial Fetch (Get old reports)
        axios.get('http://127.0.0.1:1801/api/my-reports').then(res => {
            setIncidents(res.data.data);
        });

        // 2. Setup Real-Time Listener
        window.Pusher = Pusher;
        
        const echo = new Echo({
            broadcaster: 'pusher',
            key: 'YOUR_PUSHER_KEY_HERE', // <--- PASTE YOUR KEY HERE
            cluster: 'ap2', // <--- PASTE YOUR CLUSTER HERE
            forceTLS: true
        });

        // Listen to channel 'incidents', event 'new-incident'
        echo.channel('incidents')
            .listen('.new-incident', (e) => {
                console.log("REAL TIME EVENT RECEIVED:", e);
                // Add new incident to the TOP of the list instantly
                setIncidents(prev => [e.incident, ...prev]);
                alert("🚨 NEW INCIDENT REPORTED!");
            });

        return () => echo.disconnect();
    }, []);

    return (
        <DashboardLayout title="Live Incident Command">
            <div className="space-y-4">
                {incidents.map(incident => (
                    <div key={incident.id} className="bg-cyber-panel p-6 border-l-4 border-red-500 rounded shadow-lg animate-pulse">
                        <h3 className="text-xl font-bold text-white flex justify-between">
                            {incident.title}
                            <span className="text-xs bg-red-600 px-2 py-1 rounded text-white">LIVE</span>
                        </h3>
                        <p className="text-gray-400 mt-1">{incident.description}</p>
                    </div>
                ))}
            </div>
        </DashboardLayout>
    );
}