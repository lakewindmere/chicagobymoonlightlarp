'use client';

import { useState, useRef } from 'react';
import { StripeProduct } from '@/app/store/page';
import { useCart } from '../context/CartContext';

interface ProductModalProps {
    product: StripeProduct;
    isOpen: boolean;
    onClose: () => void;
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
    const [selectedPriceId, setSelectedPriceId] = useState(product.priceId);
    const [quantity, setQuantity] = useState(1);
    const [isAnimating, setIsAnimating] = useState(false);
    const imageRef = useRef<HTMLImageElement>(null);
    const { addToCart } = useCart();

    if (!isOpen) return null;

    const handleAdd = () => {
        const selectedVariant = product.variants.find(v => v.id === selectedPriceId);
        const itemToAdd = {
            ...product,
            priceId: selectedPriceId,
            // Optional: append size to name so it shows in cart correctly
            name: selectedVariant ? `${product.name} (${selectedVariant.label})` : product.name,
            price: selectedVariant ? selectedVariant.unit_amount : product.price
        };

        const cartIcon = document.querySelector('#cart-icon');
        const imageElement = imageRef.current;

        if (cartIcon && imageElement) {
            setIsAnimating(true);

            const imageRect = imageElement.getBoundingClientRect();
            const cartRect = cartIcon.getBoundingClientRect();

            // Create the ghost element
            // Create the ghost element dynamically
            let ghost: HTMLElement;

            if (product.image) {
                const imgGhost = document.createElement('img');
                imgGhost.src = product.image;
                imgGhost.style.objectFit = 'cover';
                ghost = imgGhost;
            } else {
                const divGhost = document.createElement('div');
                divGhost.innerText = product.icon;
                divGhost.style.display = 'flex';
                divGhost.style.alignItems = 'center';
                divGhost.style.justifyContent = 'center';
                divGhost.style.fontSize = '4rem'; // Match modal icon size
                ghost = divGhost;
            }

            ghost.style.position = 'fixed';
            ghost.style.top = `${imageRect.top}px`;
            ghost.style.left = `${imageRect.left}px`;
            ghost.style.width = `${imageRect.width}px`;
            ghost.style.height = `${imageRect.height}px`;
            ghost.style.objectFit = 'cover';
            ghost.style.zIndex = '1000';
            ghost.style.pointerEvents = 'none';
            ghost.style.borderRadius = '8px';
            ghost.style.opacity = '1';
            // Set the transition property BEFORE adding to DOM
            ghost.style.transition = 'all 0.8s cubic-bezier(0.45, 0.05, 0.55, 0.95)';

            document.body.appendChild(ghost);

            // We need a double requestAnimationFrame to ensure the initial 
            // position is rendered by the browser before changing the styles
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    ghost.style.top = `${cartRect.top}px`;
                    ghost.style.left = `${cartRect.left}px`;
                    ghost.style.width = '20px';
                    ghost.style.height = '20px';
                    ghost.style.opacity = '0'; // Fade out as it hits cart
                    ghost.style.filter = 'brightness(1.5) sepia(1) hue-rotate(-50deg)'; // Red glow
                });
            });

            // Wait for animation to finish
            setTimeout(() => {
                for (let i = 0; i < quantity; i++) {
                    addToCart(itemToAdd);
                }
                ghost.remove();
                onClose();
                setIsAnimating(false);
            }, 850); // Slightly longer than the 0.8s transition
        } else {
            // Fallback
            for (let i = 0; i < quantity; i++) {
                addToCart(itemToAdd);
            }
            onClose();
        }
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !isAnimating) {
            onClose();
        }
    };

    return (
        <div
            onClick={handleOverlayClick}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm cursor-pointer"
        >
            <div className="relative w-full max-w-2xl bg-zinc-950 border border-red-900 shadow-[0_0_50px_rgba(185,28,28,0.2)] overflow-hidden cursor-default">
                <button
                    onClick={onClose}
                    disabled={isAnimating}
                    className="absolute top-4 right-4 z-20 text-zinc-500 hover:text-red-700 text-2xl"
                >
                    ×
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="h-64 md:h-full bg-zinc-900 flex items-center justify-center overflow-hidden border-b md:border-b-0 md:border-r border-red-900/30">
                        {product.image ? (
                            <img
                                ref={imageRef}
                                src={product.image}
                                alt={product.name}
                                className={`w-full h-full object-cover transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}
                            />
                        ) : (
                            <div ref={imageRef as any} className="text-6xl">{product.icon}</div>
                        )}
                    </div>

                    <div className="p-8 flex flex-col justify-between">
                        <div>
                            <h3 className="text-2xl font-serif font-black uppercase tracking-widest text-red-700 mb-2">{product.name}</h3>
                            <p className="text-zinc-400 text-sm italic mb-6">{product.description}</p>
                            <p className="text-xl font-mono text-zinc-100 mb-8">${product.price}</p>
                        </div>

                        <div className="space-y-4">
                            {/* Size Dropdown - Only show if there are multiple variants */}
                            {product.variants.length > 1 && (
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 pl-1">Select Size</label>
                                    <select
                                        value={selectedPriceId}
                                        onChange={(e) => setSelectedPriceId(e.target.value)}
                                        className="w-full bg-black border border-zinc-800 p-3 text-zinc-200 font-serif focus:border-red-700 outline-none transition-colors"
                                    >
                                        {product.variants.map((variant) => (
                                            <option key={variant.id} value={variant.id}>
                                                {variant.label} - ${variant.unit_amount}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            <div className="flex items-center justify-between border border-zinc-800 p-2 rounded bg-black/40">
                                <span className="text-[10px] uppercase tracking-widest text-zinc-500 pl-2">Quantity</span>
                                <div className="flex items-center space-x-4">
                                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-xl text-red-700 px-2">-</button>
                                    <span className="font-mono font-bold text-zinc-200">{quantity}</span>
                                    <button onClick={() => setQuantity(quantity + 1)} className="text-xl text-red-700 px-2">+</button>
                                </div>
                            </div>

                            <button
                                onClick={handleAdd}
                                disabled={isAnimating}
                                className="group relative w-full py-4 bg-red-700 text-black font-serif font-black uppercase tracking-widest hover:bg-red-600 transition-all disabled:opacity-50"
                            >
                                {isAnimating ? "Securing..." : "Add to Manifest"}
                                <span className="absolute inset-0 border border-black/20 m-1"></span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}