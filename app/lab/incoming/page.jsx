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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
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
              <h1 className="text-3xl font-bold text-gray-900">Incoming Cases</h1>
              <p className="text-gray-600">Review cases from general pool and cases assigned specifically to your lab</p>
            </div>
            <div className="flex space-x-4">
              <Link 
                href="/lab/dashboard"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                href="/lab/jobs"
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Active Jobs
              </Link>
              <Link 
                href="/lab/jobs/completed"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Completed Jobs
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      {/* Cases List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                Available Cases ({cases.length})
              </h2>
              <div className="flex space-x-4 text-sm">
                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                  🎯 {cases.filter(c => c.isAssignedToLab).length} Assigned to You
                </span>
                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
                  📢 {cases.filter(c => !c.isAssignedToLab).length} General Pool
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {cases.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No incoming cases available</p>
                <p className="text-sm text-gray-400">New cases will appear here when clinics upload them</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cases.map((caseItem) => (
                  <div key={caseItem.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <Link 
                            href={`/lab/incoming/${caseItem.id}`}
                            className="text-lg font-medium text-gray-900 hover:text-indigo-600 transition-colors"
                          >
                            {caseItem.title}
                          </Link>
                          <div className="flex space-x-2">
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              NEW
                            </span>
                            {caseItem.isAssignedToLab ? (
                              <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                                🎯 ASSIGNED TO YOU
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                                📢 GENERAL POOL
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
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
                              <p className="text-purple-600 font-medium">
                                💼 This case was specifically sent to your lab
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleAcceptCase(caseItem.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectCase(caseItem.id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
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