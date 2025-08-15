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

  if (!loading && !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-300 mb-4">Failed to load dashboard data</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-gradient px-4 py-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const clinic = dashboardData?.clinic;
  const stats = dashboardData?.stats || {};
  const recentCases = dashboardData?.recentCases || [];
  const favoriteLabs = dashboardData?.favoriteLabs || [];
  const recommendedLabs = dashboardData?.recommendedLabs || [];
  const recentMessages = dashboardData?.recentMessages || [];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="glass-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold"><span className="tx-gradient">Clinic Dashboard</span></h1>
              <p className="text-gray-400">{loading ? <span className="inline-block h-4 w-40 rounded bg-white/10 animate-pulse" /> : <>Welcome back, {clinic?.name}</>}</p>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/map"
                className="btn-ghost px-4 py-2 hover:bg-emerald-900/20 border-emerald-400/30 text-emerald-200"
              >
                🗺️ Map
              </Link>
              <Link
                href="/clinic/upload-case"
                className="btn-gradient px-4 py-2"
              >
                + New Case
              </Link>
              <Link
                href="/clinic/cases"
                className="btn-ghost px-4 py-2 hover:bg-white/5"
              >
                View All Cases
              </Link>
              <LogoutButton />
              <Link
                href="/clinic/profile"
                className="btn-ghost w-10 h-10 flex items-center justify-center rounded-md hover:bg-white/5 relative"
                aria-label="Profile"
              >
                <svg className="h-5 w-5 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M4 21a8 8 0 0116 0" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="h-4 w-24 bg-white/10 rounded mb-4" />
                <div className="h-8 w-16 bg-white/15 rounded mb-2" />
                <div className="h-3 w-20 bg-white/10 rounded" />
              </div>
            ))
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Status Breakdown */}
        <div className="glass-card p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-100 mb-4">Case Status Breakdown</h3>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 animate-pulse">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="text-center space-y-2">
                  <div className="h-6 w-8 bg-white/15 rounded mx-auto" />
                  <div className="h-3 w-20 bg-white/10 rounded mx-auto" />
                </div>
              ))}
            </div>
          ) : stats.statusBreakdown ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {Object.entries(stats.statusBreakdown).map(([status, count]) => (
                <div key={status} className="text-center">
                  <div className="text-2xl font-bold text-gray-100">{count}</div>
                  <div className="text-sm text-gray-400 capitalize">{status.replace('_', ' ')}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No status data.</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Cases */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-100">Recent Cases</h3>
                <Link
                  href="/clinic/cases"
                  className="text-sm text-indigo-300 hover:text-indigo-200"
                >
                  View all →
                </Link>
              </div>
              
              {loading ? (
                <div className="space-y-4 animate-pulse">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="glass-card p-4 bg-white/5 border border-white/10">
                      <div className="h-4 w-40 bg-white/10 rounded mb-3" />
                      <div className="h-3 w-64 bg-white/10 rounded mb-2" />
                      <div className="h-3 w-24 bg-white/10 rounded" />
                    </div>
                  ))}
                </div>
              ) : recentCases && recentCases.length > 0 ? (
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
                  <h3 className="text-lg font-medium text-gray-100 mb-2">No cases yet</h3>
                  <p className="text-gray-400 mb-4">Get started by creating your first case</p>
                  <Link
                    href="/clinic/upload-case"
                    className="inline-flex items-center text-sm font-medium rounded-md btn-gradient px-4 py-2"
                  >
                    Create First Case
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Messages */}
          <div>
            <div className="glass-card p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-100 mb-4">Recent Messages</h3>
              {loading ? (
                <div className="space-y-3 animate-pulse">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border-l-4 border-transparent pl-3 py-2">
                      <div className="h-3 w-28 bg-white/10 rounded mb-2" />
                      <div className="h-3 w-52 bg-white/10 rounded mb-1" />
                      <div className="h-3 w-24 bg-white/10 rounded" />
                    </div>
                  ))}
                </div>
              ) : recentMessages && recentMessages.length > 0 ? (
                <div className="space-y-3">
                  {recentMessages.map((message) => (
                    <div key={message.id} className="border-l-4 border-blue-400 pl-3 py-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-100">{message.senderName}</p>
                          <p className="text-sm text-gray-300 mt-1">{message.content}</p>
                          <Link
                            href={`/clinic/cases/${message.caseId}`}
                            className="text-xs text-indigo-300 hover:text-indigo-200 mt-1 inline-block"
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
                  <p className="text-gray-400 text-sm">No recent messages</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="glass-card p-6">
              <h3 className="text-lg font-medium text-gray-100 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/clinic/upload-case"
                  className="block w-full text-center text-sm font-medium rounded-md btn-gradient px-4 py-2"
                >
                  + Create New Case
                </Link>
                <Link
                  href="/clinic/labs"
                  className="block w-full text-center text-sm font-medium rounded-md btn-ghost px-4 py-2"
                >
                  Browse Labs
                </Link>
                <Link
                  href="/clinic/cases"
                  className="block w-full text-center text-sm font-medium rounded-md btn-ghost px-4 py-2"
                >
                  View All Cases
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Favorite & Recommended Labs */}
        <div className="mt-8">
          {loading ? (
            <div className="glass-card p-6 animate-pulse">
              <div className="h-5 w-48 bg-white/10 rounded mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-24 bg-white/5 rounded-lg border border-white/10" />
                ))}
              </div>
            </div>
          ) : (
            <FavoriteLabsList
              favoriteLabs={favoriteLabs}
              recommendedLabs={recommendedLabs}
              onFavoriteChange={handleFavoriteChange}
            />
          )}
        </div>
      </div>
    </div>
  );
} 