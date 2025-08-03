'use client';

import { useState } from 'react';

export default function FavoriteButton({ isFavorite, onToggle, size = 'md' }) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = async () => {
    setIsAnimating(true);
    await onToggle();
    setTimeout(() => setIsAnimating(false), 300);
  };

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  const iconSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <button
      onClick={handleClick}
      className={`
        ${sizeClasses[size]} 
        rounded-full flex items-center justify-center transition-all duration-200
        ${isFavorite 
          ? 'bg-red-100 text-red-600 hover:bg-red-200' 
          : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
        }
        ${isAnimating ? 'scale-110' : 'scale-100'}
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
      `}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <span className={`${iconSizes[size]} ${isAnimating ? 'animate-pulse' : ''}`}>
        {isFavorite ? '❤️' : '🤍'}
      </span>
    </button>
  );
}
