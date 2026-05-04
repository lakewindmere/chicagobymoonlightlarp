'use client';

import { useCart, CartItem } from '../context/CartContext';
import { handleCartCheckout } from '../actions/checkout';
import Link from 'next/link';

export default function CartPage() {
    const { cart, updateQuantity } = useCart();

    const total = cart.reduce((acc: number, item: CartItem) => acc + (item.price * item.quantity), 0);

    return (
        <main className="min-h-[calc(100vh-175px)] bg-black text-white p-8 md:p-24">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-4xl md:text-6xl font-serif font-black uppercase tracking-[0.3em] text-red-700 mb-12 text-center">
                    Your <span className="text-zinc-100">Manifest</span>
                </h1>
                
                <div className="space-y-8">
                    {cart.length === 0 ? (
                        <div className="text-center space-y-6">
                            <p className="text-zinc-500 font-serif italic text-xl tracking-widest">"The void offers nothing for exchange."</p>
                            <Link href="/store" className="inline-block text-red-700 hover:text-red-500 uppercase tracking-widest text-sm underline">
                                Visit the Night Market
                            </Link>
                        </div>
                    ) : (
                        <>
                            {cart.map(item => (
                                <div key={item.priceId} className="flex items-center space-x-6 border-b border-red-900/20 pb-8">
                                    {/* Thumbnail */}
                                    <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded flex items-center justify-center overflow-hidden">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover opacity-80" />
                                        ) : (
                                            <span className="text-3xl">{item.icon}</span>
                                        )}
                                    </div>

                                    {/* Info & Controls */}
                                    <div className="flex-1 flex flex-col">
                                        <p className="font-serif uppercase tracking-[0.2em] text-zinc-100 text-lg">{item.name}</p>
                                        
                                        {/* Quantity Modifier */}
                                        <div className="flex items-center space-x-4 my-2">
                                            <button 
                                                onClick={() => updateQuantity(item.priceId, -1)}
                                                className="w-8 h-8 flex items-center justify-center border border-zinc-800 text-zinc-500 hover:border-red-700 hover:text-red-700 transition-colors"
                                            >
                                                -
                                            </button>
                                            <span className="font-mono text-zinc-300 w-4 text-center">{item.quantity}</span>
                                            <button 
                                                onClick={() => updateQuantity(item.priceId, 1)}
                                                className="w-8 h-8 flex items-center justify-center border border-zinc-800 text-zinc-500 hover:border-red-700 hover:text-red-700 transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <p className="text-red-700 font-mono font-bold tracking-tighter">
                                            ${item.price * item.quantity}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            <div className="pt-12 text-right">
                                <div className="mb-8">
                                    <p className="text-zinc-500 uppercase tracking-widest text-xs mb-1">Total Tribute</p>
                                    <p className="text-4xl font-serif font-black text-red-700">${total}</p>
                                </div>

                                <button 
                                    onClick={() => handleCartCheckout(cart)}
                                    className="relative w-full group py-5 bg-red-700 text-black font-serif font-black uppercase tracking-[0.3em] text-xl transition-all hover:bg-red-600 shadow-[0_0_30px_rgba(185,28,28,0.2)]"
                                >
                                    Proceed to Checkout
                                    <span className="absolute inset-0 border border-black/20 m-1"></span>
                                </button>
                                
                                <p className="mt-6 text-center">
                                    <Link href="/store" className="text-zinc-600 hover:text-zinc-400 text-[10px] uppercase tracking-widest transition-colors">
                                        Continue Acquisitions
                                    </Link>
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}