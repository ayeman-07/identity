'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import FileList from '../../../../components/FileList';
import LogoutButton from '../../../../components/LogoutButton';
import MessageThread from '../../../../components/MessageThread';
import StatusProgressBar from '../../../../components/StatusProgressBar';
import StatusHistory from '../../../../components/StatusHistory';
import StatusUpdateControl from '../../../../components/StatusUpdateControl';

export default function LabJobDetail() {
  const params = useParams();
  const router = useRouter();
  const [caseItem, setCaseItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchCaseDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        // Fetch current user (for chat box)
        try {
          const userResponse = await fetch('/api/user/me', {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setCurrentUser(userData.user);
          }
        } catch {
          // non-blocking for chat
        }

        // Fetch case details
        const response = await fetch(`/api/case/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
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
      } catch (e) {
        console.error('Error fetching case details:', e);
        setError('Failed to load case details');
      } finally {
        setLoading(false);
      }
    };

    fetchCaseDetails();
  }, [params.id, router]);

  const handleStatusUpdate = (updatedCase) => {
    setCaseItem(updatedCase);
  };

  const getStatusColor = (status) => {
    const colors = {
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
        <div className="text-xl text-gray-400">Loading job details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">{error}</div>
          <Link href="/lab/jobs" className="btn-ghost px-4 py-2 hover:bg-white/5">
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  if (!caseItem) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-xl mb-4">Job not found</div>
          <Link href="/lab/jobs" className="btn-ghost px-4 py-2 hover:bg-white/5">
            Back to Jobs
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
              <h1 className="text-3xl font-bold">
                <span className="tx-gradient">Job Details</span>
              </h1>
              <p className="text-gray-400">Case ID: {caseItem.id}</p>
            </div>
            <div className="flex space-x-4">
              <Link href="/lab/jobs" className="btn-ghost px-4 py-2 hover:bg-white/5">
                Back to Jobs
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Actions & Case Information */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-gray-100 mb-4">Case Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400">Title</label>
                  <p className="mt-1 text-sm text-gray-100">{caseItem.title}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400">Status</label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      caseItem.status
                    )}`}
                  >
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
            </div>

            {/* Status Update Control (Lab) */}
            <StatusUpdateControl
              caseData={caseItem}
              onStatusUpdate={handleStatusUpdate}
              userRole="LAB"
            />

            {/* Lab Information */}
            {caseItem.lab && (
              <div className="glass-card p-6">
                <h3 className="text-lg font-medium text-gray-100 mb-4">Lab Information</h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-400">Lab Name</label>
                    <p className="text-sm text-gray-100">{caseItem.lab.name}</p>
                  </div>
                  {caseItem.lab.rating && (
                    <div>
                      <label className="block text-sm font-medium text-gray-400">Rating</label>
                      <p className="text-sm text-gray-100">⭐ {caseItem.lab.rating}/5</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Files, Progress, Chat, History */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-gray-100 mb-4">Files & 3D Models</h2>

              <FileList
                files={caseItem.files || []}
                caseId={caseItem.id}
                onFileUpload={() => {}}
                canUpload={false}
              />
            </div>

            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-gray-100 mb-4">Case Progress</h2>
              <StatusProgressBar
                currentStatus={caseItem.status}
                statusHistory={caseItem.statusHistory || []}
              />
            </div>

            <MessageThread caseId={caseItem.id} currentUser={currentUser} />

            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-gray-100 mb-4">Status History</h2>
              <StatusHistory statusHistory={caseItem.statusHistory || []} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
