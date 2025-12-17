"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    const role = localStorage.getItem('role');

    if (token && role) {
        // Smart Redirect for existing session
        switch(role) {
            case 'admin': router.push('/admin-dashboard'); break;
            case 'responder': router.push('/responder-dashboard'); break;
            case 'worker': router.push('/worker-dashboard'); break;
            default: router.push('/dashboard'); break;
        }
    } else {
        // No session? Go to login
        router.push('/login');
    }
  }, [router]);

  return (
    <div className="h-screen w-full bg-[#020617] flex items-center justify-center text-blue-500 font-mono animate-pulse">
        INITIALIZING SYSTEM...
    </div>
  );
}