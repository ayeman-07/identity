'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Default marker icons via CDN
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function Map({ markers = [], center = [20.5937, 78.9629], zoom = 5 }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (!containerRef.current) return;
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current).setView(center, zoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }
    return () => {
      // Do not destroy map between rerenders; page unmount will clean up
    };
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, zoom);
    }
  }, [center, zoom]);

  useEffect(() => {
    // Clear existing markers
    markersRef.current.forEach(m => mapRef.current.removeLayer(m));
    markersRef.current = [];

    const valid = Array.isArray(markers)
      ? markers.filter(m => typeof m.latitude === 'number' && typeof m.longitude === 'number')
      : [];

    const bounds = L.latLngBounds([]);
    valid.forEach(m => {
      const marker = L.marker([m.latitude, m.longitude]).addTo(mapRef.current);
      marker.bindPopup(`
        <div style="font-weight:600;">${m.name ?? ''}</div>
        ${m.address ? `<div style="color:#4b5563;font-size:12px;">${m.address}</div>` : ''}
        <div style="color:#6b7280;font-size:10px;text-transform:uppercase;">${m.type ?? ''}</div>
      `);
      markersRef.current.push(marker);
      bounds.extend([m.latitude, m.longitude]);
    });

    if (valid.length > 0) {
      mapRef.current.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [markers]);

  return (
    <div ref={containerRef} className="w-full h-[70vh] rounded-lg overflow-hidden border border-gray-200" />
  );
}
