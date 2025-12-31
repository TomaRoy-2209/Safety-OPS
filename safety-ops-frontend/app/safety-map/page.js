"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";
import { useRouter } from "next/navigation";

// ⚠️ Load Map Dynamically (Fixes "Window is not defined" error)
const HeatmapMap = dynamic(() => import("../components/HeatmapMap"), { 
    ssr: false,
    loading: () => <div className="h-full w-full flex items-center justify-center bg-black text-gray-500">Loading Map Engine...</div>
});

export default function SafetyMapPage() {
    const [heatmapData, setHeatmapData] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // 1. Get Token
        const token = localStorage.getItem('jwt');
        if (!token) {
            router.push('/login'); 
            return;
        }

        // 2. Fetch Data from Backend
        const fetchData = async () => {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1801';
            try {
                const res = await axios.get(`${API_URL}/api/incidents/heatmap`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setHeatmapData(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Failed to load heatmap data", err);
                setLoading(false);
            }
        };
        fetchData();
    }, [router]);

    return (
        <DashboardLayout title="COMMUNITY SAFETY MAP">
            <div className="relative h-[85vh] w-full rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
                
                {/* 🛡️ Info Overlay Panel */}
                <div className="absolute top-4 left-4 z-[1000] bg-black/90 backdrop-blur-md border border-gray-700 p-5 rounded-xl w-80 shadow-lg">
                    <h2 className="text-white font-bold text-xl flex items-center gap-2">
                        <span className="text-2xl">🔥</span> Threat Density
                    </h2>
                    <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                        Visualizing historical emergency data to identify high-risk zones.
                    </p>
                    
                    {/* Legend */}
                    <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-3 bg-red-900/20 p-2 rounded border border-red-900/30">
                            <span className="w-3 h-3 rounded-full bg-red-600 shadow-[0_0_8px_red]"></span>
                            <span className="text-xs text-red-200 font-bold">High Conflict Zone</span>
                        </div>
                        <div className="flex items-center gap-3 bg-blue-900/20 p-2 rounded border border-blue-900/30">
                            <span className="w-3 h-3 rounded-full bg-blue-500 opacity-60"></span>
                            <span className="text-xs text-blue-200">Low Activity / Safe</span>
                        </div>
                    </div>
                </div>

                {/* 🔙 Back Button */}
                <button 
                    onClick={() => router.push('/dashboard')}
                    className="absolute bottom-6 right-6 z-[1000] bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-full font-bold border border-gray-700 shadow-xl transition-all flex items-center gap-2"
                >
                    <span>🔙 DASHBOARD</span>
                </button>

                {/* The Map */}
                {loading ? (
                    <div className="h-full w-full flex items-center justify-center bg-[#0a0a0a] text-blue-500 font-mono animate-pulse">
                        ACCESSING SATELLITE UPLINK...
                    </div>
                ) : (
                    <HeatmapMap data={heatmapData} />
                )}
            </div>
        </DashboardLayout>
    );
}