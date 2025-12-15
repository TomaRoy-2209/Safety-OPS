"use client";
import { useState } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';

export default function AccessControlPanel() {
    // 1. HARDCODE ROLE TO 'worker'
    const [formData, setFormData] = useState({
        name: '', 
        email: '', 
        password: '', 
        role: 'worker', // <--- FORCED
        agency: 'Police Dept', 
        unit: 'Alpha Team'
    });
    
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");

    const unitOptions = {
        'Police Dept': ['Alpha Team', 'Bravo Team', 'Special Ops'],
        'Fire Service': ['Station 5', 'Station 9', 'Hazmat Unit'],
        'Medical Team': ['Rapid Response A', 'ICU Team B']
    };

    const handleAgencyChange = (agency) => {
        setFormData({
            ...formData, 
            agency: agency, 
            unit: unitOptions[agency][0] 
        });
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem('jwt');
        
        try {
            await axios.post('http://127.0.0.1:1801/api/admin/users', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess(`✅ FIELD UNIT DEPLOYED: ${formData.name} assigned to ${formData.unit}`);
            setFormData({ ...formData, name: '', email: '', password: '' }); 
        } catch (error) {
            console.error(error);
            alert("Creation Failed. Email might be in use.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout title="FIELD UNIT PROVISIONING">
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                
                <form onSubmit={handleCreateUser} className="bg-[#0a0a0a] border border-gray-800 p-8 rounded-xl shadow-2xl space-y-6 relative overflow-hidden">
                    
                    <h2 className="text-xl font-bold text-white border-b border-gray-800 pb-4">
                        Create Field Officer Account
                    </h2>

                    {success && <div className="p-3 bg-green-900/30 text-green-400 text-sm font-bold border border-green-500/30 rounded">{success}</div>}

                    {/* 1. Agency Selection */}
                    <div>
                        <label className="text-[10px] text-gray-500 font-bold uppercase mb-2 block">Department</label>
                        <div className="grid grid-cols-3 gap-2">
                            {Object.keys(unitOptions).map(agency => (
                                <button
                                    type="button"
                                    key={agency}
                                    onClick={() => handleAgencyChange(agency)}
                                    className={`p-2 text-xs font-bold rounded border transition-all ${
                                        formData.agency === agency 
                                        ? 'bg-blue-600 text-white border-blue-500' 
                                        : 'bg-[#111] text-gray-500 border-gray-700 hover:border-gray-500'
                                    }`}
                                >
                                    {agency}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 2. Unit Selection */}
                    <div>
                        <label className="text-[10px] text-blue-500 font-bold uppercase mb-2 block">Assign Unit</label>
                        <select 
                            className="w-full bg-[#111] border border-blue-500/50 text-white p-3 rounded focus:outline-none focus:border-blue-400 font-mono text-sm"
                            value={formData.unit}
                            onChange={(e) => setFormData({...formData, unit: e.target.value})}
                        >
                            {unitOptions[formData.agency].map(u => (
                                <option key={u} value={u}>{u}</option>
                            ))}
                        </select>
                    </div>

                    {/* 3. Personal Info */}
                    <div className="space-y-4">
                        <input 
                            type="text" placeholder="Officer Name" required
                            className="w-full bg-[#111] border border-gray-700 rounded p-3 text-white text-sm focus:border-blue-500 outline-none"
                            value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                        <input 
                            type="email" placeholder="Official Email" required
                            className="w-full bg-[#111] border border-gray-700 rounded p-3 text-white text-sm focus:border-blue-500 outline-none"
                            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                        <input 
                            type="password" placeholder="Password" required
                            className="w-full bg-[#111] border border-gray-700 rounded p-3 text-white text-sm focus:border-blue-500 outline-none"
                            value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                        />
                    </div>
                    
                    {/* HIDDEN ROLE INFO (Visual Only) */}
                    <div className="text-[10px] text-gray-500 font-mono text-center">
                        ACCOUNT TYPE LOCKED: FIELD_WORKER_UNIT
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded shadow-lg shadow-blue-900/20 transition-all text-sm tracking-wide"
                    >
                        {loading ? 'PROCESSING...' : 'AUTHORIZE OFFICER'}
                    </button>
                </form>

                <div className="space-y-6 text-gray-400 text-sm leading-relaxed">
                    <div className="bg-blue-900/10 border border-blue-500/20 p-6 rounded-xl">
                        <h3 className="text-blue-400 font-bold mb-2">Restricted Access Panel</h3>
                        <p>
                            Use this terminal to create accounts for ground units only.
                        </p>
                        <ul className="mt-4 space-y-2 list-disc list-inside text-xs font-mono text-gray-500">
                            <li>These users will have <strong>ReadOnly</strong> access to the system.</li>
                            <li>They will <strong>ONLY</strong> receive dispatch alerts for their specific unit.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}