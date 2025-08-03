import { authenticateToken } from '../../../../lib/auth.js';
import { prisma } from '../../../../lib/prisma.js';

export async function GET(request) {
  // Allow access for debugging - remove in production
  try {
    // Get all cases to debug
    const allCases = await prisma.case.findMany({
      include: {
        files: true,
        clinic: {
          select: {
            name: true
          }
        },
        lab: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get all labs
    const allLabs = await prisma.lab.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });

    // Get all clinics
    const allClinics = await prisma.clinic.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });

    return Response.json({
      message: 'Debug data',
      stats: {
        totalCases: allCases.length,
        newCases: allCases.filter(c => c.status === 'NEW').length,
        unassignedCases: allCases.filter(c => c.status === 'NEW' && c.labId === null).length,
        assignedCases: allCases.filter(c => c.labId !== null).length,
        totalLabs: allLabs.length,
        totalClinics: allClinics.length,
      },
      data: {
        cases: allCases,
        labs: allLabs,
        clinics: allClinics
      }
    });

  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return Response.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
