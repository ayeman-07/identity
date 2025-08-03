'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

// Components
import LabCard from '../../../components/LabCard';
import LabFilters from '../../../components/LabFilters';

export default function LabDiscovery() {
  const router = useRouter();
  const [labs, setLabs] = useState([]);
  const [filteredLabs, setFilteredLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  
  // Filter states
  const [filters, setFilters] = useState({
    specialties: [],
    maxTurnaroundTime: null,
    minRating: null,
    location: '',
    search: ''
  });

  useEffect(() => {
    checkAuth();
    fetchLabs();
    fetchFavorites();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [labs, filters]);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/user/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        router.push('/login');
        return;
      }

      const userData = await response.json();
      if (userData.user.role !== 'CLINIC') {
        router.push('/dashboard');
        return;
      }

      setUser(userData.user);
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/login');
    }
  };

  const fetchLabs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/labs/discover', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch labs');
      }

      const data = await response.json();
      setLabs(data.labs);
    } catch (error) {
      console.error('Error fetching labs:', error);
      toast.error('Failed to load labs');
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/labs/favorites', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) return;

      const data = await response.json();
      setFavorites(data.favorites.map(fav => fav.lab.id));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const applyFilters = () => {
    let filtered = [...labs];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(lab => 
        lab.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        lab.location?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Specialty filter
    if (filters.specialties.length > 0) {
      filtered = filtered.filter(lab =>
        filters.specialties.some(specialty => lab.specialties.includes(specialty))
      );
    }

    // Turnaround time filter
    if (filters.maxTurnaroundTime) {
      filtered = filtered.filter(lab => lab.turnaroundTime <= filters.maxTurnaroundTime);
    }

    // Rating filter
    if (filters.minRating) {
      filtered = filtered.filter(lab => lab.rating >= filters.minRating);
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(lab =>
        lab.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    setFilteredLabs(filtered);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleToggleFavorite = async (labId) => {
    try {
      const token = localStorage.getItem('token');
      const isFavorite = favorites.includes(labId);

      if (isFavorite) {
        // Remove from favorites
        const response = await fetch(`/api/labs/favorites?labId=${labId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error('Failed to remove from favorites');
        }

        setFavorites(prev => prev.filter(id => id !== labId));
        toast.success('Lab removed from favorites');
      } else {
        // Add to favorites
        const response = await fetch('/api/labs/favorites', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ labId })
        });

        if (!response.ok) {
          throw new Error('Failed to add to favorites');
        }

        setFavorites(prev => [...prev, labId]);
        toast.success('Lab added to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading labs...</p>
        </div>
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
              <h1 className="text-3xl font-bold text-gray-900">Discover Labs</h1>
              <p className="mt-1 text-sm text-gray-500">
                Find the perfect lab partner for your dental cases
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/clinic/dashboard')}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <LabFilters filters={filters} onFilterChange={handleFilterChange} />
          </div>

          {/* Labs Grid */}
          <div className="mt-6 lg:mt-0 lg:col-span-3">
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  {filteredLabs.length} Lab{filteredLabs.length !== 1 ? 's' : ''} Found
                </h2>
                {filters.search && (
                  <p className="text-sm text-gray-500 mt-1">
                    Results for "{filters.search}"
                  </p>
                )}
              </div>
            </div>

            {/* Labs Grid */}
            {filteredLabs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredLabs.map(lab => (
                  <LabCard
                    key={lab.id}
                    lab={lab}
                    isFavorite={favorites.includes(lab.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onSendCase={() => router.push(`/clinic/upload-case?labId=${lab.id}`)}
                    onViewProfile={() => router.push(`/clinic/labs/${lab.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No labs found</h3>
                <p className="text-gray-500 mb-4">
                  Try adjusting your filters to see more results
                </p>
                <button
                  onClick={() => setFilters({
                    specialties: [],
                    maxTurnaroundTime: null,
                    minRating: null,
                    location: '',
                    search: ''
                  })}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
