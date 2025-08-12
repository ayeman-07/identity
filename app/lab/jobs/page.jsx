'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import LogoutButton from '../../../components/LogoutButton';

export default function LabJobs() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, in_progress, completed

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
      const response = await fetch('/api/lab/jobs', {
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
        console.error('Jobs API error:', response.status, errorText);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setCases(data.cases || []);
      } else {
        throw new Error(data.error || 'Failed to fetch jobs');
      }
    } catch (error) {
      console.error('Error fetching cases:', error);
      toast.error('Error loading cases. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = cases.filter(caseItem => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['ACCEPTED', 'IN_PROGRESS', 'READY'].includes(caseItem.status);
    if (filter === 'in_progress') return caseItem.status === 'IN_PROGRESS';
    if (filter === 'completed') return ['DISPATCHED', 'DELIVERED'].includes(caseItem.status);
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading jobs...</p>
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
              <h1 className="text-3xl font-bold"><span className="tx-gradient">My Jobs</span></h1>
              <p className="text-gray-400">Manage your assigned cases</p>
            </div>
            <div className="flex space-x-4">
              <Link href="/lab/dashboard" className="btn-ghost px-4 py-2 hover:bg-white/5">Dashboard</Link>
              <Link href="/lab/incoming" className="btn-gradient px-4 py-2">Incoming Cases</Link>
              <Link href="/lab/jobs/completed" className="btn-ghost px-4 py-2 hover:bg-white/5">Completed Jobs</Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-white/10">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'all', label: 'All Jobs', count: cases.length },
                { key: 'active', label: 'Active', count: cases.filter(c => ['ACCEPTED', 'IN_PROGRESS', 'READY'].includes(c.status)).length },
                { key: 'in_progress', label: 'In Progress', count: cases.filter(c => c.status === 'IN_PROGRESS').length },
                { key: 'completed', label: 'Completed', count: cases.filter(c => ['DISPATCHED', 'DELIVERED'].includes(c.status)).length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    filter === tab.key
                      ? 'border-indigo-400 text-indigo-300'
                      : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-white/20'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Cases List */}
        {filteredCases.length > 0 ? (
          <div className="space-y-4">
            {filteredCases.map((caseItem) => (
              <div key={caseItem.id} className="glass-card p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-100">{caseItem.title}</h3>
                    <p className="text-sm text-gray-300">From: {caseItem.clinic?.name}</p>
                    <p className="text-sm text-gray-300">
                      Received: {new Date(caseItem.createdAt).toLocaleDateString()}
                    </p>
                    {caseItem.description && (
                      <p className="text-sm text-gray-400 mt-2">{caseItem.description}</p>
                    )}
                    <div className="mt-3">
                      <span className="text-sm text-gray-400">Files: </span>
                      <span className="text-sm font-medium text-gray-200">{caseItem.files?.length || 0} uploaded</span>
                      {caseItem.messageCount > 0 && (
                        <>
                          <span className="text-sm text-gray-400 ml-4">Messages: </span>
                          <span className="text-sm font-medium text-gray-200">{caseItem.messageCount}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2 ml-6">
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      caseItem.status === 'ACCEPTED' ? 'bg-blue-500/10 text-blue-200 border border-blue-400/20' :
                      caseItem.status === 'IN_PROGRESS' ? 'bg-yellow-500/10 text-yellow-200 border border-yellow-400/20' :
                      caseItem.status === 'READY' ? 'bg-purple-500/10 text-purple-200 border border-purple-400/20' :
                      caseItem.status === 'DISPATCHED' ? 'bg-indigo-500/10 text-indigo-200 border border-indigo-400/20' :
                      caseItem.status === 'DELIVERED' ? 'bg-green-500/10 text-green-200 border border-green-400/20' :
                      'bg-white/10 text-gray-200 border border-white/20'
                    }`}>
                      {caseItem.status.replace('_', ' ')}
                    </span>
                    <Link 
                      href={`/lab/jobs/${caseItem.id}`}
                      className="btn-ghost px-4 py-2 text-sm hover:bg-white/5"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-100 mb-2">
              {filter === 'all' ? 'No jobs assigned yet' : `No ${filter === 'active' ? 'active' : filter.replace('_', ' ')} jobs`}
            </h3>
            <p className="text-gray-400 mb-6">
              {filter === 'all' 
                ? 'Accept cases from the incoming queue to get started'
                : 'Try changing the filter to see other jobs or accept new cases'
              }
            </p>
            <Link 
              href="/lab/incoming"
              className="btn-gradient px-6 py-3"
            >
              Browse Incoming Cases
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
