'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CLINIC'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect to smart dashboard
        router.push('/dashboard');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md glass-card p-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight">
            <span className="tx-gradient">Create your i-Dentity account</span>
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Join the dental collaboration platform
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="border border-red-400/40 bg-red-900/20 text-red-200 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs uppercase tracking-wide text-gray-400 mb-1">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="input-dark w-full px-3 py-2"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs uppercase tracking-wide text-gray-400 mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="input-dark w-full px-3 py-2"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-xs uppercase tracking-wide text-gray-400 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="input-dark w-full px-3 py-2"
                placeholder="Min 6 characters"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-xs uppercase tracking-wide text-gray-400 mb-1">
                I am a
              </label>
              <select
                id="role"
                name="role"
                required
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="input-dark w-full px-3 py-2"
              >
                <option value="CLINIC">Dental Clinic</option>
                <option value="LAB">Dental Laboratory</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="btn-gradient w-full py-2.5 text-sm font-medium disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
            <a href="/login" className="block text-center text-sm text-indigo-300 hover:text-indigo-200">
              Already have an account? Sign in
            </a>
          </div>
        </form>
      </div>
    </div>
  );
} 