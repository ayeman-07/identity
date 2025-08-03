

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to <span className="text-indigo-600">i-Dentity</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          — The digital dental collaboration platform.
        </p>
        <div className="space-x-4">
          <a
            href="/login"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors inline-block"
          >
            Sign In
          </a>
          <a
            href="/register"
            className="bg-white text-indigo-600 px-6 py-3 rounded-lg border border-indigo-600 hover:bg-indigo-50 transition-colors inline-block"
          >
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
}
