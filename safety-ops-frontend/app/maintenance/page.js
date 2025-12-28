"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../components/DashboardLayout';

export default function MaintenancePage() {
    const router = useRouter();
    const [tickets, setTickets] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    
    // ✅ FIX 1: Define the loading state so Vercel doesn't crash
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        title: '', category: 'Road', description: '', latitude: '', longitude: ''
    });

    useEffect(() => {
        // ✅ FIX 2: Check for window to avoid server-side errors
        const token = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
        
        if (!token) {
            setLoading(false);
            return; // let the layout handle redirect or show empty
        }

        // Get Location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setFormData(prev => ({
                    ...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude
                }));
            });
        }
        fetchTickets(token);
    }, []);

    const fetchTickets = async (token) => {
        try {
            // ✅ FIX 3: Use Process Env for API URL
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const res = await axios.get(`${API_URL}/api/maintenance/my-tickets`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTickets(res.data);
        } catch (e) { 
            console.error(e); 
        } finally {
            // ✅ FIX 4: Always turn off loading
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const token = localStorage.getItem('jwt');
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

        try {
            await axios.post(`${API_URL}/api/maintenance/tickets`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("✅ Ticket Submitted!");
            setFormData({ ...formData, title: '', description: '' });
            fetchTickets(token);
        } catch (e) { 
            alert("Error submitting ticket"); 
        }
        setSubmitting(false);
    };

    // ✅ FIX 5: Added the missing updateStatus function used in your table
    const updateStatus = async (id, newStatus) => {
        const token = localStorage.getItem('jwt');
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        try {
            // Assuming your backend supports PUT/PATCH for status
            await axios.patch(`${API_URL}/api/maintenance/tickets/${id}`, 
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchTickets(token);
        } catch (e) {
            alert("Could not update status (Feature might be admin only)");
        }
    };

    return (
        <DashboardLayout title="MAINTENANCE LOG">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* FORM */}
                <div className="bg-[#0a0a0a] border border-gray-800 p-6 rounded-xl">
                    <h2 className="text-xl font-bold text-white mb-4">🛠️ Report Issue</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input type="text" placeholder="Title (e.g. Broken Light)" className="w-full bg-[#111] border border-gray-700 text-white p-3 rounded" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                        <select className="w-full bg-[#111] border border-gray-700 text-white p-3 rounded" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                            <option value="Road">Road / Pothole</option>
                            <option value="Electric">Electric</option>
                            <option value="Sewage">Sewage</option>
                        </select>
                        <textarea placeholder="Description..." className="w-full bg-[#111] border border-gray-700 text-white p-3 rounded h-24" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
                        <button type="submit" disabled={submitting} className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3 rounded">
                            {submitting ? "SENDING..." : "SUBMIT TICKET"}
                        </button>
                    </form>
                </div>

                {/* THE LOG TABLE */}
                <div className="overflow-x-auto bg-[#0a0a0a] border border-gray-800 rounded-xl p-4">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-[#111] text-gray-200 uppercase font-bold text-xs">
                            <tr>
                                <th className="p-4">ID</th>
                                <th className="p-4">Issue</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Location</th>
                                <th className="p-4">Evidence</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                <tr><td colSpan="7" className="p-8 text-center animate-pulse">LOADING LOG DATA...</td></tr>
                            ) : tickets.length === 0 ? (
                                <tr><td colSpan="7" className="p-8 text-center text-gray-600">Maintenance Log is Empty.</td></tr>
                            ) : (
                                tickets.map(ticket => (
                                    <tr key={ticket.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-mono text-gray-500">#{ticket.id}</td>
                                        <td className="p-4">
                                            <div className="font-bold text-white">{ticket.title}</div>
                                            <div className="text-xs truncate max-w-[200px]">{ticket.description}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 rounded bg-gray-800 border border-gray-700 text-xs">
                                                {ticket.category}
                                            </span>
                                        </td>
                                        <td className="p-4 font-mono text-xs">
                                            {ticket.latitude ? `${Number(ticket.latitude).toFixed(4)}, ${Number(ticket.longitude).toFixed(4)}` : 'N/A'}
                                        </td>
                                        
                                        <td className="p-4">
                                            {ticket.image_path ? (
                                                <a 
                                                    href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${ticket.image_path}`} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-blue-400 hover:text-blue-300 text-xs font-bold underline flex items-center gap-1"
                                                >
                                                    <span>📷 View Photo</span>
                                                </a>
                                            ) : (
                                                <span className="text-gray-600 text-xs">No Image</span>
                                            )}
                                        </td>

                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded font-bold text-xs uppercase ${
                                                ticket.status === 'resolved' ? 'bg-green-900/30 text-green-500' : 'bg-red-900/30 text-red-500'
                                            }`}>
                                                {ticket.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            {ticket.status !== 'resolved' && (
                                                <button 
                                                    onClick={() => updateStatus(ticket.id, 'resolved')}
                                                    className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-xs font-bold transition-all"
                                                >
                                                    MARK FIXED
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}