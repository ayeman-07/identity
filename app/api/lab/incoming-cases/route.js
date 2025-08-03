import { requireLab } from '../../../../lib/auth.js';
import { prisma } from '../../../../lib/prisma.js';

export async function GET(request) {
  const authResult = await requireLab(request);
  
  if (authResult.error) {
    return Response.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    // Get the lab record for the authenticated user
    const lab = await prisma.lab.findUnique({
      where: { userId: authResult.user.id }
    });

    if (!lab) {
      return Response.json(
        { error: 'Lab not found' },
        { status: 404 }
      );
    }

    // Get cases that are either:
    // 1. NEW status with no lab assigned (general pool)
    // 2. NEW status specifically assigned to this lab
    const incomingCases = await prisma.case.findMany({
      where: {
        status: 'NEW',
        OR: [
          { labId: null },           // Unassigned cases (general pool)
          { labId: lab.id }          // Cases specifically assigned to this lab
        ]
      },
      include: {
        files: true,
        clinic: {
          select: {
            name: true
          }
        }
      },
      orderBy: [
        { labId: 'desc' },  // Show assigned cases first (labId not null)
        { createdAt: 'desc' }
      ]
    });

    // Add a flag to distinguish between assigned and unassigned cases
    const casesWithAssignmentFlag = incomingCases.map(caseItem => ({
      ...caseItem,
      isAssignedToLab: caseItem.labId === lab.id
    }));

    return Response.json({
      message: 'Incoming cases retrieved successfully',
      cases: casesWithAssignmentFlag
    });

  } catch (error) {
    console.error('Error fetching incoming cases:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 