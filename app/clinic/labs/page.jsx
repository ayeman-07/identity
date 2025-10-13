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
  const [geoSupported, setGeoSupported] = useState(true);
  const [userLocation, setUserLocation] = useState(null); // {lat, lng}
  
  // Filter states
  const [filters, setFilters] = useState({
    specialties: [],
    maxTurnaroundTime: null,
    minRating: null,
    location: '',
    search: '',
    maxDistanceKm: null // numeric km radius
  });

  useEffect(() => {
    checkAuth();
    fetchLabs();
    fetchFavorites();
  getBrowserLocation();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [labs, filters, userLocation]);

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
      const response = await fetch('/api/labs', {
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
    let filtered = Array.isArray(labs) ? [...labs] : [];

    // Search filter
    if (filters?.search) {
      const q = String(filters.search).toLowerCase();
      filtered = filtered.filter(lab => {
        const name = String(lab.name || '').toLowerCase();
        const loc = String(lab.location || '').toLowerCase();
        return name.includes(q) || loc.includes(q);
      });
    }

    // Specialty filter
    if (filters?.specialties && filters.specialties.length > 0) {
      filtered = filtered.filter(lab => {
        const labSpecs = Array.isArray(lab.specialties) ? lab.specialties.map(s => String(s).toLowerCase()) : [];
        return filters.specialties.some(specialty => labSpecs.includes(String(specialty).toLowerCase()));
      });
    }

    // Turnaround time filter
    if (filters?.maxTurnaroundTime != null) {
      const maxT = Number(filters.maxTurnaroundTime);
      filtered = filtered.filter(lab => {
        if (lab.turnaroundTime == null) return false;
        return Number(lab.turnaroundTime) <= maxT;
      });
    }

    // Rating filter (use averageRating fallback)
    if (filters?.minRating != null) {
      const minR = Number(filters.minRating);
      filtered = filtered.filter(lab => {
        const labRating = (lab.averageRating != null) ? Number(lab.averageRating) : (lab.rating != null ? Number(lab.rating) : 0);
        return labRating >= minR;
      });
    }

    // Location filter
    if (filters?.location) {
      const q = String(filters.location).toLowerCase();
      filtered = filtered.filter(lab => String(lab.location || '').toLowerCase().includes(q));
    }

    // Distance filter (requires userLocation & lab coords)
    if (userLocation) {
      filtered = filtered.map(lab => {
        if (lab.latitude != null && lab.longitude != null) {
          const d = haversineDistance(userLocation.lat, userLocation.lng, lab.latitude, lab.longitude);
          return { ...lab, _distanceKm: d };
        }
        return { ...lab, _distanceKm: null };
      });

      if (filters?.maxDistanceKm != null) {
        const maxD = Number(filters.maxDistanceKm);
        filtered = filtered.filter(lab => lab._distanceKm != null && Number(lab._distanceKm) <= maxD);
      }

      // Sort by distance first if available
      filtered.sort((a,b) => {
        if (a._distanceKm == null && b._distanceKm == null) return 0;
        if (a._distanceKm == null) return 1;
        if (b._distanceKm == null) return -1;
        return a._distanceKm - b._distanceKm;
      });
    }

    setFilteredLabs(filtered);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const getBrowserLocation = () => {
    if (!navigator.geolocation) {
      setGeoSupported(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        console.warn('Geolocation denied or failed', err);
        setGeoSupported(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Haversine distance in km
  const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const toRad = (v) => (v * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return +(R * c).toFixed(1);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card px-8 py-7 rounded-xl flex flex-col items-center border border-white/10 w-full max-w-md text-center">
          <div className="h-12 w-12 rounded-full border-2 border-indigo-400/30 border-t-indigo-500 animate-spin mb-5" />
          <h2 className="text-lg font-semibold bg-gradient-to-r from-indigo-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">Loading labs</h2>
          <p className="mt-2 text-xs tracking-wide text-gray-400">Fetching nearby labs and your favorites…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="glass-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold">
                <span className="tx-gradient">Discover Labs</span>
              </h1>
              <p className="mt-1 text-sm text-gray-400">
                Find the perfect lab partner for your dental cases
              </p>
              {userLocation && (
                <p className="mt-2 text-xs text-gray-400">Location detected. Labs sorted by proximity.</p>
              )}
              {!geoSupported && (
                <p className="mt-2 text-xs text-rose-500">Geolocation unavailable. Distance filter disabled.</p>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/clinic/dashboard')}
                className="btn-ghost px-4 py-2 cursor-pointer"
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
          <div className="lg:col-span-1 space-y-4">
            <LabFilters filters={filters} onFilterChange={handleFilterChange} />
            <div className="glass-card p-4">
              <h4 className="text-sm font-medium text-gray-100 mb-3 flex items-center justify-between">
                Distance
                {userLocation && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">GPS</span>
                )}
              </h4>
              {!userLocation && geoSupported && (
                <button onClick={getBrowserLocation} className="text-xs text-indigo-300 hover:text-indigo-100 underline">Enable location</button>
              )}
              {userLocation && (
                <div className="mt-1">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>{filters.maxDistanceKm ? `≤ ${filters.maxDistanceKm} km` : 'Any distance'}</span>
                    {filters.maxDistanceKm && (
                      <button
                        type="button"
                        onClick={() => handleFilterChange({ ...filters, maxDistanceKm: null })}
                        className="text-indigo-300 hover:text-indigo-100"
                      >Reset</button>
                    )}
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={200}
                    step={5}
                    value={filters.maxDistanceKm ?? 0}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      handleFilterChange({ ...filters, maxDistanceKm: val === 0 ? null : val });
                    }}
                    className="w-full accent-indigo-500"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                    <span>0</span>
                    <span>50</span>
                    <span>100</span>
                    <span>150</span>
                    <span>200km</span>
                  </div>
                </div>
              )}
              {!geoSupported && (
                <p className="text-xs text-gray-500">Enable location permissions in your browser to filter by distance.</p>
              )}
            </div>
          </div>

          {/* Labs Grid */}
          <div className="mt-6 lg:mt-0 lg:col-span-3">
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-medium text-gray-100">
                  {filteredLabs.length} Lab{filteredLabs.length !== 1 ? 's' : ''} Found
                </h2>
                {filters.search && (
                  <p className="text-sm text-gray-400 mt-1">
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
          distanceKm={lab._distanceKm}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-100 mb-2">No labs found</h3>
                <p className="text-gray-400 mb-4">
                  Try adjusting your filters to see more results
                </p>
                <button
                  onClick={() => setFilters({
                    specialties: [],
                    maxTurnaroundTime: null,
                    minRating: null,
                    location: '',
                      search: '',
                      maxDistanceKm: null
                  })}
                  className="btn-gradient px-4 py-2"
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
