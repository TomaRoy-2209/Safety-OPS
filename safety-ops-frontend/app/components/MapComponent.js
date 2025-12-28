"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic'; // 👈 REQUIRED for Maps on Vercel
import DashboardLayout from '../components/DashboardLayout';

// 🚨 CRITICAL DEPLOYMENT FIX:
// Maps must be imported dynamically with ssr: false, or Vercel build will FAIL.
const MapComponent = dynamic(() => import('../components/MapComponent'), { 
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-900 animate-pulse flex items-center justify-center text-blue-500">LOADING SATELLITE UPLINK...</div>
});

export default function LiveMapPage() {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('jwt');
                
                // 👇 FIX: Use Environment Variable
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1801';

                const res = await axios.get(`${API_URL}/api/incidents`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Handle data array robustness
                const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
                setIncidents(data);
                setLoading(false);
            } catch (err) {
                console.error("Map Data Error:", err);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <DashboardLayout title="TACTICAL MAP OVERVIEW">
            <div className="h-[calc(100vh-140px)] w-full bg-[#0a0a0a] border border-gray-800 rounded-xl overflow-hidden relative shadow-2xl">
                
                {/* Header Overlay */}
                <div className="absolute top-4 left-4 z-[9999] bg-black/80 backdrop-blur border border-gray-700 p-4 rounded-lg shadow-xl max-w-xs">
                    <h3 className="text-white font-bold text-sm flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        LIVE INCIDENT FEED
                    </h3>
                    <p className="text-gray-400 text-xs mt-1">
                        Real-time geospatial tracking of active distress signals.
                    </p>
                    <div className="mt-3 flex gap-4 text-xs font-mono">
                        <div className="text-red-400">
                            <span className="font-bold text-lg">{incidents.length}</span> Active
                        </div>
                        <div className="text-blue-400">
                            <span className="font-bold text-lg">Dhaka</span> Sector
                        </div>
                    </div>
                </div>

                {/* Map Render */}
                {loading ? (
                    <div className="h-full w-full flex items-center justify-center text-blue-500 font-mono">
                        CALIBRATING GEOSPATIAL DATA...
                    </div>
                ) : (
                    <MapComponent incidents={incidents} />
                )}
            </div>
        </DashboardLayout>
    );
}