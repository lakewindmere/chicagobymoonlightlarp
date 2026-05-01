'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Initialize Supabase Client
const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export default function ScannerPage({
  searchParams,
}: {
  searchParams: { id?: string };
}) {
  const router = useRouter();
  
  // States
  const [password, setPassword] = useState('');
  const [isAuth, setIsAuth] = useState(false);
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const STAFF_PASSWORD = process.env.NEXT_PUBLIC_STAFF_PASSWORD;

  // Function to fetch ticket data from Supabase
  const checkTicket = async (ticketId: string) => {
    setLoading(true);
    setErrorMsg(null);

    if (!supabase) return;
    
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('stripe_session_id', ticketId)
      .single();

    if (error || !data) {
      setErrorMsg('Ticket not found in the database.');
      setTicket(null);
    } else {
      setTicket(data);
    }
    setLoading(false);
  };

  // Trigger lookup when authenticated and an ID is present in URL
  useEffect(() => {
    if (isAuth && searchParams.id) {
      checkTicket(searchParams.id);
    }
  }, [isAuth, searchParams.id]);

  // Function to mark ticket as used
  const consumeTicket = async () => {
    if (!searchParams.id) return;

    if (!supabase) return;
    
    const { error } = await supabase
      .from('tickets')
      .update({ is_consumed: true })
      .eq('stripe_session_id', searchParams.id);

    if (error) {
      alert('Error updating ticket.');
    } else {
      // Refresh local data
      checkTicket(searchParams.id);
    }
  };

  const resetScanner = () => {
    setTicket(null);
    setErrorMsg(null);
    router.push('/scanner'); // Clear the ID from the URL
  };

  // 1. Password Protection Overlay
  if (!isAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="bg-zinc-900 p-8 border border-red-900 rounded-lg max-w-sm w-full">
          <h1 className="text-red-700 text-xl mb-4 uppercase font-serif tracking-widest">Gatekeeper Access</h1>
          <input 
            type="password" 
            className="bg-black border border-zinc-700 p-3 w-full text-white mb-4 rounded focus:border-red-600 outline-none"
            placeholder="Enter Secret Phrase"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && password === STAFF_PASSWORD && setIsAuth(true)}
          />
          <button 
            onClick={() => password === STAFF_PASSWORD ? setIsAuth(true) : alert('Access Denied')}
            className="w-full bg-red-800 hover:bg-red-700 py-3 text-white font-bold transition"
          >
            Unlock Portal
          </button>
        </div>
      </div>
    );
  }

  // 2. Main Scanner UI
  return (
    <main className="p-6 bg-zinc-950 min-h-screen text-white font-sans">
      <div className="max-w-md mx-auto">
        <header className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
          <h1 className="text-xl font-serif text-red-600 tracking-tighter uppercase">Check-In Station</h1>
          <button onClick={resetScanner} className="text-xs text-zinc-500 hover:text-white uppercase tracking-widest">
            Clear Scan
          </button>
        </header>
        
        {!searchParams.id ? (
          <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-xl">
            <p className="text-zinc-500 italic">Ready for entry...<br/>Scan a guest's QR code.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {loading && <p className="text-center animate-pulse">Consulting the Ledger...</p>}
            
            {errorMsg && (
              <div className="p-6 bg-red-950/30 border border-red-600 text-red-500 rounded-lg text-center">
                <p className="font-bold mb-1">INVALID CREDENTIALS</p>
                <p className="text-sm opacity-80">{errorMsg}</p>
              </div>
            )}

            {ticket && (
              <div className={`p-6 rounded-lg border-2 transition-colors ${ticket.is_consumed ? 'border-zinc-700 bg-zinc-900' : 'border-green-600 bg-green-950/20'}`}>
                <div className="mb-4">
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500">Guest Identity</label>
                  <h2 className="text-2xl font-bold">{ticket.user_email}</h2>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500">Tier</label>
                    <p className="font-semibold text-red-500">{ticket.ticket_type}</p>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500">Status</label>
                    <p className={`font-bold ${ticket.is_consumed ? 'text-zinc-500' : 'text-green-500'}`}>
                      {ticket.is_consumed ? 'VOID / USED' : 'ACTIVE'}
                    </p>
                  </div>
                </div>
                
                {!ticket.is_consumed ? (
                  <button 
                    onClick={consumeTicket}
                    className="w-full py-5 bg-green-600 hover:bg-green-500 text-black font-black text-2xl rounded shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all"
                  >
                    GRANT ENTRY
                  </button>
                ) : (
                  <div className="text-center py-4 bg-zinc-800 text-zinc-400 font-bold rounded">
                    ALREADY ADMITTED
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}