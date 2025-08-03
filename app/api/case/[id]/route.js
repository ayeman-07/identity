import { authenticateToken } from '../../../../lib/auth.js';
import { prisma } from '../../../../lib/prisma.js';

export async function GET(request, { params }) {
  const authResult = await authenticateToken(request);
  
  if (authResult.error) {
    return Response.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { id } = await params;

    // Get case with files and related data
    const caseItem = await prisma.case.findUnique({
      where: { id },
      include: {
        files: true,
        clinic: {
          select: {
            name: true,
            userId: true
          }
        },
        lab: {
          select: {
            name: true,
            rating: true,
            userId: true
          }
        }
      }
    });

    if (!caseItem) {
      return Response.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    const user = authResult.user;
    const hasAccess = 
      caseItem.clinic.userId === user.id || // Clinic owner can always access
      (caseItem.lab && caseItem.lab.userId === user.id) || // Assigned lab can access
      (user.role === 'LAB' && caseItem.labId === null); // Any lab can view unassigned cases

    if (!hasAccess) {
      return Response.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return Response.json({
      message: 'Case details retrieved successfully',
      case: caseItem
    });

  } catch (error) {
    console.error('Error fetching case details:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 