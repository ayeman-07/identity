'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import LogoutButton from '../../../components/LogoutButton';
import StatusBadge from '../../../components/StatusBadge';

export default function LabIncoming() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    fetchIncomingCases(token);
  }, []);

  const fetchIncomingCases = async (token) => {
    try {
      // For now, we'll fetch all NEW cases
      // In production, you'd have a specific endpoint for incoming cases
      const response = await fetch('/api/lab/incoming-cases', {
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

      const data = await response.json();
      setCases(data.cases || []);
    } catch (error) {
      console.error('Error fetching incoming cases:', error);
      // For now, show mock data
      setCases([
        {
          id: '1',
          title: 'Crown Case #001',
          toothNumber: '14',
          caseNotes: 'Patient needs crown for tooth 14',
          clinic: { name: 'Dr. Smith Dental Clinic' },
          createdAt: new Date().toISOString(),
          status: 'NEW'
        },
        {
          id: '2',
          title: 'Aligners Case #002',
          toothNumber: 'Multiple',
          caseNotes: 'Full arch aligners for patient',
          clinic: { name: 'Johnson Orthodontics' },
          createdAt: new Date().toISOString(),
          status: 'NEW'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptCase = async (caseId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/case/${caseId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'accept' })
      });

      if (response.ok) {
        // Remove the case from the list
        setCases(prev => prev.filter(c => c.id !== caseId));
        toast.success('Case accepted successfully!');
      } else if (response.status === 409) {
        // Case was already accepted by another lab - remove it and refresh the list
        setCases(prev => prev.filter(c => c.id !== caseId));
        toast.error('This case has already been accepted by another lab');
        // Optionally refresh the entire list to sync with server
        const token = localStorage.getItem('token');
        if (token) fetchIncomingCases(token);
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to accept case');
      }
    } catch (error) {
      console.error('Error accepting case:', error);
      toast.error('Error accepting case');
    }
  };

  const handleRejectCase = async (caseId) => {
    if (!confirm('Are you sure you want to reject this case?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/case/${caseId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'reject' })
      });

      if (response.ok) {
        // Remove the case from the list
        setCases(prev => prev.filter(c => c.id !== caseId));
        toast.success('Case rejected successfully!');
      } else if (response.status === 409) {
        // Case was already handled by another lab - remove it and refresh the list
        setCases(prev => prev.filter(c => c.id !== caseId));
        toast.error('This case has already been handled by another lab');
        // Optionally refresh the entire list to sync with server
        const token = localStorage.getItem('token');
        if (token) fetchIncomingCases(token);
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to reject case');
      }
    } catch (error) {
      console.error('Error rejecting case:', error);
      toast.error('Error rejecting case');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-400">Loading...</div>
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
              <h1 className="text-3xl font-bold"><span className="tx-gradient">Incoming Cases</span></h1>
              <p className="text-gray-400">Review cases from general pool and cases assigned specifically to your lab</p>
            </div>
            <div className="flex space-x-4">
              <Link href="/lab/dashboard" className="btn-ghost px-4 py-2 hover:bg-white/5">Dashboard</Link>
              <Link href="/lab/jobs" className="btn-ghost px-4 py-2 hover:bg-white/5">Active Jobs</Link>
              <Link href="/lab/jobs/completed" className="btn-gradient px-4 py-2">Completed Jobs</Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      {/* Cases List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="glass-card">
          <div className="px-6 py-4 border-b border-white/10">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-100">
                Available Cases ({cases.length})
              </h2>
              <div className="flex space-x-4 text-sm">
                <span className="px-2 py-1 border border-purple-400/20 bg-purple-500/10 text-purple-200 rounded-full">
                  🎯 {cases.filter(c => c.isAssignedToLab).length} Assigned to You
                </span>
                <span className="px-2 py-1 border border-white/20 bg-white/10 text-gray-200 rounded-full">
                  📢 {cases.filter(c => !c.isAssignedToLab).length} General Pool
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {cases.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No incoming cases available</p>
                <p className="text-sm text-gray-500">New cases will appear here when clinics upload them</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cases.map((caseItem) => (
                  <div key={caseItem.id} className="border border-white/10 bg-white/5 rounded-lg p-6 hover:bg-white/10 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <Link 
                            href={`/lab/incoming/${caseItem.id}`}
                            className="text-lg font-medium text-gray-100 hover:text-indigo-300 transition-colors"
                          >
                            {caseItem.title}
                          </Link>
                          <div className="flex space-x-2">
                            <span className="px-2 py-1 text-xs font-medium bg-blue-500/10 text-blue-200 border border-blue-400/20 rounded-full">NEW</span>
                            {caseItem.isAssignedToLab ? (
                              <span className="px-2 py-1 text-xs font-medium bg-purple-500/10 text-purple-200 border border-purple-400/20 rounded-full">🎯 ASSIGNED TO YOU</span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-medium bg-white/10 text-gray-200 border border-white/20 rounded-full">📢 GENERAL POOL</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
                          <div>
                            <p><strong>Clinic:</strong> {caseItem.clinic.name}</p>
                            <p><strong>Tooth:</strong> {caseItem.toothNumber}</p>
                            <p><strong>Submitted:</strong> {new Date(caseItem.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            {caseItem.caseNotes && (
                              <p><strong>Notes:</strong> {caseItem.caseNotes}</p>
                            )}
                            <p><strong>Files:</strong> {caseItem.files?.length || 0} uploaded</p>
                            {caseItem.isAssignedToLab && (
                              <p className="text-purple-300 font-medium">💼 This case was specifically sent to your lab</p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleAcceptCase(caseItem.id)}
                          className="btn-gradient px-4 py-2"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectCase(caseItem.id)}
                          className="px-4 py-2 rounded-lg border border-red-400/20 bg-red-500/10 text-red-200 hover:bg-red-500/20 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 