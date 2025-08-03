'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LogoutButton from '../../../components/LogoutButton';

export default function LabProfile() {
  const [profile, setProfile] = useState({
    name: '',
    services: [],
    turnaroundTime: 7,
    location: '',
    logo: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const serviceOptions = [
    'Crowns',
    'Bridges',
    'Veneers',
    'Dental Implants',
    'Dentures',
    'Aligners',
    'Retainers',
    'Night Guards',
    'Sports Guards',
    'Temporary Crowns',
    'Zirconia Crowns',
    'Porcelain Crowns'
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
      const response = await fetch('/api/lab/profile', {
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
      const response = await fetch('/api/lab/profile', {
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

  const handleServiceChange = (service) => {
    setProfile(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // For now, just store the file name
      // In production, you'd upload to a service like AWS S3
      setProfile(prev => ({
        ...prev,
        logo: file.name
      }));
    }
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
              <h1 className="text-3xl font-bold text-gray-900">Lab Profile</h1>
              <p className="text-gray-600">Manage your lab information</p>
            </div>
            <div className="flex space-x-4">
              <Link 
                href="/lab/dashboard"
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

            {/* Lab Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Lab Name
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

            {/* Services Offered */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Services Offered
              </label>
              <div className="grid grid-cols-2 gap-3">
                {serviceOptions.map((service) => (
                  <label key={service} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={profile.services.includes(service)}
                      onChange={() => handleServiceChange(service)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{service}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Turnaround Time */}
            <div>
              <label htmlFor="turnaroundTime" className="block text-sm font-medium text-gray-700">
                Average Turnaround Time (days)
              </label>
              <input
                type="number"
                id="turnaroundTime"
                min="1"
                max="30"
                value={profile.turnaroundTime}
                onChange={(e) => setProfile({...profile, turnaroundTime: parseInt(e.target.value)})}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location (City, State, ZIP)
              </label>
              <input
                type="text"
                id="location"
                value={profile.location}
                onChange={(e) => setProfile({...profile, location: e.target.value})}
                placeholder="e.g., New York, NY 10001"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Logo Upload */}
            <div>
              <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
                Lab Logo
              </label>
              <input
                type="file"
                id="logo"
                accept="image/*"
                onChange={handleLogoUpload}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {profile.logo && (
                <p className="mt-1 text-sm text-gray-500">Selected: {profile.logo}</p>
              )}
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