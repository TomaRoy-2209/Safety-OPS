"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DashboardLayout from '../components/DashboardLayout';

export default function MaintenancePage() {
    const router = useRouter();
    const [tickets, setTickets] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        title: '', category: 'Road', description: '', latitude: '', longitude: ''
    });

    useEffect(() => {
        const token = localStorage.getItem('jwt');
        if (!token) return router.push('/login');

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
            const res = await axios.get('http://localhost:1801/api/maintenance/my-tickets', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTickets(res.data);
        } catch (e) { console.error(e); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const token = localStorage.getItem('jwt');
        try {
            await axios.post('http://localhost:1801/api/maintenance/tickets', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("✅ Ticket Submitted!");
            setFormData({ ...formData, title: '', description: '' });
            fetchTickets(token);
        } catch (e) { alert("Error submitting ticket"); }
        setSubmitting(false);
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
                {/* LIST */}
                <div className="bg-[#0a0a0a] border border-gray-800 p-6 rounded-xl">
                    <h2 className="text-xl font-bold text-white mb-4">My Reports</h2>
                    <div className="space-y-3 h-96 overflow-auto">
                        {tickets.map(t => (
                            <div key={t.id} className="bg-[#111] p-4 rounded border border-gray-800">
                                <h3 className="font-bold text-white">{t.title}</h3>
                                <p className="text-gray-400 text-sm">{t.description}</p>
                                <div className="mt-2 text-xs text-yellow-500 font-mono">STATUS: {t.status.toUpperCase()}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
