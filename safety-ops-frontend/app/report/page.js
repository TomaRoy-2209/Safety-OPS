"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../components/DashboardLayout';

export default function UnifiedReportPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('emergency'); // 'emergency' or 'maintenance'
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState("Waiting for GPS...");
  
  // SHARED FORM STATE
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Fire', // Default for Emergency
    category: 'Road', // Default for Maintenance
    latitude: null,
    longitude: null,
    file: null
  });

  // 1. AUTO-GET LOCATION ON LOAD
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          setLocationStatus("✅ GPS Locked");
        },
        (error) => {
          console.error("Location Error:", error);
          setLocationStatus("⚠️ GPS Failed (Enter Manually)");
        }
      );
    }
  }, []);

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('jwt');

    // Prepare Data (FormData is needed for file uploads)
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('latitude', formData.latitude || '');
    data.append('longitude', formData.longitude || '');
    if (formData.file) {
        data.append(activeTab === 'emergency' ? 'evidence' : 'image', formData.file);
    }

    // 👇 FIX: Use Environment Variable
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1801';

    try {
        let url = "";
        
        if (activeTab === 'emergency') {
            // 🔴 EMERGENCY ENDPOINT
            // Replaced http://localhost:1801 with API_URL
            url = `${API_URL}/api/incidents`;
            data.append('type', formData.type);
        } else {
            // 🟡 MAINTENANCE ENDPOINT
            // Replaced http://localhost:1801 with API_URL
            url = `${API_URL}/api/maintenance/tickets`;
            data.append('category', formData.category);
        }

        await axios.post(url, data, {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });

        alert(activeTab === 'emergency' ? "🚨 EMERGENCY REPORT SENT!" : "✅ Maintenance Ticket Submitted");
        router.push('/dashboard');

    } catch (error) {
        console.error("Submission Error", error);
        alert("Failed to submit report. check console.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <DashboardLayout title="REPORT CENTER">
      <div className="max-w-2xl mx-auto">
        
        {/* --- TAB SWITCHER --- */}
        <div className="flex bg-[#0a0a0a] p-1 rounded-xl mb-6 border border-gray-800">
            <button 
                onClick={() => setActiveTab('emergency')}
                className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'emergency' 
                    ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' 
                    : 'text-gray-500 hover:text-white'
                }`}
            >
                <span>🚨 EMERGENCY</span>
            </button>
            <button 
                onClick={() => setActiveTab('maintenance')}
                className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'maintenance' 
                    ? 'bg-yellow-600 text-black shadow-lg shadow-yellow-900/20' 
                    : 'text-gray-500 hover:text-white'
                }`}
            >
                <span>🛠️ NON-EMERGENCY</span>
            </button>
        </div>

        {/* --- DYNAMIC FORM --- */}
        <div className={`border rounded-xl p-8 transition-colors ${
            activeTab === 'emergency' 
            ? 'bg-[#0a0a0a]/80 border-red-900/30' 
            : 'bg-[#0a0a0a]/80 border-yellow-900/30'
        }`}>
            
            <div className="mb-6 text-center">
                <h2 className={`text-2xl font-bold mb-1 ${activeTab === 'emergency' ? 'text-red-500' : 'text-yellow-500'}`}>
                    {activeTab === 'emergency' ? 'IMMEDIATE ASSISTANCE' : 'MAINTENANCE REQUEST'}
                </h2>
                <p className="text-gray-500 text-sm">
                    {activeTab === 'emergency' 
                    ? 'Use this for life-threatening situations only.' 
                    : 'Report infrastructure issues (potholes, lights, etc).'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. TITLE */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Subject</label>
                    <input 
                        type="text" 
                        required
                        className="w-full bg-[#111] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                        placeholder={activeTab === 'emergency' ? "e.g., Fire at Central Bank" : "e.g., Broken Streetlight"}
                        value={formData.title}
                        onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                </div>

                {/* 2. CATEGORY SELECTOR (Changes based on Tab) */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                        {activeTab === 'emergency' ? 'Incident Type' : 'Infrastructure Category'}
                    </label>
                    <select 
                        className="w-full bg-[#111] border border-gray-800 rounded-lg p-3 text-white focus:outline-none"
                        value={activeTab === 'emergency' ? formData.type : formData.category}
                        onChange={e => activeTab === 'emergency' ? setFormData({...formData, type: e.target.value}) : setFormData({...formData, category: e.target.value})}
                    >
                        {activeTab === 'emergency' ? (
                            <>
                                <option value="Fire">🔥 Fire Outbreak</option>
                                <option value="Medical">🚑 Medical Emergency</option>
                                <option value="Police">👮 Police / Crime</option>
                                <option value="Accident">🚗 Traffic Accident</option>
                            </>
                        ) : (
                            <>
                                <option value="Road">🛣️ Road / Pothole</option>
                                <option value="Electric">💡 Streetlight / Electric</option>
                                <option value="Sewage">💧 Water / Sewage</option>
                                <option value="Garbage">🗑️ Waste Management</option>
                            </>
                        )}
                    </select>
                </div>

                {/* 3. LOCATION STATUS */}
                <div className="flex items-center justify-between bg-[#151515] p-3 rounded-lg border border-gray-800">
                    <span className="text-xs font-bold text-gray-500 uppercase">GPS Location</span>
                    <span className={`text-xs font-mono ${locationStatus.includes("✅") ? "text-green-500" : "text-yellow-500"}`}>
                        {locationStatus}
                    </span>
                </div>

                {/* 4. FILE UPLOAD (Works for Both now!) */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Evidence / Photo</label>
                    <input 
                        type="file" 
                        className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-gray-800 file:text-white hover:file:bg-gray-700"
                        onChange={handleFileChange}
                    />
                </div>

                {/* 5. DESCRIPTION */}
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Details</label>
                    <textarea 
                        required
                        className="w-full bg-[#111] border border-gray-800 rounded-lg p-3 text-white h-32 focus:outline-none focus:border-blue-500"
                        placeholder="Describe the situation..."
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                </div>

                {/* SUBMIT BUTTON */}
                <button 
                    type="submit" 
                    disabled={loading}
                    className={`w-full py-4 rounded-lg font-bold text-white shadow-xl transition-all active:scale-95 ${
                        activeTab === 'emergency' 
                        ? 'bg-red-600 hover:bg-red-500 shadow-red-900/20' 
                        : 'bg-yellow-600 hover:bg-yellow-500 text-black shadow-yellow-900/20'
                    }`}
                >
                    {loading ? 'TRANSMITTING...' : activeTab === 'emergency' ? 'BROADCAST ALERT' : 'SUBMIT TICKET'}
                </button>

            </form>
        </div>
      </div>
    </DashboardLayout>
  );
}