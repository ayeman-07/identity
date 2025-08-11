export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();
    if (!q) {
      return Response.json({ error: 'Missing q' }, { status: 400 });
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'i-Dentity App - demo use',
        'Accept': 'application/json'
      }
    });

    if (!res.ok) {
      return Response.json({ error: 'Geocoding failed' }, { status: 502 });
    }

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) {
      return Response.json({ result: null });
    }
    const first = data[0];
    return Response.json({
      result: {
        latitude: first.lat ? parseFloat(first.lat) : null,
        longitude: first.lon ? parseFloat(first.lon) : null,
        displayName: first.display_name || ''
      }
    });
  } catch (e) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
