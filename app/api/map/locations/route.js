import { prisma } from '../../../../lib/prisma.js';

export async function GET() {
  try {
    const [clinics, labs] = await Promise.all([
      prisma.clinic.findMany({
        select: {
          id: true,
          name: true,
          address: true,
          latitude: true,
          longitude: true
        }
      }),
      prisma.lab.findMany({
        select: {
          id: true,
          name: true,
          location: true,
          latitude: true,
          longitude: true
        }
      })
    ]);

    const clinicMarkers = clinics
      .filter(c => c?.latitude != null && c?.longitude != null)
      .map(c => ({
        id: c.id,
        name: c.name,
        address: c.address || '',
        latitude: c.latitude,
        longitude: c.longitude,
        type: 'clinic'
      }));

    const labMarkers = labs
      .filter(l => l?.latitude != null && l?.longitude != null)
      .map(l => ({
        id: l.id,
        name: l.name,
        address: l.location || '',
        latitude: l.latitude,
        longitude: l.longitude,
        type: 'lab'
      }));

    return Response.json({ markers: [...clinicMarkers, ...labMarkers] });
  } catch (error) {
    console.error('GET /api/map/locations failed:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
