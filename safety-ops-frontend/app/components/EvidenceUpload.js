"use client";
import { useState } from 'react';
import axios from 'axios';

export default function EvidenceUpload({ incidentId }) {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState("idle");
    const [uploadedUrl, setUploadedUrl] = useState("");

    const handleUpload = async () => {
        if (!file) return;
        setStatus("uploading");
        const formData = new FormData();
        formData.append('evidence', file);

        try {
            // NOTE: Keep your port logic here (1801)
            const response = await axios.post(`http://127.0.0.1:1801/api/incidents/${incidentId}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUploadedUrl(response.data.url);
            setStatus("success");
        } catch (error) {
            console.error(error);
            setStatus("error");
        }
    };

    return (
        <div className="mt-6 p-6 rounded-xl bg-cyber-panel border border-cyber-border shadow-xl">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                <svg className="w-5 h-5 text-cyber-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                Digital Evidence
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-4 items-center">
                {/* Custom File Input Styling */}
                <label className="flex-1 w-full cursor-pointer group">
                    <div className="h-12 w-full px-4 rounded-lg bg-cyber-black border border-cyber-border group-hover:border-cyber-primary flex items-center justify-center text-cyber-muted transition-all">
                        <span className="text-sm truncate">{file ? file.name : "Select Media File..."}</span>
                    </div>
                    <input type="file" onChange={(e) => setFile(e.target.files[0])} className="hidden" />
                </label>

                {/* Action Button */}
                <button 
                    onClick={handleUpload}
                    disabled={status === 'uploading' || !file}
                    className="h-12 px-6 rounded-lg bg-cyber-primary hover:bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all w-full sm:w-auto"
                >
                    {status === 'uploading' ? 'UPLOADING...' : 'UPLOAD'}
                </button>
            </div>

            {/* Status Indicators */}
            {status === 'success' && (
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded text-green-400 text-sm flex items-center gap-2">
                    ✅ Upload Secure. <a href={uploadedUrl} target="_blank" className="underline hover:text-white">View Asset</a>
                </div>
            )}
            {status === 'error' && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded text-red-400 text-sm">
                    ❌ Upload Failed. Retry.
                </div>
            )}
        </div>
    );
}