'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import MapSearch from '../../components/MapSearch';

const Map = dynamic(() => import('../../components/Map'), { ssr: false });

export default function MapPage() {
  const [markers, setMarkers] = useState([]);
  const [center, setCenter] = useState([20.5937, 78.9629]); // India
  const [zoom, setZoom] = useState(5);
  const [loading, setLoading] = useState(true);

  const fetchMarkers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/map/locations', { cache: 'no-store' });
      const json = await res.json();
      setMarkers(json.markers || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarkers();
  }, [fetchMarkers]);

  const handleLocate = ({ latitude, longitude }) => {
    setCenter([latitude, longitude]);
    setZoom(11);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Map</h1>
        <MapSearch onLocate={handleLocate} />
      </div>

      {loading ? (
        <div className="text-gray-600">Loading map...</div>
      ) : (
        <Map markers={markers} center={center} zoom={zoom} />
      )}
    </div>
  );
}
