'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface CartItem {
    priceId: string;
    name: string;
    price: number;
    quantity: number;
    icon: string;
    image: string | null; // Added image property
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: Omit<CartItem, 'quantity'>) => void;
    removeFromCart: (priceId: string) => void;
    updateQuantity: (priceId: string, delta: number) => void;
    clearCart: () => void;
    cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);

    // Load cart from local storage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('vtm_cart');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, []);

    // Persist cart to local storage on changes
    useEffect(() => {
        localStorage.setItem('vtm_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = useCallback((newItem: Omit<CartItem, 'quantity'>) => {
        setCart(prev => {
            const existing = prev.find(i => i.priceId === newItem.priceId);
            if (existing) {
                return prev.map(i => i.priceId === newItem.priceId
                    ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { ...newItem, quantity: 1 }];
        });
    }, []);

    const removeFromCart = (priceId: string) => {
        setCart(prev => prev.filter(i => i.priceId !== priceId));
    };

    const updateQuantity = useCallback((priceId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.priceId === priceId) {
                const newQty = Math.max(0, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0));
    }, []);

    const clearCart = useCallback(() => {
        setCart([]);
    }, []);

    const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartCount
        }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
};