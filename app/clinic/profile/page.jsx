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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Clinic Profile</h1>
              <p className="text-gray-600">Manage your clinic information</p>
            </div>
            <div className="flex space-x-4">
              <Link 
                href="/clinic/dashboard"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Back to Dashboard
              </Link>
              <LogoutButton />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {message && (
              <div className={`p-4 rounded-lg ${
                message.includes('successfully') 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {message}
              </div>
            )}

            {/* Clinic Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Clinic Name
              </label>
              <input
                type="text"
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({...profile, name: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={profile.email}
                onChange={(e) => setProfile({...profile, email: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <textarea
                id="address"
                rows={3}
                value={profile.address}
                onChange={(e) => setProfile({...profile, address: e.target.value})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Specialties */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Preferred Specialties
              </label>
              <div className="grid grid-cols-2 gap-3">
                {specialtyOptions.map((specialty) => (
                  <label key={specialty} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profile.specialties.includes(specialty)}
                      onChange={() => handleSpecialtyChange(specialty)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{specialty}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 