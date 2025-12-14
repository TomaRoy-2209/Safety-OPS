"use client";
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../components/DashboardLayout';

export default function ReportPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // 1. Get Token & Validation
        const token = localStorage.getItem('jwt');
        if (!token) {
            alert("You must be logged in to report an incident.");
            router.push('/login');
            return;
        }

        try {
            // 2. Prepare Data
            const form = {
                title: title,
                description: desc,
                latitude: 23.8103, // Hardcoded for demo (or use Geolocation API)
                longitude: 90.4125
            };

            // 3. SEND REPORT (WITH TOKEN)
            // FIX: Added headers config as the third argument
            const res = await axios.post('http://127.0.0.1:1801/api/incidents', form, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // 4. CAPTURE THE ID FROM BACKEND RESPONSE
            const newId = res.data.incident.id; 

            // 5. IF FILE EXISTS, UPLOAD IT
            if (file) {
                const formData = new FormData();
                formData.append('evidence', file);
                
                // FIX: Upload evidence also needs the token
                await axios.post(`http://127.0.0.1:1801/api/incidents/${newId}/upload`, formData, {
                    headers: { 
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`
                    }
                });
            }

            alert("✅ Report & Evidence Submitted Successfully!");
            router.push('/dashboard');

        } catch (error) {
            console.error(error);
            alert("❌ Submission Failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout title="NEW INCIDENT REPORT">
            <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6 bg-[#0a0a0a] p-8 rounded-xl border border-gray-800 shadow-2xl">
                    
                    {/* Header */}
                    <div className="border-b border-gray-800 pb-4 mb-4">
                        <h3 className="text-white font-bold text-lg">Incident Details</h3>
                        <p className="text-gray-500 text-sm">Please provide accurate information for rapid response.</p>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Subject / Title</label>
                        <input 
                            type="text" 
                            className="w-full bg-[#111] border border-gray-700 rounded p-3 text-white focus:border-blue-500 outline-none transition-colors"
                            placeholder="e.g. Fire at Sector 7 Market"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required 
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Detailed Description</label>
                        <textarea 
                            className="w-full bg-[#111] border border-gray-700 rounded p-3 text-white focus:border-blue-500 outline-none transition-colors h-32"
                            placeholder="Describe the situation, number of people involved, and specific hazards..."
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                            required 
                        />
                    </div>

                    {/* Evidence Upload */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Digital Evidence (Optional)</label>
                        <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-blue-500 transition-colors bg-[#111]/50 group cursor-pointer relative">
                            <input 
                                type="file" 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={e => setFile(e.target.files[0])}
                            />
                            <div className="flex flex-col items-center">
                                <svg className="w-8 h-8 text-gray-500 group-hover:text-blue-500 mb-2 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                                    {file ? file.name : "Click to Attach Photo or Video"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-lg shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                                TRANSMITTING DATA...
                            </>
                        ) : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                                SUBMIT REPORT
                            </>
                        )}
                    </button>

                </form>
            </div>
        </DashboardLayout>
    );
}