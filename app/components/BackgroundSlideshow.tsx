'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const images = [
    '/slideshow/img1.jpg',
    '/slideshow/img2.jpg',
    '/slideshow/img3.jpg',
    '/slideshow/img4.jpg',
    '/slideshow/img5.jpg',
    '/slideshow/img6.jpg',
    '/slideshow/img7.jpg',
    '/slideshow/img8.jpg',
    '/slideshow/img9.jpg',
    '/slideshow/img10.jpg',
];

export default function BackgroundSlideshow() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % images.length);
        }, 10000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="absolute inset-0 z-0 overflow-hidden bg-black">
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }} // Keeps images dark so text is readable
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2 }}
                    className="absolute inset-0 bg-center bg-no-repeat bg-black"
                    style={{ backgroundImage: `url(${images[index]})` }}
                />
            </AnimatePresence>

            {/* Dark vignette overlay to ensure text contrast */}
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black opacity-60" />
            <div className="absolute inset-0 bg-black/40" />
        </div>
    );
}