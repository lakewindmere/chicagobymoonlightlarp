'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cinzel, Cinzel_Decorative } from 'next/font/google';
import BackgroundSlideshow from './components/BackgroundSlideshow';

const cinzel = Cinzel_Decorative({
    weight: '700',
    subsets: ['latin'],
    display: 'swap',
});

const cinzelBody = Cinzel({
    weight: ['400', '700'], // Standard weight and bold
    subsets: ['latin'],
    display: 'swap',
});

export default function Home() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
  const staffPassword = process.env.NEXT_PUBLIC_STAFF_PASSWORD;

  useEffect(() => {
    if (!isMaintenanceMode) {
      setIsAuthorized(true);
      return;
    }

    const savedAuth = localStorage.getItem('gatekeeper_auth');
    if (savedAuth === staffPassword) {
      setIsAuthorized(true);
    }
  }, [isMaintenanceMode, staffPassword]);

  useEffect(() => {
    if (!isAuthorized && isMaintenanceMode) {
      document.body.classList.add('gatekeeper-active');
    } else {
      document.body.classList.remove('gatekeeper-active');
    }
    return () => document.body.classList.remove('gatekeeper-active');
  }, [isAuthorized, isMaintenanceMode]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === staffPassword) {
      localStorage.setItem('gatekeeper_auth', password);
      setIsAuthorized(true);
      setError(false);
    } else {
      setError(true);
    }
  };

  if (!isAuthorized) {
    return (
      <main className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black p-6">
        <div className="w-full max-w-sm border border-red-900 bg-zinc-950 p-8 shadow-[0_0_50px_rgba(185,28,28,0.2)] text-center">
          <div className="mb-6 grayscale brightness-50">
             <span className="text-4xl">🩸</span>
          </div>
          <h2 className="text-red-700 font-serif text-xl uppercase tracking-[0.3em] mb-2">
            Domain Restricted
          </h2>
          <p className="text-zinc-500 font-serif italic text-xs mb-8">
            Provide the passphrase.
          </p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="PASSPHRASE"
              className={`w-full bg-black border ${error ? 'border-red-600' : 'border-zinc-800'} p-3 text-center text-red-700 font-mono focus:outline-none focus:border-red-700 transition-colors`}
            />
            <button 
              type="submit"
              className="w-full py-3 bg-red-900/10 border border-red-700/50 text-red-700 font-serif uppercase tracking-widest hover:bg-red-700 hover:text-black transition-all"
            >
              Enter
            </button>
          </form>
          {error && <p className="text-red-600 text-[10px] mt-4 uppercase tracking-tighter">Access Denied</p>}
        </div>
      </main>
    );
  }

return (
    <main className="relative flex flex-col items-center justify-center h-[calc(100vh-175px)] p-6 overflow-hidden">
      <BackgroundSlideshow />
      <div className="text-center space-y-12 max-w-2xl z-10">
        <div className="space-y-2">
          <h2 className={`${cinzelBody.className} text-red-700 font-black uppercase tracking-[0.3em] text-4xl md:text-6xl leading-tight drop-shadow-[0_5px_15px_rgba(185,28,28,0.3)]`}>
            A Monthly Larp <br />
            <span className="text-zinc-200">Event</span>
          </h2>
        </div>

        <div>
          <Link 
            href="/store" 
            className={`${cinzelBody.className} group relative inline-block px-12 py-5 bg-red-700 text-black font-black uppercase tracking-[0.2em] text-xl transition-all hover:bg-red-600 hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(185,28,28,0.4)]`}
          >
            Purchase Your Ticket
            <span className="absolute inset-0 border border-black/20 m-1"></span>
          </Link>
        </div>
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-[2px] bg-gradient-to-r from-transparent via-red-700 to-transparent opacity-50 z-10"></div>
    </main>
);
}