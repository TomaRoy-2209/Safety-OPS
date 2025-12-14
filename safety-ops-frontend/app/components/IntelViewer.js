"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function IntelViewer({ incident, onClose }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // DEBUG: Check what data we are actually receiving
    console.log("INTEL VIEWER DATA:", incident); 
    return () => setMounted(false);
  }, [incident]);

  if (!incident || !mounted) return null;

  // This "modalContent" is what we want to render
  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="bg-[#0a0a0a] w-full max-w-4xl max-h-[90vh] rounded-xl border border-blue-900/50 shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-800 bg-[#111] flex justify-between items-center">
            <div>
                <h2 className="text-xl font-bold text-white tracking-wide">EVIDENCE DOSSIER</h2>
                <p className="text-blue-500 text-xs font-mono uppercase tracking-widest">Incident #{incident.id}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-red-900/20 text-gray-400 hover:text-red-500 rounded transition-colors">
                ✕
            </button>
        </div>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Description */}
            <div className="bg-blue-900/10 border-l-2 border-blue-500 p-4 rounded-r">
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-1">Sitrep</h3>
                <p className="text-gray-200 leading-relaxed">{incident.description}</p>
            </div>

            {/* EVIDENCE GRID */}
            <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    Attached Visuals
                </h3>

                {/* CHECK 1: Do we have evidence? */}
                {incident.evidence && incident.evidence.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {incident.evidence.map((file, index) => (
                            <div key={index} className="group relative bg-black border border-gray-800 rounded-lg overflow-hidden">
                                
                                {/* CHECK 2: Is it an Image? */}
                                {(file.file_type === 'image' || file.file_type.includes('image')) && (
                                    <img 
                                        src={file.file_path} 
                                        alt={`Evidence ${index}`} 
                                        className="w-full h-64 object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null; 
                                            e.target.src="https://via.placeholder.com/400x300?text=BROKEN+LINK";
                                            console.error("Image failed to load:", file.file_path);
                                        }}
                                    />
                                )}

                                {/* CHECK 3: Is it a Video? */}
                                {(file.file_type === 'video' || file.file_type.includes('video')) && (
                                    <video controls className="w-full h-64 object-cover bg-black">
                                        <source src={file.file_path} type="video/mp4" />
                                        Video unavailable
                                    </video>
                                )}

                                <div className="absolute bottom-0 left-0 w-full bg-black/80 p-2 text-[10px] text-gray-400 font-mono border-t border-gray-800 truncate">
                                    SRC: {file.file_path}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center border border-dashed border-gray-800 rounded-lg bg-gray-900/50">
                        <p className="text-gray-500 font-mono text-sm">NO VISUAL EVIDENCE FOUND IN DATABASE</p>
                        <p className="text-xs text-gray-600 mt-2">Debug Info: Evidence array is empty or undefined.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800 bg-[#111] flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 border border-gray-600 text-gray-300 text-sm font-bold rounded">
                CLOSE
            </button>
        </div>

      </div>
    </div>
  );

  // MAGIC: This teleports the modal to the <body> tag
  return createPortal(modalContent, document.body);
}