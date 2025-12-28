"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import DashboardLayout from "../../components/DashboardLayout";
import RiskCard from "../../components/RiskCard";

export default function RiskAssessmentPage() {
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('jwt');
                
                // 1. Check Token
                if (!token) { console.error("No token"); return; }

                // 2. Call API
                const res = await axios.get(
                    "http://localhost:1801/api/auth/analytics/risk-assessment",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: "application/json",
                        },
                    }
                );

                // 🚨 CORRECT FIX FOR YOUR NEW CONTROLLER:
                // Since the backend returns a direct array, we use res.data directly.
                // We add "|| []" just in case it returns null.
                setZones(res.data || []); 

            } catch (err) {
                console.error("Risk API Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);


    return (
        <DashboardLayout title="PREDICTIVE RISK SCORING">
            <div className="space-y-8">
                {/* Header Info */}
                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/10 border border-blue-800/30 p-6 rounded-xl">
                    <h2 className="text-xl font-bold text-white mb-2">AI-Driven Threat Forecasting</h2>
                    <p className="text-gray-400 text-sm max-w-3xl">
                        This module uses historical incident density, recency frequency, and severity weighting 
                        to calculate a <strong>Predictive Risk Score (PRS)</strong>. Zones with scores above 85 
                        require immediate resource allocation.
                    </p>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center py-20 text-blue-500 font-mono animate-pulse">
                        RUNNING PREDICTIVE ALGORITHMS...
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {zones.map((zone, idx) => (
                            <RiskCard key={idx} data={zone} />
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
