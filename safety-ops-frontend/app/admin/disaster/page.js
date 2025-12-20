'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function DisasterMode() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleBroadcast = async () => {
    // 1. Double Confirmation (Safety First)
    if (!confirm("⚠️ WARNING: You are about to alert ALL citizens. This action cannot be undone. Are you sure?")) {
        return;
    }

    setLoading(true);
    setStatus(null);

    try {
      // 2. Get Token
      const token = localStorage.getItem('jwt') || localStorage.getItem('token'); 

      // 3. Send Request (Updated to localhost for consistency)
      const res = await fetch('http://localhost:1801/api/admin/disaster-mode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: message })
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', text: data.message });
        setMessage(''); // Clear box
      } else {
        setStatus({ type: 'error', text: data.message || "Broadcast Failed" });
      }

    } catch (err) {
      setStatus({ type: 'error', text: "Connection Error: Backend unreachable." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center justify-center relative">
      
      {/* ✅ NEW: Return to Dashboard Button */}
      <div className="absolute top-6 left-6">
        <Link href="/admin-dashboard">
            <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors uppercase font-bold text-sm tracking-widest border border-gray-700 hover:border-gray-500 px-4 py-2 rounded">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Return to Command
            </button>
        </Link>
      </div>

      {/* Header */}
      <div className="border-4 border-red-600 p-8 rounded-lg max-w-2xl w-full bg-gray-800 shadow-[0_0_50px_rgba(220,38,38,0.5)]">
        <h1 className="text-4xl font-black text-red-500 mb-2 tracking-widest text-center">
          ⚠️ EMERGENCY BROADCAST SYSTEM
        </h1>
        <p className="text-gray-400 text-center mb-8 uppercase tracking-widest">
          Authorized Personnel Only • Level 5 Clearance
        </p>

        {/* Input Area */}
        <div className="mb-6">
          <label className="block text-sm font-bold mb-2 text-red-400">BROADCAST MESSAGE</label>
          <textarea 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-gray-900 border border-red-900 p-4 rounded text-white focus:outline-none focus:border-red-500 h-32"
            placeholder="TYPE EMERGENCY INSTRUCTION HERE (e.g., Earthquake detected. Evacuate immediately.)"
          />
          <p className="text-xs text-gray-500 mt-2 text-right">{message.length}/160 chars</p>
        </div>

        {/* The Big Red Button */}
        <button 
          onClick={handleBroadcast}
          disabled={loading || message.length < 5}
          className={`w-full py-4 text-xl font-bold rounded uppercase tracking-widest transition-all
            ${loading 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-red-600 hover:bg-red-700 hover:shadow-[0_0_30px_rgba(220,38,38,0.8)]'
            }`}
        >
          {loading ? 'TRANSMITTING...' : 'INITIATE BROADCAST'}
        </button>

        {/* Status Messages */}
        {status && (
          <div className={`mt-6 p-4 rounded text-center font-bold ${status.type === 'success' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
            {status.text}
          </div>
        )}
      </div>
    </div>
  );
}