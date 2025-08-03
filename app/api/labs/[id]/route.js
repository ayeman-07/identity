import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma.js';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Lab ID is required' },
        { status: 400 }
      );
    }

    // Fetch lab profile with basic information
    const lab = await prisma.lab.findUnique({
      where: { id }, // ID is a string UUID, not integer
      include: {
        user: {
          select: {
            email: true,
            name: true,
            createdAt: true
          }
        }
      }
    });

    if (!lab) {
      return NextResponse.json(
        { error: 'Lab not found' },
        { status: 404 }
      );
    }

    // Format the response to match expected structure
    const labData = {
      id: lab.id,
      name: lab.name,
      email: lab.user.email,
      phone: lab.phone,
      location: lab.location,
      website: lab.website,
      specialties: lab.specialties || [],
      services: lab.services || [],
      turnaroundTime: lab.turnaroundTime,
      rating: lab.rating,
      createdAt: lab.user.createdAt
    };

    return NextResponse.json({
      lab: labData
    });

  } catch (error) {
    console.error('Error fetching lab profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
