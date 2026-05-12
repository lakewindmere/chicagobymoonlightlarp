'use client';

import Link from 'next/link';
import { CartItem, useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';
import { getActiveProducts } from '../actions/stripe';
import { ProductModal } from '../components/product-modal';

export interface ProductVariant {
    id: string;
    label: string;
    unit_amount: number;
}

export interface StripeProduct {
    productId: string; // Stripe Product ID
    priceId: string;   // Current selected Price ID
    name: string;
    price: number;
    image: string | null;
    icon: string;
    category: string;
    description: string | null;
    variants: ProductVariant[]; // Added variants
}

function getNextGameDate() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    function findLastSaturday(y: number, m: number) {
        const date = new Date(y, m + 1, 0); // Last day of the month
        while (date.getDay() !== 6) {
            date.setDate(date.getDate() - 1);
        }
        return date;
    }

    let nextGame = findLastSaturday(currentYear, currentMonth);

    // If today is AFTER the last Saturday of this month, get next month's
    if (today.getDate() > nextGame.getDate() && today.getMonth() === nextGame.getMonth()) {
        nextGame = findLastSaturday(currentYear, currentMonth + 1);
    }

    return nextGame.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function StorePage() {
    const { addToCart } = useCart();
    const [products, setProducts] = useState<StripeProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<StripeProduct | null>(null);

    const nextGameDate = getNextGameDate();

    useEffect(() => {
        async function loadProducts() {
            try {
                const data = await getActiveProducts();
                setProducts(data);
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setLoading(false);
            }
        }
        loadProducts();
    }, []);

    if (loading) {
        return (
            <main className="bg-black p-6 flex items-center justify-center min-h-screen">
                <p className="text-red-700 animate-pulse uppercase tracking-widest">Consulting the Ledger...</p>
            </main>
        );
    }

    // Dynamically group products by category
    const groupedProducts = products.reduce((acc, product) => {
        const cat = product.category;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(product);
        return acc;
    }, {} as Record<string, any[]>);

    // Ensure 'ticket' category (or whatever holds Admission) is rendered first
    const sortedCategories = Object.keys(groupedProducts).sort((a, b) => {
        if (a.toLowerCase() === 'ticket') return -1;
        if (b.toLowerCase() === 'ticket') return 1;
        return a.localeCompare(b);
    });

    return (
        <main className="relative flex flex-col items-center min-h-[calc(100vh-168px)] bg-black p-6 overflow-x-hidden">
            <div className="text-center mt-12 mb-16 space-y-2">
                <h2 className="text-red-700 font-serif font-black uppercase tracking-[0.3em] text-4xl md:text-6xl leading-tight">
                    Night <br /> <span className="text-zinc-200">Market</span>
                </h2>
            </div>

            {sortedCategories.map((category) => (
                <section key={category} className="w-full max-w-5xl mb-20">
                    {/* Dynamic Header */}
                    <div className="flex items-center space-x-4 mb-8">
                        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-zinc-800"></div>
                        <h3 className="text-zinc-500 font-serif uppercase tracking-[0.4em] text-xs">
                            {category === 'ticket' ? 'LARP Tickets' : category}
                        </h3>
                        <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-zinc-800"></div>
                    </div>
                    {/* Product Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groupedProducts[category].sort((a, b) => {
                            // Force "LARP Ticket" to the front regardless of alphabet
                            if (a.name.toLowerCase().includes('larp ticket')) return -1;
                            if (b.name.toLowerCase().includes('larp ticket')) return 1;
                            // Default to alphabetical for everything else
                            return a.name.localeCompare(b.name);
                        }).map((item) => (
                            <button
                                key={item.priceId}
                                onClick={() => setSelectedProduct(item)}
                                className="group relative aspect-square bg-zinc-900/30 border border-zinc-800 hover:border-red-700 transition-all duration-500 flex flex-col items-center justify-center overflow-hidden cursor-pointer w-full"
                            >
                                <div className="relative z-10 flex flex-col items-center text-center p-6">
                                    <div className="relative w-full h-48 mb-4 flex justify-center items-center">
                                        {item.image ? (
                                            <div className="w-full h-full overflow-hidden rounded">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-110"
                                                />
                                            </div>
                                        ) : (
                                            /* For icons, we apply the rounded corners directly to the narrow rectangle */
                                            <div className="h-full aspect-[3/4] flex items-center justify-center bg-zinc-800 text-5xl rounded grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110">
                                                <span className="leading-none">{item.icon}</span>
                                            </div>
                                        )}
                                    </div>
                                    <h4 className="text-zinc-100 font-serif uppercase tracking-[0.2em] text-lg mb-1">{item.name}</h4>
                                    <p className="text-red-700 font-mono font-bold">${item.price}</p>
                                </div>
                                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-zinc-700 group-hover:border-red-500 transition-colors"></div>
                                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-zinc-700 group-hover:border-red-500 transition-colors"></div>
                            </button>
                        ))}
                    </div>
                </section>
            ))}

            {selectedProduct && (
                <ProductModal
                    product={selectedProduct}
                    isOpen={!!selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    subtitle={selectedProduct.category.toLowerCase() === 'ticket' ? `Next Gathering: ${nextGameDate}` : undefined}
                />
            )}

            <div className="mt-10 w-48 h-[2px] bg-gradient-to-r from-transparent via-red-700 to-transparent opacity-50"></div>
        </main>
    );
}