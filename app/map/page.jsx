'use client';

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import MapSearch from '../../components/MapSearch';
import Link from 'next/link';

const Map = dynamic(() => import('../../components/Map'), { ssr: false });

export default function MapPage() {
  const [markers, setMarkers] = useState([]);
  const [center, setCenter] = useState([20.5937, 78.9629]); // India default
  const [zoom, setZoom] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMarkers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/map/locations', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error('Failed to load locations');
      }
      const json = await res.json();
      setMarkers(json.markers || []);
    } catch (e) {
      setError(e.message || 'Unable to load map data');
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

  const clinicCount = markers.filter(m => m.type === 'clinic').length;
  const labCount = markers.filter(m => m.type === 'lab').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold"><span className="tx-gradient">Network Map</span></h1>
          <p className="mt-2 text-sm text-gray-400 max-w-xl leading-relaxed">
            Explore geographic distribution of connected clinics & labs. Use search to jump to a location and click markers for quick info.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <MapSearch onLocate={handleLocate} />
          <button
            onClick={fetchMarkers}
            disabled={loading}
            className="btn-ghost px-4 py-2 rounded-md border border-white/10 hover:bg-white/5 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <span className="h-4 w-4 border-2 border-white/30 border-t-white/80 rounded-full animate-spin" />}
            Refresh
          </button>
          <Link href="/clinic/dashboard" className="btn-gradient px-4 py-2 text-sm">Dashboard</Link>
        </div>
      </div>

      <div className="glass-card rounded-xl overflow-hidden relative">
        {/* Map Container */}
        <div className="relative h-[560px]">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-950/60 via-slate-900/60 to-indigo-950/60 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 rounded-full border-2 border-indigo-400/30 border-t-indigo-500 animate-spin" />
                <p className="text-xs tracking-wide text-gray-400">Loading map data…</p>
              </div>
            </div>
          )}
          {!loading && error && (
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="text-center max-w-sm">
                <p className="text-rose-300 font-medium mb-2">{error}</p>
                <p className="text-xs text-gray-500 mb-4">Check your connection or try refreshing.</p>
                <button onClick={fetchMarkers} className="btn-gradient px-4 py-2 text-sm">Retry</button>
              </div>
            </div>
          )}
          {!loading && !error && markers.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm text-gray-500">No locations available yet.</p>
            </div>
          )}
          {/* Render Map under overlays */}
          <div className={`${loading ? 'opacity-0 pointer-events-none' : 'opacity-100'} transition-opacity h-full`} aria-label="Interactive network map">
            <Map markers={markers} center={center} zoom={zoom} />
          </div>

          {/* Legend / Stats Overlay */}
            <div className="absolute top-4 right-4 flex flex-col gap-3 z-[400]">
              <div className="px-4 py-3 rounded-lg bg-slate-900/70 backdrop-blur border border-white/10 min-w-[200px]">
                <h3 className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-2">Coverage</h3>
                <div className="flex items-center justify-between text-[11px] text-gray-300 mb-1">
                  <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-indigo-400" /> Clinics</span>
                  <span className="font-medium text-gray-200">{clinicCount}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-300 mb-3">
                  <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Labs</span>
                  <span className="font-medium text-gray-200">{labCount}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-500 border-t border-white/10 pt-2">
                  <span>{markers.length} total markers</span>
                  <button
                    onClick={fetchMarkers}
                    disabled={loading}
                    className="text-indigo-300 hover:text-indigo-200 disabled:opacity-40 disabled:pointer-events-none"
                  >
                    {loading ? '…' : 'Update'}
                  </button>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
}
