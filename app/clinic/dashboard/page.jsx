'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import LogoutButton from '../../../components/LogoutButton';
import StatWidget from '../../../components/StatWidget';
import CaseSummaryCard from '../../../components/CaseSummaryCard';
import FavoriteLabsList from '../../../components/FavoriteLabsList';

export default function ClinicDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    fetchDashboardData(token);
  }, []);

  const fetchDashboardData = async (token) => {
    try {
      const response = await fetch('/api/clinic/dashboard', {
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
        console.error('Dashboard API error:', response.status, errorText);
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error loading dashboard. Please try refreshing the page.');
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteChange = () => {
    // Refresh dashboard data when favorites change
    const token = localStorage.getItem('token');
    if (token) {
      fetchDashboardData(token);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load dashboard data</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { clinic, stats, recentCases, favoriteLabs, recommendedLabs, recentMessages } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Clinic Dashboard</h1>
              <p className="text-gray-600">Welcome back, {clinic.name}</p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/clinic/upload-case"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                + New Case
              </Link>
              <Link
                href="/clinic/cases"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                View All Cases
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatWidget
            title="Total Cases"
            value={stats.totalCases}
            subtitle="All time"
            icon="📋"
            color="blue"
          />
          <StatWidget
            title="Active Cases"
            value={stats.activeCases}
            subtitle="In progress"
            icon="⚡"
            color="yellow"
          />
          <StatWidget
            title="Completed Cases"
            value={stats.completedCases}
            subtitle="Delivered"
            icon="✅"
            color="green"
          />
          <StatWidget
            title="Favorite Labs"
            value={favoriteLabs.length}
            subtitle="Saved labs"
            icon="⭐"
            color="purple"
          />
        </div>

        {/* Status Breakdown */}
        {stats.statusBreakdown && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Case Status Breakdown</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {Object.entries(stats.statusBreakdown).map(([status, count]) => (
                <div key={status} className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-500 capitalize">{status.replace('_', ' ')}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Cases */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Recent Cases</h3>
                <Link
                  href="/clinic/cases"
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  View all →
                </Link>
              </div>
              
              {recentCases && recentCases.length > 0 ? (
                <div className="space-y-4">
                  {recentCases.map((caseData) => (
                    <CaseSummaryCard
                      key={caseData.id}
                      caseData={caseData}
                      userRole="CLINIC"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">📋</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No cases yet</h3>
                  <p className="text-gray-500 mb-4">Get started by creating your first case</p>
                  <Link
                    href="/clinic/upload-case"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Create First Case
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Messages */}
          <div>
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Messages</h3>
              {recentMessages && recentMessages.length > 0 ? (
                <div className="space-y-3">
                  {recentMessages.map((message) => (
                    <div key={message.id} className="border-l-4 border-blue-400 pl-3 py-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{message.senderName}</p>
                          <p className="text-sm text-gray-600 mt-1">{message.content}</p>
                          <Link
                            href={`/clinic/cases/${message.caseId}`}
                            className="text-xs text-indigo-600 hover:text-indigo-500 mt-1 inline-block"
                          >
                            {message.caseTitle} →
                          </Link>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(message.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-2xl mb-2">💬</div>
                  <p className="text-gray-500 text-sm">No recent messages</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/clinic/upload-case"
                  className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  + Create New Case
                </Link>
                <Link
                  href="/clinic/labs"
                  className="block w-full text-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Browse Labs
                </Link>
                <Link
                  href="/clinic/cases"
                  className="block w-full text-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  View All Cases
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Favorite & Recommended Labs */}
        <div className="mt-8">
          <FavoriteLabsList
            favoriteLabs={favoriteLabs}
            recommendedLabs={recommendedLabs}
            onFavoriteChange={handleFavoriteChange}
          />
        </div>
      </div>
    </div>
  );
} 