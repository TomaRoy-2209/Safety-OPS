"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../components/DashboardLayout';

export default function AdminMaintenanceLog() {
    const router = useRouter();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('jwt');
        const role = localStorage.getItem('role');

        // ✅ Allow 'admin' OR 'worker'
        if (!token || (role !== 'admin' && role !== 'worker')) {
            router.push('/login');
            return;
        }

        fetchMaintenanceLog(token);
    }, [router]);

    const fetchMaintenanceLog = async (token) => {
        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1801';
            
            const res = await axios.get(`${API_URL}/api/admin/maintenance/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTickets(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching log", error);
            setLoading(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        const token = localStorage.getItem('jwt');
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1801';

        try {
            await axios.put(`${API_URL}/api/admin/maintenance/${id}`, 
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            fetchMaintenanceLog(token);
            alert(`Ticket marked as ${newStatus}`);
        } catch (error) {
            alert("Failed to update status");
        }
    };

    // 🛡️ HELPER: intelligently handles Cloudinary (Absolute) vs Local (Relative) paths
    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http') || path.startsWith('https')) {
            return path; // It's already a full Cloudinary URL
        }
        // It's a local file, prepend the API URL
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1801';
        return `${API_URL}${path}`;
    };

    return (
        <DashboardLayout title="OFFICIAL MAINTENANCE LOG">
            <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl overflow-hidden">
                
                {/* Header Section */}
                <div className="p-6 border-b border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-white">Infrastructure Issues</h2>
                        <p className="text-gray-400 text-sm">Real-time log of citizen-reported hazards.</p>
                    </div>
                    <div className="flex items-center gap-4 bg-[#111] px-4 py-2 rounded-lg border border-gray-800">
                        <span className="text-2xl font-bold text-white">{tickets.length}</span>
                        <span className="text-xs text-gray-500 uppercase font-bold leading-tight">Total<br/>Tickets</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400 whitespace-nowrap">
                        <thead className="bg-[#111] text-gray-200 uppercase font-bold text-xs">
                            <tr>
                                <th className="p-4 hidden md:table-cell">ID</th>
                                <th className="p-4">Issue Details</th>
                                <th className="p-4 hidden md:table-cell">Category</th>
                                <th className="p-4 hidden md:table-cell">Location</th>
                                <th className="p-4 hidden md:table-cell">Evidence</th>
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
                                tickets.map(ticket => {
                                    // Calculate the correct image URL for this specific ticket
                                    // Use 'image' (from backend consistency) or 'image_path' depending on your DB column
                                    const rawPath = ticket.image_path || ticket.image; 
                                    const finalImageUrl = getImageUrl(rawPath);

                                    return (
                                        <tr key={ticket.id} className="hover:bg-white/5 transition-colors">
                                            
                                            {/* 1. ID */}
                                            <td className="p-4 font-mono text-gray-500 hidden md:table-cell">#{ticket.id}</td>
                                            
                                            {/* 2. MAIN ISSUE */}
                                            <td className="p-4">
                                                <div className="font-bold text-white text-base">{ticket.title}</div>
                                                <div className="text-xs text-gray-500 truncate max-w-[150px] md:max-w-[200px]">{ticket.description}</div>
                                                
                                                {/* MOBILE ONLY BLOCK */}
                                                <div className="md:hidden mt-2 space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 text-[10px] font-bold uppercase">
                                                            {ticket.category}
                                                        </span>
                                                        <span className="text-[10px] font-mono">#{ticket.id}</span>
                                                    </div>
                                                    {finalImageUrl && (
                                                        <a href={finalImageUrl} target="_blank" className="text-blue-400 text-[10px] flex items-center gap-1 hover:underline">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                            View Evidence
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                            
                                            {/* 3. DESKTOP COLUMNS */}
                                            <td className="p-4 hidden md:table-cell">
                                                <span className="px-2 py-1 rounded bg-gray-800 border border-gray-700 text-xs">{ticket.category}</span>
                                            </td>
                                            
                                            <td className="p-4 font-mono text-xs hidden md:table-cell">
                                                {ticket.latitude ? `${Number(ticket.latitude).toFixed(4)}, ${Number(ticket.longitude).toFixed(4)}` : 'N/A'}
                                            </td>
                                            
                                            <td className="p-4 hidden md:table-cell">
                                                {finalImageUrl ? (
                                                    <a href={finalImageUrl} target="_blank" rel="noopener noreferrer" className="block w-12 h-12 rounded overflow-hidden border border-gray-700 hover:border-blue-500 transition-colors">
                                                        <img src={finalImageUrl} alt="Evidence" className="w-full h-full object-cover" />
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-700 text-[10px]">No Photo</span>
                                                )}
                                            </td>

                                            {/* 4. STATUS */}
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded font-bold text-[10px] uppercase border ${
                                                    ticket.status === 'resolved' 
                                                    ? 'bg-green-900/20 text-green-500 border-green-900/50' 
                                                    : 'bg-red-900/20 text-red-500 border-red-900/50'
                                                }`}>
                                                    {ticket.status}
                                                </span>
                                            </td>
                                            
                                            {/* 5. ACTIONS */}
                                            <td className="p-4 text-right">
                                                {ticket.status !== 'resolved' && (
                                                    <button 
                                                        onClick={() => updateStatus(ticket.id, 'resolved')}
                                                        className="bg-green-600 hover:bg-green-500 text-white p-2 md:px-3 md:py-1 rounded text-xs font-bold transition-all shadow-lg shadow-green-900/20"
                                                    >
                                                        <span className="md:hidden">✓</span>
                                                        <span className="hidden md:inline">MARK FIXED</span>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
}