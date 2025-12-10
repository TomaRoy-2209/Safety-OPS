"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';
//import DashboardLayout from '../../components/dashboard/page';


//import DashboardLayout from '../../../components/DashboardLayout'; // Adjust dots if needed

export default function UserManagementPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch Users on Load
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            // Note: Check your port (1801 vs 8000)
            const res = await axios.get('http://127.0.0.1:1801/api/admin/users');
            setUsers(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await axios.put(`http://127.0.0.1:1801/api/admin/users/${userId}/role`, {
                role: newRole
            });
            alert("Role Updated!");
            fetchUsers(); // Refresh the list
        } catch (error) {
            alert("Failed to update role");
        }
    };

    return (
        <DashboardLayout title="Access Control Panel">
            <div className="bg-cyber-panel rounded-xl border border-cyber-border overflow-hidden">
                
                {/* Header Row */}
                <div className="grid grid-cols-4 bg-cyber-black p-4 text-xs font-bold text-cyber-muted uppercase tracking-wider">
                    <div>User Name</div>
                    <div>Email</div>
                    <div>Current Role</div>
                    <div>Action</div>
                </div>

                {/* User List */}
                <div className="divide-y divide-cyber-border">
                    {loading ? (
                        <div className="p-8 text-center text-white">Loading Personnel Database...</div>
                    ) : users.map(user => (
                        <div key={user.id} className="grid grid-cols-4 p-4 items-center hover:bg-white/5 transition-colors">
                            <div className="text-white font-medium">{user.name}</div>
                            <div className="text-cyber-muted text-sm">{user.email}</div>
                            <div>
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase border ${
                                    user.role === 'admin' ? 'border-red-500 text-red-500' :
                                    user.role === 'responder' ? 'border-blue-500 text-blue-500' :
                                    'border-gray-500 text-gray-500'
                                }`}>
                                    {user.role}
                                </span>
                            </div>
                            <div>
                                <select 
                                    className="bg-cyber-black text-white border border-cyber-border text-sm rounded p-2 outline-none focus:border-cyber-primary"
                                    value={user.role}
                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                >
                                    <option value="citizen">Citizen</option>
                                    <option value="responder">Responder</option>
                                    <option value="police">Police</option>
                                    <option value="fire">Fire Service</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
