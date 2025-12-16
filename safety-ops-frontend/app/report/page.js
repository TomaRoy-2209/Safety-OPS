"use client";
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../components/DashboardLayout';


export default function ReportPage() {
    const router = useRouter();


    // --- STATE MANAGEMENT ---
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
   
    // GPS State (New Feature)
    const [locationStatus, setLocationStatus] = useState('pending'); // pending, detecting, success, error
    const [coords, setCoords] = useState({ lat: null, lng: null });


    // --- 1. GPS LOGIC ---
    const getLocation = () => {
        setLocationStatus('detecting');
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCoords({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setLocationStatus('success');
                },
                (error) => {
                    console.error("GPS Error", error);
                    setLocationStatus('error');
                    alert("⚠️ Could not access GPS. Please check browser permissions.");
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
            setLocationStatus('error');
        }
    };


    // --- 2. SUBMIT LOGIC (FIXED: One-Step Request) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);


        const token = localStorage.getItem('jwt');
        if (!token) {
            alert("You must be logged in to report an incident.");
            router.push('/login');
            return;
        }


        if (!coords.lat || !coords.lng) {
            alert("⚠️ Location is Required! Please click 'Acquire GPS Lock'.");
            setLoading(false);
            return;
        }


        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', desc);
            formData.append('latitude', coords.lat);
            formData.append('longitude', coords.lng);
           
            if (file) {
                formData.append('media', file);
            }


            // --- THE FIX IS HERE ---
            // We removed 'Content-Type': 'multipart/form-data'
            // The browser will now automatically add it WITH the correct boundary.
            await axios.post('http://localhost:1801/api/incidents', formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
           
            alert("✅ Report & Evidence Submitted Successfully!");


            // --- SMART REDIRECT FIX ---
            // Check the user's role to send them to the correct home
            const role = localStorage.getItem('role');


            // 2. Send them to their specific folder
            if (role === 'admin') {
                router.push('/admin-dashboard');
            }
            else if (role === 'responder') {
                router.push('/responder-dashboard');
            }
            else if (role === 'worker') {
                router.push('/worker-dashboard'); // Fire, Police, Medical units
            }
            else {
                router.push('/dashboard'); // Default for Citizens
            }


        } catch (error) {
            console.error("Submission Error:", error);
            if (error.response) {
                // If it's a 401, the token actually expired
                if (error.response.status === 401) {
                    alert("Session Expired. Please Login Again.");
                    router.push('/login');
                } else if (error.response.status === 422) {
                    alert("❌ Validation Error: Check inputs or file size.");
                } else {
                    alert(`❌ Error: ${error.response.statusText}`);
                }
            } else {
                alert("❌ Connection Error. Is the backend running?");
            }
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


                    {/* Title Input */}
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


                    {/* Description Input */}
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


                    {/* --- NEW: GPS LOCATION BLOCK --- */}
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Incident Location</label>
                        <div className="bg-[#111] border border-gray-700 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                           
                            {/* Status Indicators */}
                            <div className="flex-1">
                                {locationStatus === 'success' ? (
                                    <div>
                                        <div className="text-green-500 font-bold text-sm flex items-center gap-2">
                                            <span className="relative flex h-2 w-2">
                                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                            </span>
                                            GPS SIGNAL LOCKED
                                        </div>
                                        <div className="text-gray-500 text-xs font-mono mt-1 ml-4">
                                            {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-gray-500 text-sm flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-gray-600"></span>
                                        Location verification required.
                                    </div>
                                )}
                            </div>


                            {/* GPS Button */}
                            <button
                                type="button"
                                onClick={getLocation}
                                disabled={locationStatus === 'success'}
                                className={`px-4 py-2 rounded font-bold text-xs transition-all uppercase tracking-wider ${
                                    locationStatus === 'success'
                                    ? 'bg-green-900/20 text-green-600 border border-green-900/50 cursor-default'
                                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                                }`}
                            >
                                {locationStatus === 'detecting' ? 'Acquiring...' :
                                 locationStatus === 'success' ? 'Confirmed' : 'Acquire GPS Lock'}
                            </button>
                        </div>
                    </div>


                    {/* Evidence Upload (Your Preferred Style) */}
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
