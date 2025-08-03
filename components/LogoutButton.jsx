'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LogoutButton({ className = '', children = 'Logout' }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      // Call logout API (optional - for server-side cleanup)
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
      
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local storage and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className={`bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 ${className}`}
    >
      {loading ? 'Logging out...' : children}
    </button>
  );
} 