"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';

export default function MyReportsPage() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch data from your backend
        axios.get('http://127.0.0.1:8000/api/my-reports')
            .then(res => {
                setReports(res.data.data);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    // Color logic for status badges
    const getStatusColor = (status) => {
        if (status === 'pending') return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
        if (status === 'resolved') return 'text-green-400 bg-green-400/10 border-green-400/20';
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    };

    return (
        <DashboardLayout title="My Reports">
            <div className="space-y-4">
                {/* Loading State */}
                {loading && <p className="text-white text-center">Loading Secure Data...</p>}

                {/* Reports List */}
                {!loading && reports.map(report => (
                    <div key={report.id} className="bg-cyber-panel p-6 rounded-xl border border-cyber-border hover:bg-white/5 transition-all">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-white font-bold text-lg">{report.title}</h3>
                                <p className="text-cyber-muted text-sm mt-1">{report.description}</p>
                                <div className="mt-3 flex gap-4 text-xs text-gray-500 font-mono">
                                    <span>ID: #{report.id}</span>
                                    <span>📍 {report.latitude}, {report.longitude}</span>
                                </div>
                            </div>
                            
                            <span className={`px-3 py-1 rounded text-xs font-bold uppercase border ${getStatusColor(report.status)}`}>
                                {report.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </DashboardLayout>
    );
}
