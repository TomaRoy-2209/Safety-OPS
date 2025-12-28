"use client";
import { useState } from "react";
import axios from "axios";

export default function AiSummarizer({ incidentId }) {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSummarize = async () => {
        setLoading(true);
        setError(null);
        setSummary(null);

        // 👇 FIX: Use Environment Variable
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1801';

        try {
            const token = localStorage.getItem('jwt');
            const res = await axios.post(
                `${API_URL}/api/incidents/${incidentId}/summarize`,
                {}, 
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // 🛡️ Robust Data Check
            if (res.data && res.data.summary) {
                setSummary(res.data.summary);
            } else {
                throw new Error("No summary returned from AI");
            }

        } catch (err) {
            console.error("AI Error:", err);
            setError("AI Service Busy. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-4">
            {/* 1. The Button */}
            {!summary && !loading && (
                <button 
                    onClick={handleSummarize}
                    className="group flex items-center gap-2 bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-800 hover:to-indigo-800 border border-purple-500/30 text-purple-100 px-4 py-2 rounded-lg text-xs font-bold transition-all w-full justify-center shadow-lg"
                >
                    <svg className="w-4 h-4 text-purple-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    GENERATE AI SUMMARY
                </button>
            )}

            {/* 2. Loading State */}
            {loading && (
                <div className="p-4 bg-purple-900/10 border border-purple-500/20 rounded-lg flex items-center justify-center gap-3 animate-pulse">
                    <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-purple-400 text-xs font-mono">ANALYZING INCIDENT DATA...</span>
                </div>
            )}

            {/* 3. The Result */}
            {summary && (
                <div className="bg-[#1a1025] border-l-4 border-purple-500 p-4 rounded-r-lg shadow-xl animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="text-purple-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                            <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                            AI Sitrep
                        </h4>
                        <button onClick={() => setSummary(null)} className="text-gray-500 hover:text-white text-xs">
                            ✕
                        </button>
                    </div>
                    
                    <div className="text-gray-200 text-sm leading-relaxed font-mono whitespace-pre-line">
                        {summary}
                    </div>
                </div>
            )}

            {/* 4. Error State */}
            {error && (
                <div className="mt-2 text-red-400 text-xs text-center font-mono bg-red-900/10 p-2 rounded border border-red-900/30">
                    {error}
                </div>
            )}
        </div>
    );
}