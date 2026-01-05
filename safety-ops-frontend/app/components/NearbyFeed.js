"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function NearbyFeed() {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const lat = position.coords.latitude;
                const long = position.coords.longitude;
                fetchNearby(lat, long);
            }, () => {
                alert("Please allow location access to see nearby alerts.");
            });
        }
    }, []);

    const fetchNearby = async (lat, long) => {
        try {
            const res = await axios.get(`http://localhost:1801/api/incidents/nearby?latitude=${lat}&longitude=${long}`);
            setIncidents(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <p>Scanning local area...</p>;

    return (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mt-6">
            <h2 className="text-xl font-bold mb-4 text-blue-700">📍 Happening Near You</h2>

            {incidents.length === 0 ? (
                <p>Safe zone. No recent incidents nearby.</p>
            ) : (
                <div className="space-y-3">
                    {incidents.map((incident) => (
                        <div key={incident.id} className="p-3 bg-white shadow-sm rounded border-l-4 border-red-500">
                            <h3 className="font-bold text-gray-800">{incident.title}</h3>
                            <p className="text-sm text-gray-600">{incident.description}</p>
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded mt-1 inline-block">
                                {incident.type}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
