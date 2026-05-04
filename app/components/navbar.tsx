'use client'; // This directive is required to use hooks

import Link from "next/link";
import { useCart } from "../context/CartContext";
import { Cinzel_Decorative, Cinzel } from 'next/font/google';

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

export function Navbar() {
    const { cartCount } = useCart();

    return (
        <header className="sticky top-0 z-50 shadow-2xl">
            {/* Top Banner */}
            <nav className="w-full bg-red-700 py-3 px-6 border-b border-black">
                <div className="max-w-7xl mx-auto flex justify-center">
                    <Link
                        href="/"
                        className={`${cinzel.className} text-black font-bold uppercase tracking-[0.25em] text-xl hover:opacity-70 transition-opacity text-center flex items-center justify-center`}
                    >
                        CHICAGO IN M
                        <span className="inline-flex -mx-[0.12em]">
                            <span className="-mr-[0.4em]">O</span>
                            <span className="-ml-[0.4em]">O</span>
                        </span>

                        NLIGHT
                    </Link>
                </div>
            </nav>

            {/* Sub Navigation */}
            <nav className="w-full bg-black py-2 px-6 border-b border-zinc-900">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Left-aligned spacing helper to keep links centered */}
                    <div className="w-10 md:flex-1"></div>

                    {/* Centered Links */}
                    <div className="flex items-center space-x-4">
                        <Link
                            href="/information"
                            className={`${cinzelBody.className} px-4 py-1 text-zinc-400 hover:text-red-500 uppercase tracking-widest text-xs transition-all duration-300 rounded-sm border border-transparent hover:border-red-900/50 hover:bg-red-950/20 hover:shadow-[0_0_15px_rgba(153,27,27,0.2)]`}
                        >
                            Information
                        </Link>

                        <Link
                            href="/store"
                            className={`${cinzelBody.className} px-4 py-1 text-zinc-400 hover:text-red-500 uppercase tracking-widest text-xs transition-all duration-300 rounded-sm border border-transparent hover:border-red-900/50 hover:bg-red-950/20 hover:shadow-[0_0_15px_rgba(153,27,27,0.2)]`}
                        >
                            Night Market
                        </Link>
                    </div>

                    {/* Right-aligned Cart Icon */}
                    <div className="flex justify-end md:flex-1">
                        <Link href="/cart" id="cart-icon" className="relative group p-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-red-700 group-hover:text-red-500 transition-colors"
                            >
                                <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
                                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                            </svg>

                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/4 bg-red-700 text-black text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center border border-black shadow-[0_0_10px_rgba(185,28,28,0.5)]">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </nav>
        </header>
    );
}