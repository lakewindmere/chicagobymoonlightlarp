'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useSearchParams, useRouter } from 'next/navigation'; // Added useRouter
import { Html5QrcodeScanner } from 'html5-qrcode'; // Ensure you ran: npm install html5-qrcode

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

function ScannerContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const ticketId = searchParams.get('id');

    const [password, setPassword] = useState('');
    const [isAuth, setIsAuth] = useState(false);
    const [ticket, setTicket] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);

    const STAFF_PASSWORD = process.env.NEXT_PUBLIC_STAFF_PASSWORD;

    useEffect(() => {
        const savedAuth = sessionStorage.getItem('staff_auth');
        if (savedAuth === 'true') {
            setIsAuth(true);
        }
    }, []);

    useEffect(() => {
        if (cameraActive && !ticketId && isAuth) {
            const scanner = new Html5QrcodeScanner(
                "reader", 
                { fps: 10, qrbox: { width: 250, height: 250 } },
                false
            );

            scanner.render((decodedText) => {
                try {
                    const url = new URL(decodedText);
                    const id = url.searchParams.get('id');
                    if (id) {
                        scanner.clear();
                        setCameraActive(false);
                        router.push(`/scanner?id=${id}`);
                    }
                } catch (e) {
                    console.error("Not a valid URL QR code");
                }
            }, () => {});

            return () => {
                scanner.clear().catch(e => console.error("Scanner cleanup error", e));
            };
        }
    }, [cameraActive, ticketId, isAuth, router]);

    useEffect(() => {
        if (isAuth && ticketId) {
            checkTicket(ticketId);
        }
    }, [isAuth, ticketId]);

    const handleLogin = () => {
        if (password === STAFF_PASSWORD) {
            setIsAuth(true);
            sessionStorage.setItem('staff_auth', 'true');
        } else {
            alert('Invalid Secret Phrase');
        }
    };

    const checkTicket = async (id: string) => {
        if (!supabase) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('tickets')
            .select('*')
            .eq('stripe_session_id', id)
            .single();

        if (!error && data) {
            setTicket(data);
        } else {
            setTicket(null);
            console.error("Ticket not found");
        }
        setLoading(false);
    };

    const consumeTicket = async () => {
        if (!ticketId || !supabase) return;
        const { error } = await supabase
            .from('tickets')
            .update({ is_consumed: true })
            .eq('stripe_session_id', ticketId);

        if (!error) checkTicket(ticketId);
    };

    if (!isAuth) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-6 text-white">
                <div className="bg-zinc-900 p-8 border border-red-900 rounded-lg max-w-sm w-full">
                    <h1 className="text-red-700 text-xl mb-4 uppercase font-serif text-center">Gatekeeper Portal</h1>
                    <input
                        type="password"
                        className="bg-black border border-zinc-700 p-3 w-full mb-4 rounded text-center"
                        placeholder="Secret Phrase"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button onClick={handleLogin} className="w-full bg-red-800 py-3 font-bold uppercase tracking-widest">Unlock</button>
                </div>
            </div>
        );
    }

    return (
        <main className="p-6 bg-zinc-950 min-h-screen text-white">
            <div className="max-w-md mx-auto">
                <div className="flex justify-between items-end mb-8 border-b border-zinc-800 pb-4">
                    <h1 className="text-xl font-serif text-red-600 uppercase tracking-tighter">Scanner Active</h1>
                    {ticketId && (
                        <button 
                            onClick={() => { setTicket(null); router.push('/scanner'); }}
                            className="text-[10px] text-zinc-500 uppercase hover:text-red-500"
                        >
                            Clear Scan
                        </button>
                    )}
                </div>

                {!ticketId ? (
                    <div className="space-y-4">
                        {!cameraActive ? (
                            <button 
                                onClick={() => setCameraActive(true)}
                                className="w-full aspect-square border-2 border-dashed border-zinc-800 rounded-lg flex flex-col items-center justify-center space-y-4 hover:border-red-900 transition-colors bg-zinc-900/50 group"
                            >
                                <div className="p-4 rounded-full bg-red-900/10 text-red-900 group-hover:text-red-600 group-hover:bg-red-900/20 transition-all">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                                </div>
                                <span className="text-zinc-500 font-serif italic uppercase tracking-widest text-sm">Tap to scan credential</span>
                            </button>
                        ) : (
                            <div className="overflow-hidden rounded-lg border-2 border-red-900 bg-black">
                                <div id="reader" className="w-full"></div>
                                <button 
                                    onClick={() => setCameraActive(false)}
                                    className="w-full py-4 bg-zinc-900 text-zinc-400 font-bold uppercase text-xs tracking-widest"
                                >
                                    Cancel Scan
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {loading ? (
                            <p className="text-center animate-pulse py-10 text-zinc-500 italic">Checking the ledger...</p>
                        ) : ticket ? (
                            <div className={`p-6 rounded-lg border-2 transition-colors ${ticket.is_consumed ? 'border-zinc-700 bg-zinc-900' : 'border-green-600 bg-green-950/20'}`}>

                                <div className="mb-4">
                                    <label className="text-[10px] uppercase tracking-widest text-zinc-500">Guest Identity</label>
                                    <h2 className="text-2xl font-bold">{ticket.user_email}</h2>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-zinc-500">Tier</label>
                                        <p className="font-semibold text-red-500 uppercase">{ticket.ticket_type}</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-zinc-500">Status</label>
                                        <p className={`font-bold ${ticket.is_consumed ? 'text-zinc-500' : 'text-green-500'}`}>
                                            {ticket.is_consumed ? 'VOID / USED' : 'ACTIVE'}
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-8 p-3 bg-black/40 rounded border border-zinc-800">
                                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 block mb-1">Valid for Gathering</label>
                                    <p className="text-lg font-serif italic text-zinc-200">
                                        {new Date(ticket.created_at).toLocaleDateString('en-US', {
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>

                                {!ticket.is_consumed ? (
                                    <button
                                        onClick={consumeTicket}
                                        className="w-full py-5 bg-green-600 hover:bg-green-500 text-black font-black text-2xl rounded shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all uppercase"
                                    >
                                        GRANT ENTRY
                                    </button>
                                ) : (
                                    <div className="text-center py-4 bg-zinc-800 text-zinc-400 font-bold rounded uppercase tracking-widest border border-zinc-700">
                                        Already Admitted
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-8 bg-red-900/10 border border-red-900 text-red-500 text-center rounded-lg">
                                <p className="font-bold uppercase tracking-widest mb-2">Ticket Not Found</p>
                                <button onClick={() => router.push('/scanner')} className="text-sm underline">Try Again</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}

export default function ScannerPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ScannerContent />
        </Suspense>
    );
}