'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LogoutButton from '../../../../components/LogoutButton';

export default function LabCompletedJobs() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalCases: 0,
    averageEarnings: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    fetchCompletedJobs(token);
  }, []);

  const fetchCompletedJobs = async (token) => {
    try {
      // For now, we'll use mock data
      // In production, you'd fetch from a specific endpoint
      const mockCases = [
        {
          id: '1',
          title: 'Crown Case #001',
          toothNumber: '14',
          caseNotes: 'Patient needs crown for tooth 14',
          clinic: { name: 'Dr. Smith Dental Clinic' },
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date().toISOString(),
          status: 'DELIVERED',
          earnings: 150
        },
        {
          id: '2',
          title: 'Aligners Case #002',
          toothNumber: 'Multiple',
          caseNotes: 'Full arch aligners for patient',
          clinic: { name: 'Johnson Orthodontics' },
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'DELIVERED',
          earnings: 300
        },
        {
          id: '3',
          title: 'Veneer Case #003',
          toothNumber: '8, 9',
          caseNotes: 'Porcelain veneers for front teeth',
          clinic: { name: 'Cosmetic Dental Studio' },
          createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'DELIVERED',
          earnings: 250
        }
      ];

      setCases(mockCases);
      
      // Calculate stats
      const totalEarnings = mockCases.reduce((sum, c) => sum + c.earnings, 0);
      const totalCases = mockCases.length;
      const averageEarnings = totalCases > 0 ? totalEarnings / totalCases : 0;
      
      setStats({
        totalEarnings,
        totalCases,
        averageEarnings: Math.round(averageEarnings)
      });
    } catch (error) {
      console.error('Error fetching completed jobs:', error);
    } finally {
      setLoading(false);
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
              <h1 className="text-3xl font-bold text-gray-900">Completed Jobs</h1>
              <p className="text-gray-600">View your delivered cases and earnings</p>
            </div>
            <div className="flex space-x-4">
              <Link 
                href="/lab/dashboard"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                href="/lab/incoming"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Incoming Cases
              </Link>
              <Link 
                href="/lab/jobs"
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Active Jobs
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-semibold text-gray-900">${stats.totalEarnings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Cases</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalCases}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average per Case</p>
                <p className="text-2xl font-semibold text-gray-900">${stats.averageEarnings}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Completed Cases List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Delivered Cases ({cases.length})
            </h2>
          </div>
          
          <div className="p-6">
            {cases.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No completed cases yet</p>
                <p className="text-sm text-gray-400">Completed cases will appear here once delivered</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cases.map((caseItem) => (
                  <div key={caseItem.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-medium text-gray-900">{caseItem.title}</h3>
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            DELIVERED
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <p><strong>Clinic:</strong> {caseItem.clinic.name}</p>
                            <p><strong>Tooth:</strong> {caseItem.toothNumber}</p>
                            <p><strong>Started:</strong> {new Date(caseItem.createdAt).toLocaleDateString()}</p>
                            <p><strong>Delivered:</strong> {new Date(caseItem.completedAt).toLocaleDateString()}</p>
                          </div>
                          <div>
                            {caseItem.caseNotes && (
                              <p><strong>Notes:</strong> {caseItem.caseNotes}</p>
                            )}
                            <p><strong>Earnings:</strong> <span className="font-semibold text-green-600">${caseItem.earnings}</span></p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <Link
                          href={`/lab/jobs/${caseItem.id}`}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          View Details
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