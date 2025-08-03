'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ReviewList from '../../../components/ReviewList';
import StarRating from '../../../components/StarRating';
import LogoutButton from '../../../components/LogoutButton';

export default function LabProfile() {
  const params = useParams();
  const router = useRouter();
  const [lab, setLab] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLabProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        // Fetch current user info
        const userResponse = await fetch('/api/user/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setCurrentUser(userData.user);
        }

        // Fetch lab profile (public endpoint)
        const response = await fetch(`/api/labs/${params.id}`);

        if (!response.ok) {
          throw new Error('Failed to fetch lab profile');
        }

        const data = await response.json();
        setLab(data.lab);
      } catch (error) {
        console.error('Error fetching lab profile:', error);
        setError('Failed to load lab profile');
      } finally {
        setLoading(false);
      }
    };

    fetchLabProfile();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading lab profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <Link 
            href="/dashboard"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!lab) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-xl mb-4">Lab not found</div>
          <Link 
            href="/dashboard"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{lab.name}</h1>
              <p className="text-gray-600">Lab Profile</p>
            </div>
            <div className="flex space-x-4">
              <Link 
                href="/dashboard"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Back to Dashboard
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lab Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Lab Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{lab.name}</p>
                </div>

                {lab.location && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <p className="mt-1 text-sm text-gray-900">{lab.location}</p>
                  </div>
                )}

                {lab.email && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{lab.email}</p>
                  </div>
                )}

                {lab.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="mt-1 text-sm text-gray-900">{lab.phone}</p>
                  </div>
                )}

                {lab.website && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Website</label>
                    <a 
                      href={lab.website.startsWith('http') ? lab.website : `https://${lab.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      {lab.website}
                    </a>
                  </div>
                )}

                {lab.specialties && lab.specialties.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Specialties</label>
                    <div className="mt-1">
                      <div className="flex flex-wrap gap-2">
                        {lab.specialties.map((specialty, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {lab.rating !== null && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rating</label>
                    <div className="mt-1">
                      <StarRating rating={lab.rating} size="md" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Member Since</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(lab.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              {currentUser?.role === 'CLINIC' && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Link
                    href={`/clinic/upload-case?labId=${lab.id}`}
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Create Case with This Lab</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Reviews & Ratings</h2>
              
              <ReviewList labId={lab.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
