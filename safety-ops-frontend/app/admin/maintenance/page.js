"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../../components/DashboardLayout';

export default function AdminMaintenanceLog() {
    const router = useRouter();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. Fetch All Tickets on Load
    useEffect(() => {
        const token = localStorage.getItem('jwt');
        const role = localStorage.getItem('role');

        if (!token || role !== 'admin') {
            router.push('/login');
            return;
        }

        fetchMaintenanceLog(token);
    }, [router]);

    const fetchMaintenanceLog = async (token) => {
        try {
            const res = await axios.get('http://localhost:1801/api/admin/maintenance/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTickets(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching log", error);
            setLoading(false);
        }
    };

    // 2. Function to "Resolve" a Ticket
    const updateStatus = async (id, newStatus) => {
        const token = localStorage.getItem('jwt');
        try {
            await axios.put(`http://localhost:1801/api/admin/maintenance/${id}`, 
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Refresh the list to show new status
            fetchMaintenanceLog(token);
            alert(`Ticket marked as ${newStatus}`);
        } catch (error) {
            alert("Failed to update status");
        }
    };

    return (
        <DashboardLayout title="OFFICIAL MAINTENANCE LOG">
            <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl overflow-hidden">
                
                {/* HEADER */}
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white">Infrastructure Issues</h2>
                        <p className="text-gray-400 text-sm">Real-time log of citizen-reported hazards.</p>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-white">{tickets.length}</span>
                        <span className="text-xs text-gray-500 block uppercase">Total Tickets</span>
                    </div>
                </div>

                {/* THE LOG TABLE */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-400">
                        <thead className="bg-[#111] text-gray-200 uppercase font-bold text-xs">
                            <tr>
                                <th className="p-4">ID</th>
                                <th className="p-4">Issue</th>
                                <th className="p-4">Category</th>
                                <th className="p-4">Location</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                <tr><td colSpan="6" className="p-8 text-center animate-pulse">LOADING LOG DATA...</td></tr>
                            ) : tickets.length === 0 ? (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-600">Maintenance Log is Empty.</td></tr>
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
