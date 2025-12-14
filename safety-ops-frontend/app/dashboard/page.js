"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Added router for redirection
import DashboardLayout from '../components/DashboardLayout';

export default function MyReportsPage() {
    const router = useRouter();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });

    useEffect(() => {
        // 1. Get the Token
        const token = localStorage.getItem('jwt');

        // 2. Security Check: If no token, kick them out
        if (!token) {
            router.push('/login');
            return;
        }

        // 3. Fetch Data WITH the Token
        axios.get('http://127.0.0.1:1801/api/my-reports', {
            headers: { Authorization: `Bearer ${token}` } // <--- CRITICAL FIX
        })
            .then(res => {
                const data = res.data.data || res.data; 
                
                if (Array.isArray(data)) {
                    setReports(data);
                    // Calculate Stats
                    const pending = data.filter(r => r.status === 'pending').length;
                    const resolved = data.filter(r => r.status === 'resolved').length;
                    setStats({ total: data.length, pending, resolved });
                } else {
                    console.error("Data received is not an array:", data);
                    setReports([]);
                }
                
                setLoading(false);
            })
            .catch(err => {
                console.error("Fetch Error:", err);
                // Optional: If token is expired (401), force logout
                if (err.response && err.response.status === 401) {
                    localStorage.removeItem('jwt');
                    router.push('/login');
                }
                setLoading(false);
            });
    }, [router]);

    // Tactical Color Logic
    const getStatusStyles = (status) => {
        switch(status) {
            case 'pending': 
                return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20 shadow-[0_0_10px_rgba(250,204,21,0.2)]';
            case 'resolved': 
                return 'text-green-400 bg-green-400/10 border-green-400/20 shadow-[0_0_10px_rgba(74,222,128,0.2)]';
            case 'dispatched': 
                return 'text-blue-400 bg-blue-400/10 border-blue-400/20 shadow-[0_0_10px_rgba(96,165,250,0.2)]';
            default: 
                return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    return (
        <DashboardLayout title="INCIDENT LOG">
            <div className="space-y-8">
                
                {/* 1. STATS OVERVIEW ROW */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-[#0a0a0a]/60 border border-gray-800 p-4 rounded-lg">
                        <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Total Reports</div>
                        <div className="text-2xl text-white font-mono font-bold">{String(stats.total).padStart(2, '0')}</div>
                    </div>
                    <div className="bg-[#0a0a0a]/60 border border-gray-800 p-4 rounded-lg">
                        <div className="text-yellow-500/70 text-[10px] font-bold uppercase tracking-widest">Processing</div>
                        <div className="text-2xl text-yellow-500 font-mono font-bold">{String(stats.pending).padStart(2, '0')}</div>
                    </div>
                    <div className="bg-[#0a0a0a]/60 border border-gray-800 p-4 rounded-lg">
                        <div className="text-green-500/70 text-[10px] font-bold uppercase tracking-widest">Resolved</div>
                        <div className="text-2xl text-green-500 font-mono font-bold">{String(stats.resolved).padStart(2, '0')}</div>
                    </div>
                </div>

                {/* 2. MAIN CONTENT AREA */}
                <div>
                    <div className="flex justify-between items-end mb-4">
                        <h2 className="text-white text-lg font-bold tracking-wide flex items-center gap-2">
                            <span className="w-2 h-6 bg-blue-600 rounded-sm"></span>
                            HISTORY STREAM
                        </h2>
                        <Link href="/report">
                            <button className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-4 rounded transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                NEW REPORT
                            </button>
                        </Link>
                    </div>

                    {/* Loading State */}
                    {loading && (
                         <div className="p-12 text-center border border-dashed border-gray-800 rounded-xl">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                            <p className="text-blue-500 font-mono text-sm animate-pulse">DECRYPTING ARCHIVES...</p>
                         </div>
                    )}

                    {/* Empty State */}
                    {!loading && reports.length === 0 && (
                        <div className="p-12 text-center bg-[#0a0a0a]/40 border border-gray-800 rounded-xl">
                            <svg className="w-16 h-16 text-gray-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            <h3 className="text-gray-400 font-bold mb-2">NO RECORDS FOUND</h3>
                            <p className="text-gray-600 text-sm mb-6">Your citizen file is currently clean.</p>
                            <Link href="/report" className="text-blue-500 hover:underline text-sm font-bold">Initiate First Report &rarr;</Link>
                        </div>
                    )}

                    {/* Reports Grid */}
                    <div className="grid grid-cols-1 gap-4">
                        {!loading && reports.map(report => (
                            <div key={report.id} className="group relative bg-[#0a0a0a]/80 border border-gray-800 p-6 rounded-xl hover:border-blue-500/50 transition-all duration-300 shadow-lg hover:shadow-blue-900/10">
                                
                                {/* Hover Glow Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none"></div>

                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-mono text-[10px] text-gray-500 border border-gray-800 px-1 rounded">ID-#{report.id}</span>
                                            <h3 className="text-white font-bold text-lg tracking-tight group-hover:text-blue-400 transition-colors">{report.title}</h3>
                                        </div>
                                        <p className="text-gray-400 text-sm leading-relaxed mb-3 border-l-2 border-gray-800 pl-3">{report.description}</p>
                                        
                                        {/* Meta Data */}
                                        <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                                {Number(report.latitude).toFixed(4)}, {Number(report.longitude).toFixed(4)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                {new Date(report.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="flex flex-col items-end gap-2 min-w-[100px]">
                                        <span className={`px-3 py-1 rounded text-[10px] font-bold uppercase border tracking-wider flex items-center gap-2 ${getStatusStyles(report.status)}`}>
                                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                                            {report.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}