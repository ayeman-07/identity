'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import LogoutButton from '../../../../components/LogoutButton';
import FileList from '../../../../components/FileList';
import StatusBadge from '../../../../components/StatusBadge';
import StatusProgressBar from '../../../../components/StatusProgressBar';
import StatusHistory from '../../../../components/StatusHistory';
import StatusUpdateControl from '../../../../components/StatusUpdateControl';
import MessageThread from '../../../../components/MessageThread';

export default function JobDetails() {
  const params = useParams();
  const [caseData, setCaseData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const handleStatusUpdate = (updatedCase) => {
    setCaseData(updatedCase);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    if (params.id) {
      fetchUserAndCaseDetails(token, params.id);
    }
  }, [params.id]);

  const fetchUserAndCaseDetails = async (token, caseId) => {
    try {
      // Fetch current user info
      const userResponse = await fetch('/api/user/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setCurrentUser(userData.user);
      }

      // Fetch case details
      const response = await fetch(`/api/case/${caseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setCaseData(data.case);
    } catch (error) {
      console.error('Error fetching case details:', error);
      toast.error('Error loading case details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    if (!caseData) return;
    
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/case/${caseData.id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setCaseData(prev => ({ ...prev, status: newStatus }));
      toast.success(`Case status updated to ${newStatus.replace('_', ' ')}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Case Not Found</h2>
          <Link 
            href="/lab/jobs"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Jobs
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
              <h1 className="text-3xl font-bold text-gray-900">{caseData.title}</h1>
              <p className="text-gray-600">Case Details</p>
            </div>
            <div className="flex space-x-4">
              <Link 
                href="/lab/jobs"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Jobs
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Case Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Progress Bar */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Case Progress</h2>
              <StatusProgressBar 
                currentStatus={caseData.status} 
                statusHistory={caseData.statusHistory || []}
              />
            </div>

            {/* Case Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Case Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <p className="mt-1 text-sm text-gray-900">{caseData.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    <StatusBadge status={caseData.status} size="md" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Clinic</label>
                  <p className="mt-1 text-sm text-gray-900">{caseData.clinic?.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(caseData.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {caseData.description && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-sm text-gray-900">{caseData.description}</p>
                </div>
              )}
            </div>

            {/* Files */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Case Files</h2>
              <FileList 
                files={caseData.files || []} 
                showUpload={false}
                readOnly={true}
              />
            </div>

            {/* Message Thread */}
            <MessageThread
              caseId={caseData.id}
              currentUser={currentUser}
            />

            {/* Status History */}
            <StatusHistory statusHistory={caseData.statusHistory || []} />
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            {/* Status Update Control */}
            <StatusUpdateControl 
              caseData={caseData}
              onStatusUpdate={handleStatusUpdate}
              userRole="LAB"
            />

            {/* Lab Information */}
            {caseData.lab && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Lab Information</h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Lab Name</label>
                    <p className="text-sm text-gray-900">{caseData.lab.name}</p>
                  </div>
                  {caseData.lab.rating && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Rating</label>
                      <p className="text-sm text-gray-900">⭐ {caseData.lab.rating}/5</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
