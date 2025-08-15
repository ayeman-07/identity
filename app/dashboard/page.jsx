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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        <div className="glass-card px-8 py-7 rounded-xl flex flex-col items-center border border-white/10 w-full max-w-md">
          <div className="h-12 w-12 rounded-full border-2 border-indigo-400/30 border-t-indigo-500 animate-spin mb-5" />
          <h2 className="text-lg font-semibold bg-gradient-to-r from-indigo-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
            Preparing your dashboard
          </h2>
          <p className="mt-2 text-xs tracking-wide uppercase text-slate-500">Role detection</p>
          <div className="mt-6 w-full space-y-2">
            <div className="h-2 w-full bg-white/5 rounded overflow-hidden">
              <div className="h-full w-1/2 bg-gradient-to-r from-indigo-500/0 via-indigo-400/60 to-indigo-500/0 animate-[progressSlide_2s_linear_infinite]" />
            </div>
            <div className="flex gap-2">
              {[40,56,32].map((w,i)=>(<div key={i} className={`h-3 rounded bg-white/5 animate-pulse`} style={{width:w}} />))}
            </div>
          </div>
        </div>
        <style jsx>{`
          @keyframes progressSlide { 0% { transform: translateX(-60%);} 100% { transform: translateX(110%);} }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        <div className="glass-card px-8 py-7 rounded-xl flex flex-col items-center border border-white/10 w-full max-w-md text-center">
          <div className="h-12 w-12 mb-5 rounded-full flex items-center justify-center bg-red-500/10 border border-red-400/40">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
          </div>
          <h2 className="text-lg font-semibold bg-gradient-to-r from-red-300 via-rose-200 to-amber-200 bg-clip-text text-transparent">Error</h2>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">{error || 'An unexpected error occurred while loading your data.'}</p>
          <div className="mt-6 flex gap-3">
            <button onClick={() => window.location.reload()} className="btn-gradient px-5 py-2 rounded-md text-sm font-medium">Retry</button>
            <button onClick={() => router.push('/login')} className="btn-ghost px-5 py-2 rounded-md text-sm font-medium hover:bg-white/5">Login</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <div className="glass-card px-8 py-8 rounded-xl flex flex-col items-center border border-white/10 w-full max-w-md text-center">
        <div className="h-12 w-12 mb-5 rounded-full flex items-center justify-center bg-indigo-500/10 border border-indigo-400/40">
          <svg className="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
        </div>
        <h2 className="text-lg font-semibold bg-gradient-to-r from-indigo-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">Redirecting</h2>
        <p className="mt-2 text-sm text-slate-400 leading-relaxed">Determining the right workspace for you...</p>
        <div className="mt-5 w-full h-2 bg-white/5 rounded overflow-hidden">
          <div className="h-full w-1/3 bg-gradient-to-r from-indigo-500/0 via-indigo-400/70 to-indigo-500/0 animate-[progressSlide_2s_linear_infinite]" />
        </div>
        <p className="mt-6 text-[11px] tracking-wide uppercase text-slate-500">Auto-navigation...</p>
      </div>
      <style jsx>{`
        @keyframes progressSlide { 0% { transform: translateX(-60%);} 100% { transform: translateX(110%);} }
      `}</style>
    </div>
  );
} 