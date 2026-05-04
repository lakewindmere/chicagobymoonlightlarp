'use client';

import { useState } from 'react';

interface DotProps {
  value: number;
  onChange: (val: number) => void;
  max?: number;
}

export default function AttributeDots({ value, onChange, max = 5 }: DotProps) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex space-x-1">
      {[...Array(max)].map((_, i) => {
        const dotIndex = i + 1;
        const isActive = dotIndex <= (hover || value);
        
        return (
          <button
            key={dotIndex}
            type="button"
            onMouseEnter={() => setHover(dotIndex)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(dotIndex)}
            className={`w-3 h-3 rounded-full border transition-all duration-200 ${
              isActive 
                ? 'bg-red-700 border-red-700 shadow-[0_0_8px_rgba(185,28,28,0.6)]' 
                : 'bg-transparent border-zinc-800 hover:border-zinc-500'
            }`}
          />
        );
      })}
    </div>
  );
}