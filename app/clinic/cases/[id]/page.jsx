'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import FileList from '../../../../components/FileList';
import LogoutButton from '../../../../components/LogoutButton';
import StatusBadge from '../../../../components/StatusBadge';
import StatusProgressBar from '../../../../components/StatusProgressBar';
import StatusHistory from '../../../../components/StatusHistory';
import MessageThread from '../../../../components/MessageThread';
import ReviewFormModal from '../../../../components/ReviewFormModal';

export default function CaseDetail() {
  const params = useParams();
  const router = useRouter();
  const [caseItem, setCaseItem] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    const fetchCaseDetails = async () => {
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

        const response = await fetch(`/api/case/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch case details');
        }

        const data = await response.json();
        setCaseItem(data.case);
        
        // Check if this case already has a review
        if (data.case.status === 'DELIVERED') {
          checkExistingReview(data.case.id);
        }
      } catch (error) {
        console.error('Error fetching case details:', error);
        setError('Failed to load case details');
      } finally {
        setLoading(false);
      }
    };

    fetchCaseDetails();
  }, [params.id, router]);

  const checkExistingReview = async (caseId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reviews', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const existingReview = data.reviews.find(review => review.caseId === caseId);
        setHasReviewed(!!existingReview);
      }
    } catch (error) {
      console.error('Error checking existing review:', error);
    }
  };

  const handleReviewSubmit = (review) => {
    setHasReviewed(true);
    toast.success('Thank you for your review!');
  };

  const handleFileUpload = (uploadedFiles) => {
    // Refresh case details after file upload
    window.location.reload();
  };

  const getStatusColor = (status) => {
    const colors = {
      'NEW': 'bg-yellow-100 text-yellow-800',
      'ACCEPTED': 'bg-blue-100 text-blue-800',
      'IN_PROGRESS': 'bg-orange-100 text-orange-800',
      'READY': 'bg-green-100 text-green-800',
      'DISPATCHED': 'bg-purple-100 text-purple-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800',
      'REJECTED': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        {/* Header Skeleton */}
        <div className="glass-card">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center py-6 gap-6 md:gap-0">
              <div className="space-y-3 w-full md:w-auto animate-pulse">
                <div className="h-8 w-48 bg-white/10 rounded" />
                <div className="h-4 w-64 bg-white/5 rounded" />
              </div>
              <div className="flex flex-wrap gap-3 animate-pulse">
                <div className="h-10 w-32 bg-white/5 rounded" />
                <div className="h-10 w-36 bg-white/5 rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-6">
              {/* Progress Card Skeleton */}
              <div className="glass-card p-6 animate-pulse">
                <div className="h-5 w-32 bg-white/10 rounded mb-6" />
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-3 w-full bg-white/5 rounded" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Case Info Card Skeleton */}
              <div className="glass-card p-6 animate-pulse">
                <div className="h-6 w-40 bg-white/10 rounded mb-6" />
                <div className="space-y-5">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-3 w-28 bg-white/5 rounded" />
                      <div className="h-4 w-48 bg-white/10 rounded" />
                    </div>
                  ))}
                  <div className="pt-4 mt-2 border-t border-white/5">
                    <div className="h-10 w-full bg-white/5 rounded" />
                  </div>
                </div>
              </div>

              {/* Status History Skeleton */}
              <div className="glass-card p-6 animate-pulse space-y-4">
                <div className="h-5 w-44 bg-white/10 rounded" />
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="h-8 w-8 rounded-full bg-white/5" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-40 bg-white/5 rounded" />
                      <div className="h-3 w-24 bg-white/5 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Files Skeleton */}
              <div className="glass-card p-6 animate-pulse">
                <div className="h-6 w-56 bg-white/10 rounded mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 bg-white/5 rounded" />
                  ))}
                </div>
                <div className="mt-6 h-10 w-40 bg-white/5 rounded" />
              </div>

              {/* Message Thread Skeleton */}
              <div className="glass-card p-6 animate-pulse">
                <div className="h-6 w-48 bg-white/10 rounded mb-6" />
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-3 w-32 bg-white/5 rounded" />
                      <div className="h-4 w-full bg-white/5 rounded" />
                      <div className="h-4 w-2/3 bg-white/5 rounded" />
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex gap-3">
                  <div className="h-10 flex-1 bg-white/5 rounded" />
                  <div className="h-10 w-24 bg-white/10 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <Link 
            href="/clinic/cases"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Cases
          </Link>
        </div>
      </div>
    );
  }

  if (!caseItem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 text-xl mb-4">Case not found</div>
          <Link 
            href="/clinic/cases"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Cases
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="glass-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center py-6 gap-6 md:gap-0">
            <div>
              <h1 className="text-3xl font-bold"><span className="tx-gradient">Case Details</span></h1>
              <p className="text-gray-400">Case ID: {caseItem.id}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link 
                href="/clinic/cases"
                className="btn-ghost px-4 py-2 hover:bg-white/5"
              >
                Back to Cases
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Case Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Status Progress */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-medium text-gray-100 mb-4">Case Progress</h2>
              <StatusProgressBar 
                currentStatus={caseItem.status} 
                statusHistory={caseItem.statusHistory || []}
              />
            </div>

            {/* Case Details */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-gray-100 mb-4">Case Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400">Title</label>
                  <p className="mt-1 text-sm text-gray-100">{caseItem.title}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400">Status</label>
                  <div className="mt-1">
                    <StatusBadge status={caseItem.status} size="md" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400">Tooth Number</label>
                  <p className="mt-1 text-sm text-gray-100">{caseItem.toothNumber || 'Not specified'}</p>
                </div>

                {caseItem.caseNotes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Notes</label>
                    <p className="mt-1 text-sm text-gray-100">{caseItem.caseNotes}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-400">Created</label>
                  <p className="mt-1 text-sm text-gray-100">
                    {new Date(caseItem.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400">Last Updated</label>
                  <p className="mt-1 text-sm text-gray-100">
                    {new Date(caseItem.updatedAt).toLocaleDateString()}
                  </p>
                </div>

                {caseItem.lab && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Assigned Lab</label>
                    <p className="mt-1 text-sm text-gray-100">{caseItem.lab.name}</p>
                  </div>
                )}

                {/* Review Button for Delivered Cases */}
                {caseItem.status === 'DELIVERED' && caseItem.lab && (
                  <div className="pt-4 border-t border-gray-200">
                    {hasReviewed ? (
                      <div className="text-center py-3">
                        <div className="text-green-600 mb-2">
                          <svg className="w-6 h-6 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-600">
                          You have already reviewed this lab
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReviewModalOpen(true)}
                        className="w-full btn-gradient px-4 py-2 flex items-center justify-center space-x-2"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span>Leave a Review</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Status History */}
            <StatusHistory statusHistory={caseItem.statusHistory || []} />
          </div>

          {/* Files Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-gray-100 mb-4">Files & 3D Models</h2>
              
              <FileList
                files={caseItem.files || []}
                caseId={caseItem.id}
                onFileUpload={handleFileUpload}
                canUpload={true}
              />
            </div>

            {/* Message Thread */}
            <MessageThread
              caseId={caseItem.id}
              currentUser={currentUser}
            />
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {caseItem && caseItem.status === 'DELIVERED' && caseItem.lab && (
        <ReviewFormModal
          caseData={caseItem}
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
} 