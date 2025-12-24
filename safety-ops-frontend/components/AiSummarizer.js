"use client";
import { useState } from 'react';
import axios from 'axios';

export default function AiSummarizer({ incidentId }) {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSummarize = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('jwt');
            const res = await axios.post(
                `http://localhost:1801/api/incidents/${incidentId}/summarize`,
                {}, 
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.status === 'success') {
                setSummary(res.data.summary);
            }
        } catch (err) {
            console.error(err);
            setError("AI Service Unavailable. Check API Key.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-4 p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/10 border border-purple-500/30 rounded-xl">
            {/* THE HEADER */}
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-xl">✨</span>
                    <h4 className="text-purple-400 font-bold text-sm uppercase tracking-wider">AI Situation Analysis</h4>
                </div>
                
                {!summary && !loading && (
                    <button 
                        onClick={handleSummarize}
                        className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-3 py-1.5 rounded shadow-lg transition-all"
                    >
                        GENERATE SUMMARY
                    </button>
                )}
            </div>

            {/* LOADING STATE */}
            {loading && (
                <div className="text-purple-300 text-sm animate-pulse flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                    </svg>
                    Analyzing incident context...
                </div>
            )}

            {/* ERROR STATE */}
            {error && (
                <div className="text-red-400 text-sm">
                    ⚠️ {error}
                </div>
            )}

            {/* RESULT STATE */}
            {summary && (
                <div className="bg-[#0a0a0a] p-3 rounded border border-purple-500/20">
                    <pre className="text-gray-300 text-sm font-sans whitespace-pre-wrap leading-relaxed">
                        {summary}
                    </pre>
                </div>
            )}
        </div>
    );
}
