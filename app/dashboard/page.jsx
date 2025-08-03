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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl mb-4">Loading...</div>
          <div className="text-sm text-gray-600">Redirecting to your dashboard</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-600 mb-4">Error</div>
          <div className="text-sm text-gray-600 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-xl mb-4">Redirecting...</div>
        <div className="text-sm text-gray-600">Please wait while we redirect you to your dashboard</div>
      </div>
    </div>
  );
} 