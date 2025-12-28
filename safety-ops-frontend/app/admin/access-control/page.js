"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../../components/DashboardLayout';

export default function AccessControlPanel() {
    // TOGGLE STATE: 'emergency' or 'municipality'
    const [unitClass, setUnitClass] = useState('emergency'); 

    const [formData, setFormData] = useState({
        name: '', 
        email: '', 
        password: '', 
        phone: '', 
        role: 'responder', // Default
        agency: '', 
        unit: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");

    // --- DATA SETS ---
    const emergencyOptions = {
        'Police Dept': ['Alpha Team', 'Bravo Team', 'Special Ops', 'Traffic Control'],
        'Fire Service': ['Station 1 (HQ)', 'Station 5', 'Hazmat Unit', 'Rescue Squad'],
        'Medical Team': ['Rapid Response A', 'ICU Team B', 'Ambulance Corps']
    };

    const municipalityOptions = {
        'City Corporation': ['Road Maintenance', 'Waste Management', 'Street Lighting', 'Mosquito Control'],
        'WASA (Water)': ['Pipeline Repair', 'Sewage Unit', 'Pump Operations'],
        'Power Grid (DESCO)': ['Line Maintenance', 'Transformer Unit', 'Emergency Repair']
    };

    // Get the correct options based on toggle
    const currentOptions = unitClass === 'emergency' ? emergencyOptions : municipalityOptions;

    // Update defaults when toggling class
    useEffect(() => {
        const firstAgency = Object.keys(currentOptions)[0];
        setFormData(prev => ({
            ...prev,
            role: unitClass === 'emergency' ? 'responder' : 'worker', // ✅ AUTO SWITCH ROLE
            agency: firstAgency,
            unit: currentOptions[firstAgency][0]
        }));
    }, [unitClass]);

    const handleAgencyChange = (agency) => {
        setFormData({
            ...formData, 
            agency: agency, 
            unit: currentOptions[agency][0] 
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
            setSuccess(`✅ ${unitClass.toUpperCase()} UNIT DEPLOYED: ${formData.name}`);
            setFormData({ ...formData, name: '', email: '', password: '', phone: '' }); 
        } catch (error) {
            console.error(error);
            alert("Creation Failed. Email might be in use.");
        } finally {
            setLoading(false);
        }
    };

    const isEmergency = unitClass === 'emergency';

    return (
        <DashboardLayout title="UNIT PROVISIONING & ACCESS">
            <div className="max-w-4xl mx-auto">
                
                {/* --- 1. CLASS TOGGLE --- */}
                <div className="flex gap-4 mb-8">
                    <button 
                        onClick={() => setUnitClass('emergency')}
                        className={`flex-1 p-6 rounded-xl border-2 transition-all flex items-center justify-center gap-4 ${
                            isEmergency 
                            ? 'bg-blue-900/20 border-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]' 
                            : 'bg-[#0a0a0a] border-gray-800 text-gray-500 hover:border-gray-700'
                        }`}
                    >
                        <span className="text-3xl">🚓</span>
                        <div className="text-left">
                            <h3 className="font-bold text-lg">Emergency Responder</h3>
                            <p className="text-xs opacity-70">Police, Fire, EMS (Life Critical)</p>
                        </div>
                    </button>

                    <button 
                        onClick={() => setUnitClass('municipality')}
                        className={`flex-1 p-6 rounded-xl border-2 transition-all flex items-center justify-center gap-4 ${
                            !isEmergency 
                            ? 'bg-yellow-900/20 border-yellow-500 text-white shadow-[0_0_20px_rgba(234,179,8,0.3)]' 
                            : 'bg-[#0a0a0a] border-gray-800 text-gray-500 hover:border-gray-700'
                        }`}
                    >
                        <span className="text-3xl">🚧</span>
                        <div className="text-left">
                            <h3 className="font-bold text-lg">Municipality Worker</h3>
                            <p className="text-xs opacity-70">City Corp, Utilities (Maintenance)</p>
                        </div>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* FORM */}
                    <form onSubmit={handleCreateUser} className="bg-[#0a0a0a] border border-gray-800 p-8 rounded-xl shadow-2xl space-y-6 relative overflow-hidden">
                        
                        <h2 className={`text-xl font-bold border-b pb-4 ${isEmergency ? 'text-blue-500 border-blue-900' : 'text-yellow-500 border-yellow-900'}`}>
                            Deploy New {isEmergency ? 'Responder' : 'Worker'}
                        </h2>

                        {success && <div className="p-3 bg-green-900/30 text-green-400 text-sm font-bold border border-green-500/30 rounded">{success}</div>}

                        {/* Agency Selection */}
                        <div>
                            <label className="text-[10px] text-gray-500 font-bold uppercase mb-2 block">Organization</label>
                            <div className="grid grid-cols-1 gap-2">
                                {Object.keys(currentOptions).map(agency => (
                                    <button
                                        type="button"
                                        key={agency}
                                        onClick={() => handleAgencyChange(agency)}
                                        className={`p-3 text-xs font-bold rounded border transition-all text-left flex justify-between ${
                                            formData.agency === agency 
                                            ? (isEmergency ? 'bg-blue-600 text-white border-blue-500' : 'bg-yellow-600 text-black border-yellow-500')
                                            : 'bg-[#111] text-gray-500 border-gray-700 hover:border-gray-500'
                                        }`}
                                    >
                                        <span>{agency}</span>
                                        {formData.agency === agency && <span>✓</span>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Unit Selection */}
                        <div>
                            <label className={`text-[10px] font-bold uppercase mb-2 block ${isEmergency ? 'text-blue-500' : 'text-yellow-500'}`}>
                                Assign Unit / Division
                            </label>
                            <select 
                                className={`w-full bg-[#111] border text-white p-3 rounded focus:outline-none font-mono text-sm ${
                                    isEmergency ? 'border-blue-500/50 focus:border-blue-400' : 'border-yellow-500/50 focus:border-yellow-400'
                                }`}
                                value={formData.unit}
                                onChange={(e) => setFormData({...formData, unit: e.target.value})}
                            >
                                {currentOptions[formData.agency]?.map(u => (
                                    <option key={u} value={u}>{u}</option>
                                ))}
                            </select>
                        </div>

                        {/* Personal Info */}
                        <div className="space-y-4">
                            <input 
                                type="text" placeholder="Personnel Name" required
                                className="w-full bg-[#111] border border-gray-700 rounded p-3 text-white text-sm focus:border-gray-500 outline-none"
                                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                            />
                            <input 
                                type="email" placeholder="Official Email" required
                                className="w-full bg-[#111] border border-gray-700 rounded p-3 text-white text-sm focus:border-gray-500 outline-none"
                                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                            />
                            <div>
                                <label className="block text-gray-400 text-xs font-bold mb-1 uppercase">Mobile (SMS Alerts)</label>
                                <input 
                                    type="text" placeholder="01711..." required
                                    className="w-full bg-[#111] border border-gray-700 rounded p-3 text-white text-sm focus:border-gray-500 outline-none font-mono"
                                    value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                />
                            </div>
                            <input 
                                type="password" placeholder="Password" required
                                className="w-full bg-[#111] border border-gray-700 rounded p-3 text-white text-sm focus:border-gray-500 outline-none"
                                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className={`w-full font-bold py-3 rounded shadow-lg transition-all text-sm tracking-wide ${
                                isEmergency 
                                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20' 
                                : 'bg-yellow-600 hover:bg-yellow-500 text-black shadow-yellow-900/20'
                            }`}
                        >
                            {loading ? 'PROCESSING...' : `AUTHORIZE ${isEmergency ? 'RESPONDER' : 'WORKER'}`}
                        </button>
                    </form>

                    {/* INFO PANEL */}
                    <div className="space-y-6 text-gray-400 text-sm leading-relaxed">
                        <div className={`border p-6 rounded-xl ${
                            isEmergency 
                            ? 'bg-blue-900/10 border-blue-500/20' 
                            : 'bg-yellow-900/10 border-yellow-500/20'
                        }`}>
                            <h3 className={`font-bold mb-2 ${isEmergency ? 'text-blue-500' : 'text-yellow-500'}`}>
                                {isEmergency ? 'Emergency Response Protocols' : 'Infrastructure Maintenance Protocols'}
                            </h3>
                            <p>
                                {isEmergency 
                                    ? "These units handle life-threatening incidents (Fire, Crime, Medical). They receive high-priority alerts with siren overrides."
                                    : "These units handle non-emergency infrastructure issues (Potholes, Utilities). They receive standard work orders."
                                }
                            </p>
                            <ul className="mt-4 space-y-2 list-disc list-inside text-xs font-mono opacity-70">
                                <li>Role Assigned: <strong>{formData.role.toUpperCase()}</strong></li>
                                <li>Access Level: <strong>READ_ONLY + STATUS_UPDATE</strong></li>
                                <li>Notification Channel: <strong>Push + SMS</strong></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}