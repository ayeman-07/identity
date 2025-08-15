'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    checkUserRole(token);
  }, []);

  const checkUserRole = async (token) => {
    try {
      const response = await fetch('/api/user/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('User API error:', response.status, errorText);
        setError('Failed to load user data');
        return;
      }

      const data = await response.json();
      const user = data.user;

      // Redirect based on role
      if (user.role === 'CLINIC') {
        if (user.hasClinic) {
          router.push('/clinic/dashboard');
        } else {
          router.push('/clinic/profile');
        }
      } else if (user.role === 'LAB') {
        if (user.hasLab) {
          router.push('/lab/dashboard');
        } else {
          router.push('/lab/profile');
        }
      } else {
        setError('Invalid user role');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      setError('Error loading user data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -left-20 w-80 h-80 bg-indigo-600/20 blur-3xl rounded-full animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-fuchsia-600/10 blur-3xl rounded-full" />
        </div>

        <div className="glass-card relative px-10 py-8 rounded-2xl flex flex-col items-center shadow-xl border border-white/10">
          <div className="relative mb-6">
            <div className="h-14 w-14 rounded-full border-2 border-indigo-400/30 border-t-indigo-500 animate-spin" />
            <div className="absolute inset-0 h-14 w-14 rounded-full animate-ping bg-indigo-500/10" />
          </div>
          <h2 className="text-xl font-semibold bg-gradient-to-r from-indigo-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent tracking-wide">
            Preparing your dashboard
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Redirecting based on your role...
          </p>

          {/* Progress shimmer */}
            <div className="mt-6 w-full">
              <div className="h-2 w-full bg-white/5 rounded overflow-hidden">
                <div className="h-full w-1/3 bg-gradient-to-r from-indigo-500/0 via-indigo-400/70 to-indigo-500/0 animate-[progressSlide_1.8s_ease-in-out_infinite]" />
              </div>
            </div>

          {/* Skeleton hint blocks */}
          <div className="grid grid-cols-3 gap-4 mt-8 w-full">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 bg-white/5 rounded-md animate-pulse" />
            ))}
          </div>
        </div>

        <style jsx>{`
          @keyframes progressSlide { 0% { transform: translateX(-60%); } 50% { transform: translateX(25%); } 100% { transform: translateX(110%); } }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -right-24 w-72 h-72 bg-red-600/20 blur-3xl rounded-full animate-pulse" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 blur-3xl rounded-full" />
        </div>

        <div className="glass-card relative px-10 py-8 rounded-2xl flex flex-col items-center shadow-xl border border-white/10 max-w-lg text-center">
          <div className="relative mb-6">
            <div className="h-16 w-16 rounded-full flex items-center justify-center bg-red-500/10 border border-red-400/40">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <div className="absolute inset-0 rounded-full animate-ping bg-red-500/5" />
          </div>
          <h2 className="text-2xl font-semibold bg-gradient-to-r from-red-300 via-rose-200 to-amber-200 bg-clip-text text-transparent tracking-wide mb-2">Something went wrong</h2>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">{error || 'An unexpected error occurred while loading your data. You can retry below.'}</p>
          <div className="flex flex-wrap gap-4 w-full justify-center">
            <button
              onClick={() => window.location.reload()}
              className="btn-gradient px-6 py-2 rounded-md text-sm font-medium"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/login')}
              className="btn-ghost px-6 py-2 rounded-md text-sm font-medium hover:bg-white/5"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 blur-3xl rounded-full" />
        <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-fuchsia-600/10 blur-3xl rounded-full" />
      </div>
      <div className="glass-card relative px-10 py-10 rounded-2xl flex flex-col items-center shadow-xl border border-white/10 max-w-xl text-center">
        <div className="relative mb-6">
          <div className="h-16 w-16 rounded-full flex items-center justify-center bg-indigo-500/10 border border-indigo-400/40">
            <svg className="w-8 h-8 text-indigo-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div className="absolute inset-0 rounded-full animate-ping bg-indigo-500/5" />
        </div>
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-indigo-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent tracking-wide mb-2">Redirecting</h2>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">We're sending you to the right workspace based on your role. This will only take a moment.</p>
        <div className="mt-2 w-full">
          <div className="h-2 w-full bg-white/5 rounded overflow-hidden">
            <div className="h-full w-1/2 bg-gradient-to-r from-indigo-500/0 via-indigo-400/70 to-indigo-500/0 animate-[progressSlide_2s_ease-in-out_infinite]" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3 mt-8 w-full">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-8 bg-white/5 rounded-md animate-pulse" />
          ))}
        </div>
        <p className="mt-6 text-[11px] tracking-wide uppercase text-slate-500">Auto-navigation in progress...</p>
      </div>
      <style jsx>{`
        @keyframes progressSlide { 0% { transform: translateX(-60%); } 50% { transform: translateX(25%); } 100% { transform: translateX(110%); } }
      `}</style>
    </div>
  );
} 