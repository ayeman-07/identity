'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import FileList from '../../../../components/FileList';
import LogoutButton from '../../../../components/LogoutButton';

export default function LabCaseDetail() {
  const params = useParams();
  const router = useRouter();
  const [caseItem, setCaseItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchCaseDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
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
      } catch (error) {
        console.error('Error fetching case details:', error);
        setError('Failed to load case details');
      } finally {
        setLoading(false);
      }
    };

    fetchCaseDetails();
  }, [params.id, router]);

  const handleAcceptCase = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/case/${params.id}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'accept' })
      });

      if (response.ok) {
        toast.success('Case accepted successfully!');
        // Refresh case details
        window.location.reload();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to accept case');
      }
    } catch (error) {
      console.error('Error accepting case:', error);
      toast.error('Error accepting case');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectCase = async () => {
    if (!confirm('Are you sure you want to reject this case?')) {
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/case/${params.id}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'reject' })
      });

      if (response.ok) {
        toast.success('Case rejected successfully!');
        // Redirect back to incoming cases
        router.push('/lab/incoming');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to reject case');
      }
    } catch (error) {
      console.error('Error rejecting case:', error);
      toast.error('Error rejecting case');
    } finally {
      setActionLoading(false);
    }
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading case details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <Link 
            href="/lab/incoming"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Incoming Cases
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
            href="/lab/incoming"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Incoming Cases
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
              <h1 className="text-3xl font-bold text-gray-900">Case Details</h1>
              <p className="text-gray-600">Case ID: {caseItem.id}</p>
            </div>
            <div className="flex space-x-4">
              <Link 
                href="/lab/incoming"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Back to Incoming Cases
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
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Case Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <p className="mt-1 text-sm text-gray-900">{caseItem.title}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(caseItem.status)}`}>
                    {caseItem.status.replace('_', ' ')}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Tooth Number</label>
                  <p className="mt-1 text-sm text-gray-900">{caseItem.toothNumber || 'Not specified'}</p>
                </div>

                {caseItem.caseNotes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <p className="mt-1 text-sm text-gray-900">{caseItem.caseNotes}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">Created</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(caseItem.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(caseItem.updatedAt).toLocaleDateString()}
                  </p>
                </div>

                {caseItem.clinic && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Clinic</label>
                    <p className="mt-1 text-sm text-gray-900">{caseItem.clinic.name}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {caseItem.status === 'NEW' && (
                <div className="mt-6 space-y-3">
                  <button
                    onClick={handleAcceptCase}
                    disabled={actionLoading}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? 'Accepting...' : 'Accept Case'}
                  </button>
                  <button
                    onClick={handleRejectCase}
                    disabled={actionLoading}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? 'Rejecting...' : 'Reject Case'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Files Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Files & 3D Models</h2>
              
              <FileList
                files={caseItem.files || []}
                caseId={caseItem.id}
                onFileUpload={() => {}}
                canUpload={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 