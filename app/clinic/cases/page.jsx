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

  // Remove full-screen return; we'll show inline skeletons below

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="glass-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center py-6 gap-6 md:gap-0">
            <div>
              <h1 className="text-3xl font-bold">
                {loading ? <span className="inline-block h-8 w-48 bg-white/10 rounded animate-pulse" /> : <span className="tx-gradient">My Cases</span>}
              </h1>
              <p className="text-gray-400 mt-2">
                {loading ? <span className="inline-block h-4 w-64 bg-white/5 rounded animate-pulse" /> : 'Manage and track all submitted cases'}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {loading ? (
                <>
                  <span className="h-10 w-32 bg-white/10 rounded animate-pulse" />
                  <span className="h-10 w-40 bg-white/10 rounded animate-pulse" />
                  <span className="h-10 w-12 bg-white/10 rounded animate-pulse" />
                </>
              ) : (
                <>
                  <Link 
                    href="/clinic/dashboard"
                    className="btn-ghost px-4 py-2 hover:bg-white/5"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/clinic/upload-case"
                    className="btn-gradient px-4 py-2"
                  >
                    + Upload New Case
                  </Link>
                  <LogoutButton />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="glass-card p-6 mb-6">
          {loading ? (
            <div className="flex flex-col md:flex-row gap-4 animate-pulse">
              <div className="flex-1 h-10 bg-white/10 rounded" />
              <div className="h-10 w-52 bg-white/10 rounded" />
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search cases by title or tooth number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full input-dark rounded-md px-3 py-2"
                />
              </div>
              <div>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="input-dark rounded-md px-3 py-2"
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
          )}
        </div>

        {/* Cases List */}
        <div className="glass-card">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-lg font-medium text-gray-100 flex items-center gap-2">
              <span>Cases</span>
              {loading ? (
                <span className="inline-block h-5 w-10 bg-white/10 rounded animate-pulse" />
              ) : (
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300">{filteredCases.length}</span>
              )}
            </h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="space-y-4 animate-pulse">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="rounded-lg p-4 border border-white/10 bg-white/5">
                    <div className="h-4 w-40 bg-white/10 rounded mb-3" />
                    <div className="space-y-2">
                      <div className="h-3 w-64 bg-white/10 rounded" />
                      <div className="h-3 w-56 bg-white/10 rounded" />
                      <div className="h-3 w-48 bg-white/10 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredCases.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">No cases found</p>
                <Link href="/clinic/upload-case" className="btn-gradient px-4 py-2 inline-flex">
                  Upload Your First Case
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCases.map((caseItem) => (
                  <div key={caseItem.id} className="rounded-lg p-4 border border-white/10 bg-white/5 hover:bg-white/10 transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-medium text-gray-100">{caseItem.title}</h3>
                          <StatusBadge status={caseItem.status} size="sm" />
                        </div>
                        <div className="text-sm text-gray-300 space-y-1">
                          <p><span className="text-gray-400">Tooth:</span> {caseItem.toothNumber}</p>
                          <p><span className="text-gray-400">Created:</span> {new Date(caseItem.createdAt).toLocaleDateString()}</p>
                          {caseItem.lab && (
                            <p><span className="text-gray-400">Lab:</span> {caseItem.lab.name}</p>
                          )}
                          {caseItem.description && (
                            <p><span className="text-gray-400">Description:</span> {caseItem.description}</p>
                          )}
                          <p><span className="text-gray-400">Files:</span> {caseItem.files?.length || 0} uploaded</p>
                          {caseItem.messageCount > 0 && (
                            <p><span className="text-gray-400">Messages:</span> {caseItem.messageCount}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {canCancelCase(caseItem.status) && (
                          <button
                            onClick={() => handleCancelCase(caseItem.id)}
                            className="px-3 py-1 rounded text-sm border border-red-400/40 text-red-300 hover:bg-red-500/15 hover:border-red-400/60 focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                        <Link
                          href={`/clinic/cases/${caseItem.id}`}
                          className="btn-ghost px-3 py-1 text-sm hover:bg-white/10"
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