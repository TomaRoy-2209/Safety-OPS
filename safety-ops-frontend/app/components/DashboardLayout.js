"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function DashboardLayout({ children, title }) {
    const [role, setRole] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const userRole = localStorage.getItem('role');
            const token = localStorage.getItem('jwt');
            
            if (!token) {
                router.push('/login');
            } else {
                setRole(userRole);
            }
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.clear(); 
        router.push('/login');
    };

    const getHomeLink = () => {
        if (role === 'admin') return '/admin-dashboard';
        if (role === 'responder') return '/worker-dashboard'; 
        if (role === 'worker') return '/worker-dashboard';
        return '/dashboard'; 
    };

    // 🛠️ UPDATED NAVIGATION ITEMS
    const navItems = [
        { label: 'Overview', href: getHomeLink(), icon: '🏠', roles: ['citizen', 'responder', 'admin', 'worker'] },
        
        // ✅ ADDED: Safety Map (Accessible to EVERYONE)
        { label: 'Safety Map', href: '/safety-map', icon: '🗺️', roles: ['citizen', 'responder', 'admin', 'worker'] },

        { label: 'New Report', href: '/report', icon: '🚨', roles: ['citizen', 'responder', 'admin'] },
        { label: 'Maintenance Log', href: '/admin/maintenance', icon: '📋', roles: ['admin', 'worker'] },
        { label: 'Dispatch Control', href: '/dispatch', icon: '🚓', roles: ['admin', 'responder'] },
        { label: 'Live Intel Feed', href: '/live-feed', icon: '📡', roles: ['admin', 'responder'] },
        { label: 'Tactical Map', href: '/map', icon: '🗺️', roles: ['admin', 'responder', 'citizen', 'worker'] },
        { label: 'Risk Assessment', href: '/admin/risk-assessment', icon: '📊', roles: ['admin', 'responder', 'citizen'] },
        { label: 'User Database', href: '/admin/users', icon: '👥', roles: ['admin'] },
        { label: 'Access Control', href: '/admin/access-control', icon: '🔑', roles: ['admin'] },
        { label: 'Export Reports', href: '/admin/reports', icon: '📂', roles: ['admin'] },
    ];

    if (!role) return null;

    return (
        <div className="flex min-h-screen bg-[#020617] text-white font-sans overflow-x-hidden">
            
            {/* --- MOBILE HEADER --- */}
            <div className="md:hidden fixed top-0 w-full z-50 bg-[#0B0C10] border-b border-gray-800 p-4 flex justify-between items-center">
                <div className="font-bold tracking-wider">SAFETY<span className="text-blue-500">OPS</span></div>
                <button 
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-gray-400 hover:text-white border border-gray-700 rounded"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isMobileMenuOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* --- SIDEBAR --- */}
            <aside className={`
                fixed inset-y-0 left-0 z-40 w-64 bg-[#0B0C10] border-r border-gray-800 flex flex-col 
                transform transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
                md:translate-x-0 md:static md:flex shrink-0
            `}>
                
                {/* 1. BRANDING */}
                <div className="h-16 flex items-center px-6 border-b border-gray-800 bg-[#0B0C10] hidden md:flex shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600/20 text-blue-500 rounded-lg flex items-center justify-center border border-blue-600/30">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                        </div>
                        <h1 className="text-lg font-bold tracking-wider text-gray-100">
                            SAFETY<span className="text-blue-500">OPS</span>
                        </h1>
                    </div>
                </div>

                {/* 2. NAVIGATION (Grows to fill space) */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-16 md:mt-0 custom-scrollbar">
                    <p className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 mt-2">Operations</p>
                    {navItems.map((item) => {
                        if (item.roles.includes(role)) {
                            const isActive = pathname === item.href;
                            return (
                                <Link 
                                    key={item.label} 
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group ${
                                        isActive 
                                        ? 'bg-blue-600 text-white shadow-md' 
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                    }`}
                                >
                                    <span className="text-lg group-hover:scale-110 transition-transform">{item.icon}</span>
                                    <span>{item.label}</span>
                                    
                                    {/* Optional: Add a subtle 'Live' dot for the map */}
                                    {item.label === 'Safety Map' && !isActive && (
                                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                    )}
                                </Link>
                            );
                        }
                        return null;
                    })}
                </nav>

                {/* 3. BOTTOM SECTION (Sticks to bottom) */}
                <div className="p-4 border-t border-gray-800 bg-[#08090C] mt-auto">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-xs font-bold text-blue-400">
                            {role.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-white capitalize">{role} Unit</p>
                            <p className="text-[10px] text-green-500">● Connected</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="w-full py-2 text-xs font-bold text-red-500 border border-red-900/30 rounded hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        TERMINATE SESSION
                    </button>
                </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <main className="flex-1 relative flex flex-col min-w-0 pt-16 md:pt-0"> 
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none z-0"></div>

                <header className="hidden md:flex h-16 border-b border-gray-800/50 items-center justify-between px-8 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-10">
                    <h2 className="text-xl font-bold text-gray-100 tracking-wide">{title}</h2>
                    <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-mono">
                        SYSTEM SECURE
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-4 md:p-8 relative z-10">
                    {children}
                </div>
            </main>

            {/* --- OVERLAY --- */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    );
}