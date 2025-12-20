"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic'; // This makes the map work!
import DashboardLayout from '../components/DashboardLayout';

// Dynamically import the map so it doesn't crash the server
const MapComponent = dynamic(() => import('../components/MapComponent'), { 
    ssr: false,
    loading: () => <p className="text-white">Loading Map...</p>
});

export default function MapPage() {
    const [incidents, setIncidents] = useState([]);

    useEffect(() => {
        // NOTE: fetching from our Backend Port 1801
        axios.get('http://127.0.0.1:1801/api/incidents/all')
            .then(res => setIncidents(res.data.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <DashboardLayout title="Intel Map">
            <div className="h-[80vh] w-full bg-[#0a0a0a] border border-gray-800 rounded-xl p-2 shadow-2xl">
                <MapComponent incidents={incidents} />
            </div>
        </DashboardLayout>
    );
}