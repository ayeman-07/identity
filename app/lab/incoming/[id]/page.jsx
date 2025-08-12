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
      NEW: 'bg-blue-500/10 text-blue-200 border border-blue-400/20',
      ACCEPTED: 'bg-blue-500/10 text-blue-200 border border-blue-400/20',
      IN_PROGRESS: 'bg-yellow-500/10 text-yellow-200 border border-yellow-400/20',
      READY: 'bg-purple-500/10 text-purple-200 border border-purple-400/20',
      DISPATCHED: 'bg-indigo-500/10 text-indigo-200 border border-indigo-400/20',
      DELIVERED: 'bg-green-500/10 text-green-200 border border-green-400/20',
      CANCELLED: 'bg-red-500/10 text-red-200 border border-red-400/20',
      REJECTED: 'bg-red-500/10 text-red-200 border border-red-400/20',
    };
    return colors[status] || 'bg-white/10 text-gray-200 border border-white/20';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-400">Loading case details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">{error}</div>
          <Link 
            href="/lab/incoming"
            className="btn-ghost px-4 py-2 hover:bg-white/5"
          >
            Back to Incoming Cases
          </Link>
        </div>
      </div>
    );
  }

  if (!caseItem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-xl mb-4">Case not found</div>
          <Link 
            href="/lab/incoming"
            className="btn-ghost px-4 py-2 hover:bg-white/5"
          >
            Back to Incoming Cases
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
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold"><span className="tx-gradient">Case Details</span></h1>
              <p className="text-gray-400">Case ID: {caseItem.id}</p>
            </div>
            <div className="flex space-x-4">
              <Link href="/lab/incoming" className="btn-ghost px-4 py-2 hover:bg-white/5">Back to Incoming Cases</Link>
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
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-gray-100 mb-4">Case Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400">Title</label>
                  <p className="mt-1 text-sm text-gray-100">{caseItem.title}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400">Status</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(caseItem.status)}`}>
                    {caseItem.status.replace('_', ' ')}
                  </span>
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

                {caseItem.clinic && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Clinic</label>
                    <p className="mt-1 text-sm text-gray-100">{caseItem.clinic.name}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {caseItem.status === 'NEW' && (
                <div className="mt-6 space-y-3">
                  <button
                    onClick={handleAcceptCase}
                    disabled={actionLoading}
                    className="w-full btn-gradient px-4 py-2 disabled:opacity-50"
                  >
                    {actionLoading ? 'Accepting...' : 'Accept Case'}
                  </button>
                  <button
                    onClick={handleRejectCase}
                    disabled={actionLoading}
                    className="w-full px-4 py-2 rounded-lg border border-red-400/20 bg-red-500/10 text-red-200 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? 'Rejecting...' : 'Reject Case'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Files Section */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-gray-100 mb-4">Files & 3D Models</h2>
              
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