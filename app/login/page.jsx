'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [mode, setMode] = useState('login'); // login | request | reset
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();

  const resetFeedback = () => { setError(''); setMessage(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode !== 'login') return; // safety
    setLoading(true); resetFeedback();
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true); resetFeedback();
    try {
      const res = await fetch('/api/auth/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await res.json();
      if (!res.ok && data.error) setError(data.error);
      else {
        setMessage('If the email exists, a code was sent. Enter it below.');
        setMode('reset');
      }
    } catch (err) {
      setError('Failed to request reset.');
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    resetFeedback();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp, newPassword })
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Reset failed');
      else {
        setMessage('Password reset successful. You can sign in now.');
        // Clear sensitive fields
        setOtp(''); setNewPassword(''); setConfirmPassword('');
        setMode('login');
      }
    } catch (err) {
      setError('Network error. Try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md glass-card p-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight">
            <span className="tx-gradient">Sign in to i-Dentity</span>
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Access your dental collaboration platform
          </p>
        </div>

        {error && (
          <div className="mt-6 border border-red-400/40 bg-red-900/20 text-red-200 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}
        {message && (
          <div className="mt-6 border border-emerald-400/40 bg-emerald-900/20 text-emerald-200 px-4 py-3 rounded-md text-sm">
            {message}
          </div>
        )}

        {mode === 'login' && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs uppercase tracking-wide text-gray-400 mb-1">Email address</label>
                <input id="email" name="email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-dark w-full px-3 py-2" placeholder="you@example.com" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-xs uppercase tracking-wide text-gray-400">Password</label>
                  <button type="button" onClick={() => { setMode('request'); resetFeedback(); }} className="text-xs text-indigo-300 hover:text-indigo-200 focus:outline-none">
                    Forgot?
                  </button>
                </div>
                <input id="password" name="password" type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input-dark w-full px-3 py-2" placeholder="Your password" />
              </div>
            </div>
            <div className="space-y-3">
              <button type="submit" disabled={loading} className="btn-gradient w-full py-2.5 text-sm font-medium disabled:opacity-60">
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
              <a href="/register" className="block text-center text-sm text-indigo-300 hover:text-indigo-200">Don’t have an account? Sign up</a>
            </div>
          </form>
        )}

        {mode === 'request' && (
          <form className="mt-8 space-y-6" onSubmit={handleRequestReset}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wide text-gray-400 mb-1">Account Email</label>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-dark w-full px-3 py-2" placeholder="you@example.com" />
                <p className="mt-2 text-xs text-gray-500">We’ll send a 6‑digit code if the email exists.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => { setMode('login'); resetFeedback(); }} className="flex-1 py-2.5 rounded-md bg-gray-700/40 hover:bg-gray-700/60 text-sm">Back</button>
              <button type="submit" disabled={loading || !formData.email} className="flex-1 btn-gradient py-2.5 text-sm font-medium disabled:opacity-60">{loading ? 'Sending...' : 'Send Code'}</button>
            </div>
          </form>
        )}

        {mode === 'reset' && (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wide text-gray-400 mb-1">Email</label>
                <input disabled value={formData.email} className="input-dark w-full px-3 py-2 opacity-70" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wide text-gray-400 mb-1">6‑Digit Code</label>
                <input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required value={otp} onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g,''))} className="input-dark w-full px-3 py-2 tracking-widest text-center text-lg" placeholder="000000" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wide text-gray-400 mb-1">New Password</label>
                <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input-dark w-full px-3 py-2" placeholder="New password" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wide text-gray-400 mb-1">Confirm Password</label>
                <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-dark w-full px-3 py-2" placeholder="Repeat new password" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => { setMode('request'); resetFeedback(); setOtp(''); }} className="flex-1 py-2.5 rounded-md bg-gray-700/40 hover:bg-gray-700/60 text-sm">Back</button>
              <button type="submit" disabled={loading || otp.length !== 6} className="flex-1 btn-gradient py-2.5 text-sm font-medium disabled:opacity-60">{loading ? 'Resetting...' : 'Reset Password'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 