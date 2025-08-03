'use client';

import { useState } from 'react';
import FavoriteButton from './FavoriteButton';

export default function LabCard({ lab, isFavorite, onToggleFavorite, onSendCase, onViewProfile, size = 'normal' }) {
  const [imageError, setImageError] = useState(false);

  // Safely handle missing lab data
  if (!lab) {
    return <div className="bg-white rounded-lg shadow-md p-4 text-center text-gray-500">Lab data unavailable</div>;
  }

  // Calculate derived properties with safe defaults
  const totalReviews = lab.totalReviews || lab._count?.reviews || 0;
  const totalCases = lab.totalCases || lab._count?.cases || 0;
  const favoriteCount = lab.favoriteCount || lab._count?.favorites || 0;
  const rating = lab.rating || 0;
  const turnaroundTime = lab.turnaroundTime || 0;

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600 bg-green-100';
    if (rating >= 4.0) return 'text-blue-600 bg-blue-100';
    if (rating >= 3.5) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getTurnaroundColor = (days) => {
    if (days <= 3) return 'text-green-600 bg-green-100';
    if (days <= 5) return 'text-blue-600 bg-blue-100';
    if (days <= 7) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatSpecialties = (specialties) => {
    if (!specialties || specialties.length === 0) return 'General';
    if (size === 'small') {
      return specialties.slice(0, 2).join(', ') + (specialties.length > 2 ? '...' : '');
    }
    return specialties.slice(0, 3).join(', ') + (specialties.length > 3 ? '...' : '');
  };

  const cardClasses = size === 'small' 
    ? "bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
    : "bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden";

  const headerPadding = size === 'small' ? 'p-3' : 'p-4';
  const titleSize = size === 'small' ? 'text-lg' : 'text-xl';
  const buttonSize = size === 'small' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2';

  return (
    <div className={cardClasses}>
      {/* Lab Header */}
      <div className={headerPadding}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {/* Lab Logo/Avatar */}
            <div className="flex-shrink-0">
              {lab.logo && !imageError ? (
                <img
                  src={lab.logo}
                  alt={`${lab.name} logo`}
                  className={`${size === 'small' ? 'h-10 w-10' : 'h-12 w-12'} rounded-full object-cover`}
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className={`${size === 'small' ? 'h-10 w-10' : 'h-12 w-12'} rounded-full bg-indigo-100 flex items-center justify-center`}>
                  <span className={`text-indigo-600 font-medium ${size === 'small' ? 'text-base' : 'text-lg'}`}>
                    {lab.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            <div>
              <h3 className={`${titleSize} font-semibold text-gray-900`}>{lab.name}</h3>
              {lab.location && (
                <p className="text-sm text-gray-500 flex items-center">
                  <span className="mr-1">📍</span>
                  {lab.location}
                </p>
              )}
            </div>
          </div>

          {/* Favorite Button */}
          <FavoriteButton
            isFavorite={isFavorite}
            onToggle={() => onToggleFavorite(lab.id)}
            size={size === 'small' ? 'sm' : 'md'}
          />
        </div>
      </div>

      {/* Lab Stats */}
      <div className={`${headerPadding} ${size === 'small' ? 'pb-2' : 'pb-4'}`}>
        <div className="grid grid-cols-2 gap-4">
          {/* Rating */}
          <div className="text-center">
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRatingColor(rating)}`}>
              ⭐ {rating.toFixed(1)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Turnaround Time */}
          <div className="text-center">
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTurnaroundColor(turnaroundTime)}`}>
              ⏱️ {turnaroundTime} day{turnaroundTime !== 1 ? 's' : ''}
            </div>
            <p className="text-xs text-gray-500 mt-1">Turnaround</p>
          </div>
        </div>
      </div>

      {/* Specialties */}
      <div className={`${headerPadding} ${size === 'small' ? 'pb-2' : 'pb-4'}`}>
        <div className="text-sm">
          <span className="text-gray-700 font-medium">Specialties: </span>
          <span className="text-gray-600">{formatSpecialties(lab.specialties)}</span>
        </div>
      </div>

      {size === 'normal' && (
        <>
          {/* Case Count */}
          <div className="px-6 pb-4">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{totalCases} cases completed</span>
              {favoriteCount > 0 && (
                <span>{favoriteCount} clinic{favoriteCount !== 1 ? 's' : ''} favorited</span>
              )}
            </div>
          </div>

          {/* Recent Reviews */}
          {lab.reviews && lab.reviews.length > 0 && (
            <div className="px-6 pb-4">
              <div className="bg-gray-50 rounded-md p-3">
                <p className="text-sm text-gray-600 italic">
                  "{lab.reviews[0].message || 'Great service!'}"
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  - Recent review
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Action Buttons */}
      <div className={headerPadding}>
        <div className={`flex ${size === 'small' ? 'space-x-2' : 'space-x-3'}`}>
          {onViewProfile && (
            <button
              onClick={onViewProfile}
              className={`flex-1 bg-gray-100 text-gray-700 ${buttonSize} rounded-md font-medium hover:bg-gray-200 transition-colors`}
            >
              {size === 'small' ? 'View' : 'View Profile'}
            </button>
          )}
          {onSendCase && (
            <button
              onClick={onSendCase}
              className={`flex-1 bg-indigo-600 text-white ${buttonSize} rounded-md font-medium hover:bg-indigo-700 transition-colors`}
            >
              {size === 'small' ? 'Send Case' : 'Send Case'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
