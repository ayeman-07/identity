'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LogoutButton from '../../../components/LogoutButton';

export default function ClinicProfile() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    specialties: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const specialtyOptions = [
    'General Dentistry',
    'Orthodontics',
    'Endodontics',
    'Periodontics',
    'Oral Surgery',
    'Pediatric Dentistry',
    'Cosmetic Dentistry',
    'Prosthodontics'
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    fetchProfile(token);
  }, []);

  const fetchProfile = async (token) => {
    try {
      const response = await fetch('/api/clinic/profile', {
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

      const data = await response.json();
      setProfile(data.profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/clinic/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profile)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Profile updated successfully!');
      } else {
        setMessage(data.error || 'Failed to update profile');
      }
    } catch (error) {
      setMessage('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSpecialtyChange = (specialty) => {
    setProfile(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }));
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="glass-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between py-6 gap-6 md:gap-0">
            <div>
              <h1 className="text-3xl font-bold"><span className="tx-gradient">Clinic Profile</span></h1>
              <p className="text-gray-400 text-sm md:text-base">Manage and maintain your clinic presence.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/clinic/dashboard" className="btn-ghost px-4 py-2 hover:bg-white/5">Dashboard</Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-lg font-medium text-gray-100 tracking-wide">Profile Information</h2>
            {saving && (
              <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-indigo-300 bg-indigo-500/10 border border-indigo-400/20 px-3 py-1 rounded-full">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                <span>Saving</span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="p-6 space-y-10 animate-pulse">
              <div className="space-y-4">
                <div className="h-4 w-40 bg-white/10 rounded" />
                <div className="h-10 w-full bg-white/5 rounded" />
              </div>
              <div className="space-y-4">
                <div className="h-4 w-24 bg-white/10 rounded" />
                <div className="h-10 w-full bg-white/5 rounded" />
              </div>
              <div className="space-y-4">
                <div className="h-4 w-32 bg-white/10 rounded" />
                <div className="h-10 w-full bg-white/5 rounded" />
              </div>
              <div className="space-y-4">
                <div className="h-4 w-28 bg-white/10 rounded" />
                <div className="h-24 w-full bg-white/5 rounded" />
              </div>
              <div className="space-y-4">
                <div className="h-4 w-48 bg-white/10 rounded" />
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({length:6}).map((_,i)=>(<div key={i} className="h-9 bg-white/5 rounded" />))}
                </div>
              </div>
              <div className="flex justify-end">
                <div className="h-10 w-40 bg-white/5 rounded" />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {message && (
                <div className={`p-4 rounded-md text-xs font-medium border leading-relaxed ${
                  message.includes('successfully')
                    ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-200'
                    : 'bg-rose-500/10 border-rose-400/30 text-rose-200'
                }`}>{message}</div>
              )}

              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Clinic Name <span className="text-rose-400">*</span></label>
                    <input
                      type="text"
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      className="input-dark w-full"
                      required
                      placeholder="e.g., Smile Care Center"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email <span className="text-rose-400">*</span></label>
                    <input
                      type="email"
                      id="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                      className="input-dark w-full"
                      required
                      placeholder="contact@clinic.com"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      className="input-dark w-full"
                      placeholder="+1 555 123 4567"
                    />
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-1">Address</label>
                    <textarea
                      id="address"
                      rows={5}
                      value={profile.address}
                      onChange={(e) => setProfile({...profile, address: e.target.value})}
                      className="input-dark w-full resize-y min-h-[140px]"
                      placeholder="Street, City, State / Region, Country"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">Preferred Specialties</label>
                    <div className="flex flex-wrap gap-2">
                      {specialtyOptions.map(s => {
                        const active = profile.specialties.includes(s);
                        return (
                          <button
                            type="button"
                            key={s}
                            onClick={() => handleSpecialtyChange(s)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium tracking-wide border transition ${active ? 'bg-indigo-500/20 border-indigo-400/40 text-indigo-200 shadow-inner shadow-indigo-400/10' : 'border-white/10 text-gray-300 hover:bg-white/5'}`}
                          >{s}</button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-white/10 flex-wrap gap-4">
                <p className="text-xs text-gray-500">Keep your profile updated so labs can understand your practice focus.</p>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-gradient px-8 py-3 rounded-lg text-sm font-medium tracking-wide flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving && <span className="h-4 w-4 border-2 border-white/30 border-t-white/80 rounded-full animate-spin" />}
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 