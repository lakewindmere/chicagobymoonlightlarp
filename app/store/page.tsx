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

export default function StorePage() {
    const { addToCart } = useCart();
    const [products, setProducts] = useState<StripeProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState<StripeProduct | null>(null);

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
                        {groupedProducts[category].map((item) => (
                            <button
                                key={item.priceId}
                                onClick={() => setSelectedProduct(item)}
                                className="group relative aspect-square bg-zinc-900/30 border border-zinc-800 hover:border-red-700 transition-all duration-500 flex flex-col items-center justify-center overflow-hidden cursor-pointer w-full"
                            >
                                <div className="relative z-10 flex flex-col items-center text-center p-6">
                                    <div className="relative w-full h-48 mb-4 overflow-hidden rounded">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-5xl grayscale group-hover:grayscale-0 transition-all">
                                                {item.icon}
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
              />
            )}

            <div className="mt-10 w-48 h-[2px] bg-gradient-to-r from-transparent via-red-700 to-transparent opacity-50"></div>
        </main>
    );
}