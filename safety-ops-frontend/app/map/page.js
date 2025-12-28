"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic'; 
import DashboardLayout from '../components/DashboardLayout';

// Dynamically import the map so it doesn't crash the server
const MapComponent = dynamic(() => import('../components/MapComponent'), { 
    ssr: false,
    loading: () => <div className="h-full w-full bg-[#0a0a0a] flex items-center justify-center text-blue-500 animate-pulse">LOADING SATELLITE DATA...</div>
});

export default function MapPage() {
    const [incidents, setIncidents] = useState([]);

    useEffect(() => {
        // 👇 FIX: Use Environment Variable
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1801';

        const token = localStorage.getItem('jwt'); // Optional: Add auth header if needed

        // Replaced http://127.0.0.1:1801 with API_URL
        axios.get(`${API_URL}/api/incidents`, {
             // Added headers just in case your API is protected
             headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
            .then(res => {
                // Robust data handling (incase it returns .data or .data.data)
                const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
                setIncidents(data);
            })
            .catch(err => console.error("Map Fetch Error:", err));
    }, []);

    return (
        <DashboardLayout title="Intel Map">
            <div className="h-[80vh] w-full bg-[#0a0a0a] border border-gray-800 rounded-xl p-2 shadow-2xl relative overflow-hidden">
                <MapComponent incidents={incidents} />
            </div>
        </DashboardLayout>
    );
}