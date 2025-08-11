export async function geocodeAddress(address) {
  try {
    if (!address || !address.trim()) {
      return { latitude: null, longitude: null };
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'i-Dentity App - demo use',
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      return { latitude: null, longitude: null };
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      return { latitude: null, longitude: null };
    }

    const first = data[0];
    return {
      latitude: first.lat ? parseFloat(first.lat) : null,
      longitude: first.lon ? parseFloat(first.lon) : null
    };
  } catch (e) {
    return { latitude: null, longitude: null };
  }
}
