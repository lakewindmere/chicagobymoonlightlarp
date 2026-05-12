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
    const [redeemAmount, setRedeemAmount] = useState(1);

    const STAFF_PASSWORD = process.env.NEXT_PUBLIC_STAFF_PASSWORD;

    // 1. Add these new states at the top of ScannerContent
    const [donationPool, setDonationPool] = useState<{ id: string, quantity: number, redeemed_count: number } | null>(null);
    const [redeemDonationAmount, setRedeemDonationAmount] = useState(1);

    // 2. Create the fetcher for the Donation Ticket
    const fetchDonationPool = async () => {
        if (!supabase) return;
        const { data } = await supabase
            .from('tickets')
            .select('*')
            .eq('ticket_type', 'Donation Ticket')
            .maybeSingle();

        if (data) {
            setDonationPool(data);
        }
    };

    // 4. Create the redemption handler for donations
    const consumeDonation = async () => {
        if (!donationPool || !supabase || redeemDonationAmount < 1) return;

        const newCount = donationPool.redeemed_count + redeemDonationAmount;
        if (newCount > donationPool.quantity) {
            alert("Not enough donation tickets available.");
            return;
        }

        const { error } = await supabase
            .from('tickets')
            .update({ redeemed_count: newCount })
            .eq('id', donationPool.id);

        if (!error) {
            fetchDonationPool();
            setRedeemDonationAmount(1);
            alert(`Redeemed ${redeemDonationAmount} donation ticket(s).`);
        }
    };

    useEffect(() => {
        const savedAuth = sessionStorage.getItem('staff_auth');
        if (savedAuth === 'true') {
            setIsAuth(true);
        }
    }, []);

    // 3. Update useEffect to fetch the pool on load
    useEffect(() => {
        if (isAuth) {
            fetchDonationPool();
        }
    }, [isAuth]);


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
            }, () => { });

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
            // Default redeem amount to the remaining tickets
            setRedeemAmount(1);
        } else {
            setTicket(null);
        }
        setLoading(false);
    };

    const consumeTickets = async () => {
        if (!ticket || !supabase || redeemAmount < 1) return;

        const newRedeemedCount = ticket.redeemed_count + redeemAmount;

        if (newRedeemedCount > ticket.quantity) {
            alert("Cannot redeem more than purchased.");
            return;
        }

        const { error } = await supabase
            .from('tickets')
            .update({ redeemed_count: newRedeemedCount })
            .eq('stripe_session_id', ticket.stripe_session_id);

        if (!error) checkTicket(ticket.stripe_session_id);
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

                <div className="mt-12 pt-8 border-t border-zinc-800">
                    <div className="bg-zinc-900 border border-amber-900/30 rounded-lg p-5">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="text-amber-600 font-serif uppercase text-xs tracking-widest">Community Chest</h3>
                                <p className="text-xl font-bold">
                                    {donationPool
                                        ? (donationPool.quantity - donationPool.redeemed_count)
                                        : 0} Available
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-zinc-500 uppercase tracking-tighter">Total Contributed</p>
                                <p className="text-sm font-mono text-zinc-400">{donationPool?.quantity || 0}</p>
                            </div>
                        </div>

                        {donationPool && (donationPool.quantity > donationPool.redeemed_count) ? (
                            <div className="flex gap-2">
                                <div className="flex items-center bg-black border border-zinc-800 rounded px-2">
                                    <button
                                        onClick={() => setRedeemDonationAmount(Math.max(1, redeemDonationAmount - 1))}
                                        className="px-3 py-1 text-amber-700"
                                    >-</button>
                                    <span className="w-8 text-center font-mono font-bold text-sm">{redeemDonationAmount}</span>
                                    <button
                                        onClick={() => setRedeemDonationAmount(Math.min(donationPool.quantity - donationPool.redeemed_count, redeemDonationAmount + 1))}
                                        className="px-3 py-1 text-amber-700"
                                    >+</button>
                                </div>
                                <button
                                    onClick={consumeDonation}
                                    className="flex-1 bg-amber-900/20 border border-amber-700 text-amber-500 py-2 rounded text-xs font-bold uppercase tracking-widest hover:bg-amber-900/40 transition-colors"
                                >
                                    Use Donation
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-2 text-zinc-600 text-[10px] uppercase italic border border-dashed border-zinc-800 rounded">
                                Donation pool empty
                            </div>
                        )}
                    </div>
                </div>

                {!ticketId ? (
                    <div className="space-y-4">
                        {!cameraActive ? (
                            <button
                                onClick={() => setCameraActive(true)}
                                className="w-full aspect-square border-2 border-dashed border-zinc-800 rounded-lg flex flex-col items-center justify-center space-y-4 hover:border-red-900 transition-colors bg-zinc-900/50 group"
                            >
                                <div className="p-4 rounded-full bg-red-900/10 text-red-900 group-hover:text-red-600 group-hover:bg-red-900/20 transition-all">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
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
                            <div className={`p-6 rounded-lg border-2 transition-colors ${ticket.redeemed_count >= ticket.quantity ? 'border-zinc-700 bg-zinc-900' : 'border-green-600 bg-green-950/20'}`}>

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
                                        <p className={`font-bold ${ticket.redeemed_count >= ticket.quantity ? 'text-zinc-500' : 'text-green-500'}`}>
                                            {ticket.redeemed_count} / {ticket.quantity} ADMITTED
                                        </p>
                                    </div>
                                </div>

                                {/* Multi-Ticket Redemption Section */}
                                {ticket.redeemed_count < ticket.quantity ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between bg-black/40 p-4 border border-zinc-800 rounded">
                                            <span className="text-xs uppercase tracking-widest text-zinc-400 font-serif">Amount to Admit</span>
                                            <div className="flex items-center space-x-6">
                                                <button
                                                    onClick={() => setRedeemAmount(Math.max(1, redeemAmount - 1))}
                                                    className="w-10 h-10 flex items-center justify-center border border-zinc-700 text-red-700 text-2xl hover:bg-red-900/10 active:scale-95 transition-all"
                                                >
                                                    -
                                                </button>
                                                <span className="text-2xl font-mono font-bold w-4 text-center">{redeemAmount}</span>
                                                <button
                                                    onClick={() => setRedeemAmount(Math.min(ticket.quantity - ticket.redeemed_count, redeemAmount + 1))}
                                                    className="w-10 h-10 flex items-center justify-center border border-zinc-700 text-red-700 text-2xl hover:bg-red-900/10 active:scale-95 transition-all"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            onClick={consumeTickets}
                                            className="w-full py-5 bg-green-600 hover:bg-green-500 text-black font-black text-xl rounded shadow-[0_0_20px_rgba(22,163,74,0.3)] transition-all uppercase"
                                        >
                                            Admit {redeemAmount} Guest{redeemAmount > 1 ? 's' : ''}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center py-6 bg-zinc-800 text-zinc-400 font-bold rounded uppercase tracking-[0.2em] border border-zinc-700">
                                        Full Party Admitted
                                    </div>
                                )}

                                <div className="mt-6 pt-6 border-t border-zinc-800">
                                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 block mb-1">Session Reference</label>
                                    <p className="text-xs font-mono text-zinc-500 truncate">{ticket.stripe_session_id}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 bg-red-900/10 border border-red-900 text-red-500 text-center rounded-lg">
                                <p className="font-bold uppercase tracking-widest mb-2">Manifest Entry Not Found</p>
                                <button onClick={() => router.push('/scanner')} className="text-sm underline">Reset Scanner</button>
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