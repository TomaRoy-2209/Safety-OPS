"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        const token = localStorage.getItem('jwt');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        try {
            const res = await axios.get('http://127.0.0.1:1801/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            const userData = Array.isArray(res.data) ? res.data : res.data.data || res.data.users;
            setUsers(userData);
            setLoading(false);

        } catch (err) {
            console.error("Fetch Error:", err);
            setError("Access Denied or Server Error");
            setLoading(false);
        }
    };

    // Color Logic (Yellow for Workers, Blue for Citizens)
    const getRoleColor = (role) => {
        switch(role) {
            case 'admin': 
                return 'bg-red-900/30 text-red-500 border-red-500/30';
            case 'responder': 
                return 'bg-emerald-900/30 text-emerald-500 border-emerald-500/30';
            case 'worker': 
                return 'bg-yellow-900/30 text-yellow-500 border-yellow-500/30'; 
            default: 
                return 'bg-blue-900/30 text-blue-500 border-blue-500/30';
        }
    };

    return (
        <DashboardLayout title="PERSONNEL DATABASE">
            <div className="space-y-6">
                
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#0a0a0a] border border-gray-800 p-4 rounded-lg flex justify-between items-center">
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Total Users</p>
                            <p className="text-2xl font-mono text-white font-bold">{users.length}</p>
                        </div>
                        <div className="p-2 bg-gray-800 rounded-lg text-gray-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                        </div>
                    </div>
                </div>

                {/* Main Table Card */}
                <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl overflow-hidden shadow-xl">
                    
                    {/* Header */}
                    <div className="p-6 border-b border-gray-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#111]">
                        <h3 className="text-white font-bold text-lg">Registered Personnel</h3>
                        <button onClick={fetchUsers} className="w-full md:w-auto px-4 py-2 bg-blue-900/20 hover:bg-blue-900/40 border border-blue-500/30 rounded text-xs text-blue-400 font-bold flex items-center justify-center gap-2 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                            REFRESH DATA
                        </button>
                    </div>

                    {/* Table Content */}
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="p-12 text-center text-blue-500 font-mono animate-pulse">DECRYPTING USER RECORDS...</div>
                        ) : error ? (
                            <div className="p-12 text-center text-red-500 font-mono">{error}</div>
                        ) : (
                            <table className="w-full text-left whitespace-nowrap">
                                <thead className="bg-[#050505] text-gray-500 text-[10px] uppercase font-bold tracking-wider">
                                    <tr>
                                        {/* ID - Hidden on Mobile */}
                                        <th className="p-4 border-b border-gray-800 hidden md:table-cell">ID</th>
                                        
                                        <th className="p-4 border-b border-gray-800">Identity</th>
                                        
                                        {/* NEW COLUMN: Unit Assignment (Hidden on Mobile) */}
                                        <th className="p-4 border-b border-gray-800 hidden md:table-cell">Assignment</th>
                                        
                                        <th className="p-4 border-b border-gray-800">Clearance Level</th>
                                        
                                        {/* Date - Hidden on Mobile */}
                                        <th className="p-4 border-b border-gray-800 hidden md:table-cell">Joined</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                                            
                                            {/* ID (Desktop) */}
                                            <td className="p-4 font-mono text-gray-500 text-xs hidden md:table-cell">#{user.id}</td>
                                            
                                            {/* Name + Mobile Info Stack */}
                                            <td className="p-4">
                                                <div className="font-bold text-white text-sm group-hover:text-blue-400">{user.name}</div>
                                                <div className="text-gray-500 text-xs font-mono">{user.email}</div>
                                                
                                                {/* MOBILE ONLY: Show Unit here since column is hidden */}
                                                <div className="md:hidden mt-1">
                                                    {user.unit ? (
                                                        <span className="text-[10px] bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded border border-gray-700">
                                                            {user.unit}
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </td>
                                            
                                            {/* Assignment (Desktop) */}
                                            <td className="p-4 hidden md:table-cell">
                                                {user.unit ? (
                                                    <div className="flex flex-col">
                                                        <span className="text-white text-xs font-bold">{user.unit}</span>
                                                        <span className="text-[10px] text-gray-500">{user.agency || 'N/A'}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-600 text-xs">-</span>
                                                )}
                                            </td>
                                            
                                            {/* Role */}
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded border text-[10px] font-bold uppercase tracking-wider ${getRoleColor(user.role)}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            
                                            {/* Date (Desktop) */}
                                            <td className="p-4 text-gray-500 text-xs hidden md:table-cell">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}