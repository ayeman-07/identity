'use client';

import { useState } from 'react';

export default function MapSearch({ onLocate }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/map/geocode?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data && data.result) {
        const { latitude, longitude, displayName } = data.result;
        if (typeof latitude === 'number' && typeof longitude === 'number') {
          onLocate?.({ latitude, longitude, displayName });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <input
        className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
        type="text"
        placeholder="Search location (city, area, address)..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 rounded-md bg-indigo-600 text-white disabled:opacity-60"
      >
        {loading ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
}
