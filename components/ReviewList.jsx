'use client';

import { useState, useEffect } from 'react';
import StarRating from './StarRating';

export default function ReviewList({ labId, className = '' }) {
  const [reviews, setReviews] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (labId) {
      fetchReviews();
    }
  }, [labId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/labs/${labId}/reviews`);
      const data = await response.json();

      if (response.ok) {
        setReviews(data.reviews);
        setStatistics(data.statistics);
      } else {
        setError(data.error || 'Failed to load reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Error loading reviews');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-600 text-center py-4 ${className}`}>
        {error}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className={`text-gray-500 text-center py-8 ${className}`}>
        <div className="text-4xl mb-2">💬</div>
        <p>No reviews yet</p>
        <p className="text-sm mt-1">Be the first to leave a review!</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Statistics Summary */}
      {statistics && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <StarRating rating={statistics.averageRating} size="lg" />
              <div>
                <div className="font-medium text-lg">
                  {statistics.averageRating.toFixed(1)} out of 5
                </div>
                <div className="text-sm text-gray-600">
                  Based on {statistics.totalReviews} review{statistics.totalReviews !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Rating Breakdown */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = statistics.ratingBreakdown[rating] || 0;
              const percentage = statistics.totalReviews > 0 
                ? (count / statistics.totalReviews) * 100 
                : 0;

              return (
                <div key={rating} className="flex items-center space-x-3 text-sm">
                  <div className="flex items-center space-x-1 w-12">
                    <span>{rating}</span>
                    <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="w-8 text-right text-gray-600">
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900 mb-4">
          Reviews ({reviews.length})
        </h3>
        
        {reviews.map((review) => (
          <div key={review.id} className="border rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-indigo-600">
                    {review.clinic.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {review.clinic.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(review.timestamp)}
                  </div>
                </div>
              </div>
              <StarRating rating={review.rating} size="sm" showRating={false} />
            </div>

            {review.comment && (
              <p className="text-gray-700 leading-relaxed">
                {review.comment}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
