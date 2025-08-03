'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import LogoutButton from '../../../components/LogoutButton';
import StatWidget from '../../../components/StatWidget';
import CaseSummaryCard from '../../../components/CaseSummaryCard';
import RevenueWidget from '../../../components/RevenueWidget';

export default function LabDashboard() {
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
      const response = await fetch('/api/lab/dashboard', {
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

  const { lab, stats, activeJobs, incomingCases, recentEarnings, recentReviews, recentMessages } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Lab Dashboard</h1>
              <p className="text-gray-600">Welcome back, {lab.name}</p>
              {lab.rating > 0 && (
                <div className="flex items-center mt-1">
                  <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm text-gray-600">{lab.rating.toFixed(1)} rating</span>
                </div>
              )}
            </div>
            <div className="flex space-x-4">
              <Link
                href="/lab/incoming"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Incoming Cases
              </Link>
              <Link
                href="/lab/jobs"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Active Jobs
              </Link>
              <Link
                href="/lab/profile"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Profile
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatWidget
            title="Total Jobs"
            value={stats.totalJobs}
            subtitle="All time"
            icon="🔨"
            color="blue"
          />
          <StatWidget
            title="Pending"
            value={stats.pendingJobs}
            subtitle="Available to accept"
            icon="⏳"
            color="yellow"
          />
          <StatWidget
            title="In Progress"
            value={stats.inProgressJobs}
            subtitle="Active work"
            icon="⚡"
            color="purple"
          />
          <StatWidget
            title="Completed"
            value={stats.completedJobs}
            subtitle="Delivered"
            icon="✅"
            color="green"
          />
          <StatWidget
            title="Avg. Turnaround"
            value={`${stats.averageTurnaroundDays || 0}d`}
            subtitle="Days to complete"
            icon="📊"
            color="indigo"
          />
        </div>

        {/* Status Breakdown */}
        {stats.statusBreakdown && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Job Status Overview</h3>
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
          {/* Active Jobs */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Active Jobs</h3>
                <Link
                  href="/lab/jobs"
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  View all →
                </Link>
              </div>
              
              {activeJobs && activeJobs.length > 0 ? (
                <div className="space-y-4">
                  {activeJobs.map((job) => (
                    <CaseSummaryCard
                      key={job.id}
                      caseData={job}
                      userRole="LAB"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🔨</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No active jobs</h3>
                  <p className="text-gray-500 mb-4">Check incoming cases to find new work</p>
                  <Link
                    href="/lab/incoming"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Browse Incoming Cases
                  </Link>
                </div>
              )}
            </div>

            {/* Incoming Cases Preview */}
            {incomingCases && incomingCases.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Available Cases</h3>
                  <Link
                    href="/lab/incoming"
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    View all →
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {incomingCases.slice(0, 3).map((caseData) => (
                    <div key={caseData.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">{caseData.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">From {caseData.clinicName}</p>
                          <p className="text-xs text-gray-500">
                            Posted {new Date(caseData.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Link
                          href={`/lab/incoming/${caseData.id}`}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Revenue Widget */}
            <RevenueWidget
              totalEarnings={stats.totalEarnings || 0}
              recentEarnings={recentEarnings || []}
            />

            {/* Recent Messages */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Messages</h3>
              {recentMessages && recentMessages.length > 0 ? (
                <div className="space-y-3">
                  {recentMessages.map((message) => (
                    <div key={message.id} className="border-l-4 border-green-400 pl-3 py-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{message.senderName}</p>
                          <p className="text-sm text-gray-600 mt-1">{message.content}</p>
                          <Link
                            href={`/lab/jobs/${message.caseId}`}
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

            {/* Reviews Summary */}
            {recentReviews && recentReviews.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Reviews</h3>
                <div className="space-y-3">
                  {recentReviews.map((review) => (
                    <div key={review.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-yellow-500' : 'text-gray-300'
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500 ml-2">
                          {new Date(review.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-600">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/lab/incoming"
                  className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Browse New Cases
                </Link>
                <Link
                  href="/lab/jobs"
                  className="block w-full text-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  View Active Jobs
                </Link>
                <Link
                  href="/lab/jobs/completed"
                  className="block w-full text-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Completed Jobs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}