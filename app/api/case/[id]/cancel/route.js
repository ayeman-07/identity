import { requireClinic } from '../../../../../lib/auth.js';
import { prisma } from '../../../../../lib/prisma.js';

export async function POST(request, { params }) {
  const authResult = await requireClinic(request);
  
  if (authResult.error) {
    return Response.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { id } = await params;

    // Get the case and verify clinic ownership
    const existingCase = await prisma.case.findUnique({
      where: { id },
      include: {
        clinic: {
          select: {
            id: true,
            userId: true
          }
        },
        lab: {
          select: {
            name: true
          }
        }
      }
    });

    if (!existingCase) {
      return Response.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Check if clinic owns this case
    if (existingCase.clinic.userId !== authResult.user.id) {
      return Response.json(
        { error: 'You are not authorized to cancel this case' },
        { status: 403 }
      );
    }

    // Check if case can be cancelled (only NEW status and no lab assigned or lab hasn't accepted)
    if (existingCase.status !== 'NEW' && existingCase.status !== 'ACCEPTED') {
      return Response.json(
        { error: 'Can only cancel cases with NEW or ACCEPTED status' },
        { status: 400 }
      );
    }

    // Cancel the case
    const updatedCase = await prisma.case.update({
      where: { id },
      data: {
        status: 'CANCELLED'
      },
      include: {
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
      }
    });

    return Response.json({
      message: 'Case cancelled successfully',
      case: {
        id: updatedCase.id,
        title: updatedCase.title,
        status: updatedCase.status,
        clinic: updatedCase.clinic,
        lab: updatedCase.lab,
        updatedAt: updatedCase.updatedAt
      }
    });

  } catch (error) {
    console.error('Error cancelling case:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 