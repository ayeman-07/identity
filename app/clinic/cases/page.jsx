'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import LogoutButton from '../../../components/LogoutButton';
import StatusBadge from '../../../components/StatusBadge';

export default function ClinicCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    fetchCases(token);
  }, []);

  const fetchCases = async (token) => {
    try {
      const response = await fetch('/api/clinic/cases', {
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
        const errorText = await response.text();
        console.error('Cases API error:', response.status, errorText);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setCases(data.cases || []);
      } else {
        throw new Error(data.error || 'Failed to fetch cases');
      }
    } catch (error) {
      console.error('Error fetching cases:', error);
      toast.error('Error loading cases. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelCase = async (caseId) => {
    if (!confirm('Are you sure you want to cancel this case?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/case/${caseId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Refresh cases
        fetchCases(token);
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to cancel case');
      }
    } catch (error) {
      console.error('Error cancelling case:', error);
      toast.error('Error cancelling case');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'NEW': 'bg-blue-100 text-blue-800',
      'ACCEPTED': 'bg-yellow-100 text-yellow-800',
      'IN_PROGRESS': 'bg-orange-100 text-orange-800',
      'READY': 'bg-purple-100 text-purple-800',
      'DISPATCHED': 'bg-indigo-100 text-indigo-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800',
      'REJECTED': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const canCancelCase = (status) => {
    return status === 'NEW' || status === 'ACCEPTED';
  };

  const filteredCases = cases.filter(caseItem => {
    const matchesFilter = filter === 'all' || caseItem.status === filter;
    const matchesSearch = caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseItem.toothNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseItem.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cases...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">My Cases</h1>
              <p className="text-gray-600">Manage your dental cases</p>
            </div>
            <div className="flex space-x-4">
              <Link 
                href="/clinic/dashboard"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                href="/clinic/upload-case"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Upload New Case
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search cases by title or tooth number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="NEW">New</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="READY">Ready</option>
                <option value="DISPATCHED">Dispatched</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cases List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Cases ({filteredCases.length})
            </h2>
          </div>
          
          <div className="p-6">
            {filteredCases.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No cases found</p>
                <Link 
                  href="/clinic/upload-case"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Upload Your First Case
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCases.map((caseItem) => (
                  <div key={caseItem.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-gray-900">{caseItem.title}</h3>
                          <StatusBadge status={caseItem.status} size="sm" />
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>Tooth:</strong> {caseItem.toothNumber}</p>
                          <p><strong>Created:</strong> {new Date(caseItem.createdAt).toLocaleDateString()}</p>
                          {caseItem.lab && (
                            <p><strong>Lab:</strong> {caseItem.lab.name}</p>
                          )}
                          {caseItem.description && (
                            <p><strong>Description:</strong> {caseItem.description}</p>
                          )}
                          <p><strong>Files:</strong> {caseItem.files?.length || 0} uploaded</p>
                          {caseItem.messageCount > 0 && (
                            <p><strong>Messages:</strong> {caseItem.messageCount}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {canCancelCase(caseItem.status) && (
                          <button
                            onClick={() => handleCancelCase(caseItem.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                        <Link
                          href={`/clinic/cases/${caseItem.id}`}
                          className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition-colors"
                        >
                          View
                        </Link>
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