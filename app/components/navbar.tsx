'use client'; // This directive is required to use hooks

import Link from "next/link";
import { useCart } from "../context/CartContext";
import { Cinzel_Decorative, Cinzel } from 'next/font/google';
import { SyntheticEvent, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

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
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const detectOutsideClick = (event: MouseEvent) => {
        if (ref.current && !ref.current.contains(event.currentTarget as Node)) {
            setIsOpen(false);
        }
    }
    useEffect(() => {
        document.addEventListener('click', detectOutsideClick, true);
        return () => {
            document.removeEventListener('click', detectOutsideClick, true);
        }
    }, [])
    const pathname = usePathname();

    const toggleOpen = () => {
        setIsOpen(!isOpen);
    }

    const navLinks = [
        { name: 'Information', href: '/information'},
        { name: 'Night Market', href: '/store'}
    ]

    const subNavLinks = [
        { name: 'Character Creation', href: '/character-creator' },
        { name: 'Downtime Actions', href: '/downtime' },
    ];

    return (
        <header className="sticky top-0 z-50 shadow-2xl">
            {/* Top Banner */}
            <nav className="w-full bg-red-700 py-3 px-6 border-b border-black">
                <div className="max-w-7xl mx-auto flex justify-center">
                    <Link
                        href="/"
                        className={`${cinzel.className} text-black font-bold uppercase tracking-[0.1em] md:tracking-[0.25em] text-sm sm:text-base md:text-xl ...`}
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
            <nav className="w-full bg-black py-4 px-6 border-b border-zinc-900">
                <div className="max-w-7xl mx-auto flex flex-end items-center justify-between">
    
                    {/* Centered Links */}
                   
                    <div className="flex grow-2 items-center justify-center space-x-4">
                         {navLinks.map((link) => {
                            const linkClass = "px-4 py-1 text-zinc-400 hover:text-red-500 uppercase tracking-widest text-xs transition-all duration-300 rounded-sm border border-transparent hover:border-red-900/50 hover:bg-red-950/20 hover:shadow-[0_0_15px_rgba(153,27,27,0.2)]"
                                return (
                                    <Link key={link.href} href={link.href} className={`${cinzelBody.className} ${linkClass}`}>
                                        {link.name}
                                    </Link>
                                )
                            }
                        )}
                        <div
                            className="relative group h-full flex items-center"
                            ref={ref}
                        >
                            {/* The Trigger - Now looks exactly like a standard Nav Link */}
                            <button onClick={toggleOpen} className={`${cinzelBody.className} text-[11px] uppercase tracking-[0.3em] transition-all duration-300 flex items-center gap-2 ${isOpen ? 'text-red-700' : 'text-zinc-400 group-hover:text-red-700'
                                }`}>
                                In-Character
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className={`h-2.5 w-2.5 transition-transform duration-500 ${isOpen ? 'rotate-180 text-red-700' : 'text-zinc-600'}`}
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* The Dropdown Menu, only render when mouse is over In-Character menu item */}
                            { isOpen && (
                                <div className={`absolute top-[100%] right-0 w-60 bg-black border border-zinc-900 shadow-[0_20px_50px_rgba(0,0,0,0.9)] transition-all duration-500 transform origin-top
                                    }`}>
                                    {/* Decorative Top Accent Line */}
                                    <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-red-900/50 to-transparent"></div>

                                    <div className="py-1 flex flex-col">
                                        {subNavLinks.map((link) => (
                                            <Link
                                                key={link.href}
                                                href={link.href}
                                                className={`px-6 py-4 text-[9px] uppercase tracking-[0.3em] transition-all duration-300 border-l-2 ${pathname === link.href
                                                    ? 'border-red-700 text-red-500 bg-red-950/5'
                                                    : 'border-transparent text-zinc-500 hover:text-red-600 hover:bg-red-950/5 hover:border-red-900/50'
                                                    }`}
                                            >
                                                {link.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right-aligned Cart Icon */}
                    <div className="flex-none">
                        <Link href="/cart" id="cart-icon" className="relative group" aria-label="Link to cart">
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