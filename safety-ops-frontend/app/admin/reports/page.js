"use client";
import { useState } from 'react';
import axios from 'axios';
import DashboardLayout from "../../components/DashboardLayout";

export default function ReportsPage() {
    const [days, setDays] = useState(30);
    const [loading, setLoading] = useState(false);

    const handleDownload = async (type) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('jwt');
            
            // We use 'blob' response type for files
            const res = await axios.get(`http://localhost:1801/api/reports/generate?type=${type}&days=${days}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob' 
            });

            // Create a fake link to trigger download
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `safety_ops_report.${type}`);
            document.body.appendChild(link);
            link.click();
            link.remove();

        } catch (err) {
            console.error("Download failed", err);
            alert("Failed to generate report. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout title="OFFICIAL REPORTS">
            <div className="max-w-2xl mx-auto space-y-8">
                
                {/* Info Card */}
                <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
                    <h2 className="text-xl font-bold text-white mb-2">Export Data</h2>
                    <p className="text-gray-400 text-sm">
                        Generate official records for administrative review. 
                        PDFs are formatted for print, while CSVs are optimized for Excel analysis.
                    </p>
                </div>

                {/* Controls */}
                <div className="bg-[#0a0a0a] border border-gray-800 p-8 rounded-xl shadow-2xl">
                    <label className="block text-gray-400 text-xs font-bold uppercase mb-4">Select Time Period</label>
                    
                    <div className="flex gap-4 mb-8">
                        {[7, 30, 90].map((d) => (
                            <button
                                key={d}
                                onClick={() => setDays(d)}
                                className={`px-6 py-3 rounded-lg font-bold border transition-all ${
                                    days === d 
                                    ? 'bg-blue-600 text-white border-blue-500' 
                                    : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500'
                                }`}
                            >
                                Last {d} Days
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-4 border-t border-gray-800 pt-8">
                        <button 
                            onClick={() => handleDownload('pdf')}
                            disabled={loading}
                            className="flex-1 bg-red-600 hover:bg-red-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            {loading ? 'GENERATING...' : '📄 DOWNLOAD PDF'}
                        </button>

                        <button 
                            onClick={() => handleDownload('csv')}
                            disabled={loading}
                            className="flex-1 bg-green-600 hover:bg-green-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            {loading ? 'GENERATING...' : '📊 DOWNLOAD CSV'}
                        </button>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
