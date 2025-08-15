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
  const [currentPage, setCurrentPage] = useState(1);

  const PAGE_SIZE = 5;

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

  // Reset / clamp page when dependencies change
  const totalPages = Math.max(1, Math.ceil(filteredCases.length / PAGE_SIZE));
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchTerm]);
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedCases = filteredCases.slice(startIndex, startIndex + PAGE_SIZE);

  // Remove full-screen return; we'll show inline skeletons below

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="glass-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center py-6 gap-6 md:gap-0">
            <div>
              <h1 className="text-3xl font-bold">
                <span className="tx-gradient">My Cases</span>
              </h1>
              <p className="text-gray-400 mt-2">
                Manage and track all submitted cases
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              
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
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="glass-card p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search cases by title or tooth number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
                className={`w-full input-dark rounded-md px-3 py-2 ${loading ? 'opacity-60 cursor-wait' : ''}`}
              />
              {loading && <span className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-indigo-400/60 animate-pulse" />}
            </div>
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                disabled={loading}
                className={`input-dark rounded-md px-3 py-2 pr-8 ${loading ? 'opacity-60 cursor-wait' : ''}`}
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
              {loading && <span className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-indigo-400/60 animate-pulse" />}
            </div>
          </div>
          {loading && (
            <p className="mt-3 text-[11px] tracking-wide text-gray-500 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" /> Loading cases…
            </p>
          )}
        </div>

        {/* Cases List */}
        <div className="glass-card">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-lg font-medium text-gray-100 flex items-center gap-2">
              <span>Cases</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300 min-w-[2rem] text-center">
                {loading ? '…' : filteredCases.length}
              </span>
            </h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="rounded-lg p-4 border border-white/10 bg-white/5 relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-4 w-40 bg-white/10 rounded" />
                      <div className="h-4 w-14 bg-white/10 rounded" />
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="h-3 w-64 bg-white/10 rounded" />
                      <div className="h-3 w-56 bg-white/10 rounded" />
                      <div className="h-3 w-48 bg-white/10 rounded" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_1.4s_infinite]" style={{backgroundSize:'200% 100%'}} />
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
                {paginatedCases.map((caseItem) => (
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
                {/* Pagination Controls */}
                {filteredCases.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
                    <p className="text-xs text-gray-500 tracking-wide">
                      Showing <span className="text-gray-300">{filteredCases.length === 0 ? 0 : startIndex + 1}</span>–<span className="text-gray-300">{Math.min(startIndex + PAGE_SIZE, filteredCases.length)}</span> of <span className="text-gray-300">{filteredCases.length}</span>
                    </p>
                    {totalPages > 1 && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="px-3 py-1 rounded-md text-xs border border-white/10 text-gray-300 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                        >Prev</button>
                        {Array.from({ length: totalPages }).map((_, i) => {
                          const page = i + 1;
                          const active = page === currentPage;
                          return (
                            <button
                              key={page}
                              type="button"
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 py-1 rounded-md text-xs border transition ${active ? 'border-indigo-400/60 bg-indigo-500/20 text-indigo-200' : 'border-white/10 text-gray-300 hover:bg-white/10'}`}
                            >{page}</button>
                          );
                        })}
                        <button
                          type="button"
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 rounded-md text-xs border border-white/10 text-gray-300 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                        >Next</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 