'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function FavoriteLabsList({ favoriteLabs, recommendedLabs, onFavoriteChange }) {
  const [favorites, setFavorites] = useState(favoriteLabs?.map(fav => fav.id) || []);

  const handleToggleFavorite = async (labId) => {
    try {
      const token = localStorage.getItem('token');
      const isFavorite = favorites.includes(labId);

      if (isFavorite) {
        // Remove from favorites
        const response = await fetch(`/api/labs/favorites?labId=${labId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to remove from favorites');
        }

        setFavorites(prev => prev.filter(id => id !== labId));
        toast.success('Lab removed from favorites');
      } else {
        // Add to favorites
        const response = await fetch('/api/labs/favorites', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ labId })
        });

        if (!response.ok) {
          throw new Error('Failed to add to favorites');
        }

        setFavorites(prev => [...prev, labId]);
        toast.success('Lab added to favorites');
      }

      // Notify parent component of the change
      if (onFavoriteChange) {
        onFavoriteChange();
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  const renderLabCard = (lab, isFavorite = false) => {
    const isCurrentlyFavorite = favorites.includes(lab.id);
    
    return (
      <div key={lab.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center">
                <h3 className="font-medium text-gray-900">{lab.name}</h3>
                {isFavorite && (
                  <svg className="w-4 h-4 ml-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                )}
              </div>
              {/* Favorite Toggle Button */}
              <button
                onClick={() => handleToggleFavorite(lab.id)}
                className={`p-1 rounded-full hover:bg-gray-100 transition-colors ${
                  isCurrentlyFavorite ? 'text-red-500' : 'text-gray-400'
                }`}
                title={isCurrentlyFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <svg 
                  className="w-5 h-5" 
                  fill={isCurrentlyFavorite ? 'currentColor' : 'none'} 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                  />
                </svg>
              </button>
            </div>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <svg className="w-4 h-4 mr-1 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>{lab.rating ? lab.rating.toFixed(1) : 'No rating'}</span>
            </div>
            {lab.location && (
              <div className="flex items-center text-sm text-gray-500 mb-1">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{lab.location}</span>
              </div>
            )}
            {lab.turnaroundTime && (
              <div className="flex items-center text-sm text-gray-500 mb-1">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{lab.turnaroundTime} days turnaround</span>
              </div>
            )}
            {lab.specialties && lab.specialties.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {lab.specialties.slice(0, 3).map((specialty, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                  >
                    {specialty}
                  </span>
                ))}
                {lab.specialties.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    +{lab.specialties.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-2">
          <Link
            href={`/clinic/upload-case?labId=${lab.id}`}
            className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Case
          </Link>
          <Link
            href={`/clinic/labs?labId=${lab.id}`}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Favorite Labs */}
      {favoriteLabs && favoriteLabs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Favorite Labs</h3>
            <Link
              href="/clinic/labs"
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              View all labs →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {favoriteLabs.map((lab) => renderLabCard(lab, true))}
          </div>
        </div>
      )}

      {/* Recommended Labs */}
      {recommendedLabs && recommendedLabs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {favoriteLabs && favoriteLabs.length > 0 ? 'Recommended Labs' : 'Top Rated Labs'}
            </h3>
            <Link
              href="/clinic/labs"
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Explore more →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedLabs.map((lab) => renderLabCard(lab, false))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!favoriteLabs || favoriteLabs.length === 0) && (!recommendedLabs || recommendedLabs.length === 0) && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h1m-1-4h1m4 4h1m-1-4h1" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No labs found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by exploring available labs.</p>
          <div className="mt-6">
            <Link
              href="/clinic/labs"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse Labs
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
