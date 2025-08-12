'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Subtle spotlight glow that follows the cursor.
 * Renders an absolute, pointer-events-none overlay.
 */
export default function Spotlight({ className }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: '50%', y: '20%' });

  useEffect(() => {
    const parent = ref.current?.parentElement ?? document.body;
    const handle = (e) => {
      const rect = parent.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setPos({ x: `${x.toFixed(2)}%`, y: `${y.toFixed(2)}%` });
    };
    parent.addEventListener('mousemove', handle);
    return () => parent.removeEventListener('mousemove', handle);
  }, []);

  return (
    <div
      ref={ref}
      className={`pointer-events-none absolute inset-0 transition-opacity duration-300 ${className || ''}`}
      style={{
        background: `radial-gradient(600px circle at ${pos.x} ${pos.y}, rgba(99,102,241,0.18), transparent 60%)`,
      }}
    />
  );
}
