"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic'; 
import DashboardLayout from '../components/DashboardLayout'; // Ensure this path is correct

// 🚨 CRITICAL DEPLOYMENT FIX:
// Maps must be imported dynamically with ssr: false, or Vercel build will FAIL.
const MapComponent = dynamic(() => import('../components/MapComponent'), { 
    ssr: false,
    loading: () => (
        <div className="h-full w-full bg-gray-900 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-blue-500 font-mono text-xs uppercase tracking-widest">Establishing Satellite Uplink...</span>
            </div>
        </div>
    )
});

export default function LiveMapPage() {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('jwt');
                
                // PRODUCTION URL LOGIC
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1801';

                const res = await axios.get(`${API_URL}/api/incidents`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Robust Data Handling
                const raw = res.data;
                const data = Array.isArray(raw) ? raw : (raw.data || raw.incidents || []);
                
                setIncidents(data);
            } catch (err) {
                console.error("Map Data Uplink Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <DashboardLayout title="TACTICAL MAP OVERVIEW">
            <div className="h-[calc(100vh-140px)] w-full bg-[#0a0a0a] border border-gray-800 rounded-xl overflow-hidden relative shadow-2xl">
                
                {/* Tactical Overlay */}
                <div className="absolute top-4 left-4 z-[1000] bg-black/80 backdrop-blur-md border border-gray-700 p-4 rounded-lg shadow-2xl max-w-xs pointer-events-none">
                    <h3 className="text-white font-bold text-sm flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        LIVE INCIDENT FEED
                    </h3>
                    <p className="text-gray-400 text-[10px] mt-1 uppercase tracking-tight">
                        Geospatial tracking of active distress signals.
                    </p>
                    <div className="mt-3 flex gap-4 text-xs font-mono">
                        <div className="text-red-400">
                            <span className="font-bold text-lg">{incidents.length}</span> ACTIVE
                        </div>
                        <div className="text-blue-400 border-l border-gray-700 pl-4">
                            <span className="font-bold text-lg">DHAKA</span> SECTOR
                        </div>
                    </div>
                </div>

                {/* Map Interface */}
                {loading ? (
                    <div className="h-full w-full bg-[#0a0a0a] flex items-center justify-center text-blue-500 font-mono text-xs animate-pulse">
                        CALIBRATING GEOSPATIAL DATA...
                    </div>
                ) : (
                    <MapComponent incidents={incidents} />
                )}
            </div>
        </DashboardLayout>
    );
}