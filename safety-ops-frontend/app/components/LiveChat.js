"use client";
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Pusher from 'pusher-js'; // <--- Direct Import

export default function LiveChat({ incidentId, user }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const token = localStorage.getItem('jwt');

        // 1. Fetch History
        axios.get(`http://localhost:1801/api/chat/${incidentId}`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then(res => {
            setMessages(res.data);
            scrollToBottom();
        });

        // 2. RAW PUSHER CONNECTION (Bypassing Laravel Echo)
        // We connect directly to the channel 'chat.X' and event 'message.sent'
        
        // Enable logging so you can see it working in F12 console
        Pusher.logToConsole = true; 

        const pusher = new Pusher('9d9322e7fc4562919851', { // <--- Your Key
            cluster: 'ap2',                                 // <--- Your Cluster
            forceTLS: true
        });

        const channelName = `chat.${incidentId}`;
        const channel = pusher.subscribe(channelName);

        console.log("🔌 Subscribed to Raw Channel:", channelName);

        channel.bind('message.sent', (data) => {
            console.log("📨 RAW MSG RECEIVED:", data);
            
            // --- THE FIX ---
            // If the incoming message's User ID matches MY User ID, 
            // ignore it. I already added it optimistically.
            if (data.user && user && data.user.id === user.id) {
                console.log("Ignoring my own echo.");
                return; 
            }
            
            // Otherwise, it's from someone else. Add it!
            setMessages(prev => {
                // Double check to prevent duplicates by ID just in case
                if (prev.find(m => m.id === data.id)) return prev;
                return [...prev, data];
            });
            
            scrollToBottom();
        });

        // Cleanup
        return () => {
            channel.unbind_all();
            channel.unsubscribe();
        };
    }, [incidentId]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const token = localStorage.getItem('jwt');
        
        // Optimistic UI Update
        const tempMsg = {
            id: Date.now(), // Temp ID
            message: newMessage,
            user: { id: user.id, name: user.name, role: user.role }
        };
        
        setMessages(prev => [...prev, tempMsg]);
        setNewMessage('');
        scrollToBottom();

        try {
            // Send to Backend
            await axios.post(`http://localhost:1801/api/chat/${incidentId}`, 
                { message: tempMsg.message },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (err) {
            console.error("Msg failed", err);
        }
    };

    return (
        <div className="flex flex-col h-[400px] bg-[#050505] border border-gray-800 rounded-lg overflow-hidden mt-6">
            
            {/* Header */}
            <div className="p-3 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-gray-300 font-bold text-xs uppercase tracking-wider">Secure Uplink</span>
                </div>
                <span className="text-[10px] text-gray-500 font-mono">CHANNEL-{incidentId}</span>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0a0a]">
                {messages.length === 0 && (
                    <div className="text-center text-gray-600 text-xs py-10 italic">
                        No communications recorded. Start the uplink...
                    </div>
                )}
                
                {messages.map((msg, idx) => {
                    const isMe = msg.user?.id === user?.id; // Safe check with ?
                    return (
                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                                isMe 
                                ? 'bg-blue-600 text-white rounded-br-none' 
                                : 'bg-[#1a1a1a] text-gray-300 border border-gray-800 rounded-bl-none'
                            }`}>
                                <div className="text-[10px] opacity-60 mb-1 font-bold uppercase flex justify-between gap-4">
                                    <span>{msg.user?.name || 'Unknown'}</span>
                                </div>
                                {msg.message}
                            </div>
                        </div>
                    )
                })}
                <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 bg-gray-900 border-t border-gray-800 flex gap-2">
                <input
                    className="flex-1 bg-[#111] text-white text-sm border border-gray-700 rounded-lg px-3 py-2 focus:border-blue-500 outline-none placeholder-gray-600"
                    placeholder="Type intelligence update..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                />
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold text-xs">
                    SEND
                </button>
            </form>
        </div>
    );
}