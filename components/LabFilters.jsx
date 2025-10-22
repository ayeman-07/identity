'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const SPECIALTY_OPTIONS = [
  'crowns',
  'aligners',
  'dentures',
  'implants',
  'bridges',
  'orthodontics',
  'cosmetic',
  'oral_surgery',
  'periodontics',
  'endodontics'
];

const TURNAROUND_OPTIONS = [
  { label: '1-2 days', value: 2 },
  { label: '3-5 days', value: 5 },
  { label: '1 week', value: 7 },
  { label: '2 weeks', value: 14 }
];

const RATING_OPTIONS = [
  { label: '4.5+ stars', value: 4.5 },
  { label: '4.0+ stars', value: 4.0 },
  { label: '3.5+ stars', value: 3.5 },
  { label: '3.0+ stars', value: 3.0 }
];

export default function LabFilters({ filters, onFilterChange }) {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterUpdate = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSpecialtyToggle = (specialty) => {
    const currentSpecialties = localFilters.specialties || [];
    const newSpecialties = currentSpecialties.includes(specialty)
      ? currentSpecialties.filter(s => s !== specialty)
      : [...currentSpecialties, specialty];
    
    handleFilterUpdate('specialties', newSpecialties);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      specialties: [],
      maxTurnaroundTime: null,
      minRating: null,
      location: '',
      search: '',
      maxDistanceKm: null
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = 
    localFilters.specialties?.length > 0 ||
    localFilters.maxTurnaroundTime ||
    localFilters.minRating |    localFilters.location ||
    localFilters.search;

  return (
    <div className="glass-card rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-100">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-indigo-300 hover:text-indigo-100"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Search
          </label>
          <input
            type="text"
            value={localFilters.search || ''}
            onChange={(e) => handleFilterUpdate('search', e.target.value)}
            placeholder="Lab name or location..."
            className="w-full px-3 py-2 input-dark rounded-md"
          />
        </div>

        {/* Specialties */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-3">
            Specialties
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {SPECIALTY_OPTIONS.map(specialty => (
              <label key={specialty} className="flex items-center">
                <input
                  type="checkbox"
                  checked={localFilters.specialties?.includes(specialty) || false}
                  onChange={() => handleSpecialtyToggle(specialty)}
                  className="h-4 w-4 text-indigo-400 focus:ring-indigo-300 border-white/10 rounded"
                />
                <span className="ml-2 text-sm text-gray-300 capitalize">
                  {specialty.replace('_', ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Turnaround Time */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-3">
            Max Turnaround Time
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="turnaround"
                checked={!localFilters.maxTurnaroundTime}
                onChange={() => handleFilterUpdate('maxTurnaroundTime', null)}
                className="h-4 w-4 text-indigo-400 focus:ring-indigo-300 border-white/10"
              />
              <span className="ml-2 text-sm text-gray-300">Any</span>
            </label>
            {TURNAROUND_OPTIONS.map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  name="turnaround"
                  checked={localFilters.maxTurnaroundTime === option.value}
                  onChange={() => handleFilterUpdate('maxTurnaroundTime', option.value)}
                  className="h-4 w-4 text-indigo-400 focus:ring-indigo-300 border-white/10"
                />
                <span className="ml-2 text-sm text-gray-300">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Minimum Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-3">
            Minimum Rating
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="rating"
                checked={!localFilters.minRating}
                onChange={() => handleFilterUpdate('minRating', null)}
                className="h-4 w-4 text-indigo-400 focus:ring-indigo-300 border-white/10"
              />
              <span className="ml-2 text-sm text-gray-300">Any rating</span>
            </label>
            {RATING_OPTIONS.map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="radio"
                  name="rating"
                  checked={localFilters.minRating === option.value}
                  onChange={() => handleFilterUpdate('minRating', option.value)}
                  className="h-4 w-4 text-indigo-400 focus:ring-indigo-300 border-white/10"
                />
                <span className="ml-2 text-sm text-gray-300">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Location
          </label>
          <input
            type="text"
            value={localFilters.location || ''}
            onChange={(e) => handleFilterUpdate('location', e.target.value)}
            placeholder="City, state, or region..."
            className="w-full px-3 py-2 input-dark rounded-md"
          />
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-6 pt-4 border-t border-white/10">
          <h4 className="text-sm font-medium text-gray-200 mb-2">Active Filters:</h4>
          <div className="flex flex-wrap gap-2">
            {localFilters.specialties?.map(specialty => (
              <span
                key={specialty}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/5 text-gray-300"
              >
                {specialty.replace('_', ' ')}
                <button
                  onClick={() => handleSpecialtyToggle(specialty)}
                  className="ml-1 text-indigo-300 hover:text-indigo-100"
                >
                  ×
                </button>
              </span>
            ))}
            {localFilters.maxTurnaroundTime && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/5 text-indigo-200">
                ≤{localFilters.maxTurnaroundTime} days
                <button
                  onClick={() => handleFilterUpdate('maxTurnaroundTime', null)}
                  className="ml-1 text-indigo-300 hover:text-indigo-100"
                >
                  ×
                </button>
              </span>
            )}
            {localFilters.minRating && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/5 text-yellow-200">
                {localFilters.minRating}+ stars
                <button
                  onClick={() => handleFilterUpdate('minRating', null)}
                  className="ml-1 text-yellow-300 hover:text-yellow-100"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
