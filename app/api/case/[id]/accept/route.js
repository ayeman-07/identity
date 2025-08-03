import { requireLab } from '../../../../../lib/auth.js';
import { prisma } from '../../../../../lib/prisma.js';

export async function POST(request, { params }) {
  const authResult = await requireLab(request);
  
  if (authResult.error) {
    return Response.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { id } = await params;
    const { action } = await request.json(); // 'accept' or 'reject'

    // Validation
    if (!action || !['accept', 'reject'].includes(action)) {
      return Response.json(
        { error: 'Action must be either "accept" or "reject"' },
        { status: 400 }
      );
    }

    // Get the case
    const existingCase = await prisma.case.findUnique({
      where: { id },
      include: {
        lab: {
          select: {
            id: true,
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

    // Check if case is in NEW status
    if (existingCase.status !== 'NEW') {
      return Response.json(
        { error: 'Can only accept/reject cases with NEW status' },
        { status: 400 }
      );
    }

    // Get lab ID
    const lab = await prisma.lab.findUnique({
      where: { userId: authResult.user.id }
    });

    if (!lab) {
      return Response.json(
        { error: 'Lab profile not found' },
        { status: 404 }
      );
    }

    // If case is already assigned to a specific lab, only that lab can accept/reject it
    if (existingCase.labId && existingCase.labId !== lab.id) {
      return Response.json(
        { error: 'This case is assigned to another lab' },
        { status: 403 }
      );
    }

    let updatedCase;
    if (action === 'accept') {
      // For unassigned cases (general pool), we need to handle race conditions
      // Use atomic update to ensure only one lab can accept the case
      if (!existingCase.labId) {
        try {
          // Atomic update: only update if the case is still unassigned (labId is null)
          updatedCase = await prisma.case.update({
            where: { 
              id,
              labId: null, // This ensures the case is still unassigned
              status: 'NEW' // And still in NEW status
            },
            data: {
              status: 'ACCEPTED',
              labId: lab.id
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
        } catch (error) {
          // If the update fails, it means another lab already accepted this case
          if (error.code === 'P2025') { // Prisma "Record not found" error
            return Response.json(
              { error: 'This case has already been accepted by another lab' },
              { status: 409 }
            );
          }
          throw error; // Re-throw other errors
        }
      } else {
        // For cases already assigned to this lab, just update the status
        updatedCase = await prisma.case.update({
          where: { id },
          data: {
            status: 'ACCEPTED'
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
      }
    } else {
      // Reject the case (mark as REJECTED)
      if (!existingCase.labId) {
        try {
          // For unassigned cases, assign to this lab when rejecting with atomic update
          updatedCase = await prisma.case.update({
            where: { 
              id,
              labId: null, // This ensures the case is still unassigned
              status: 'NEW' // And still in NEW status
            },
            data: {
              status: 'REJECTED',
              labId: lab.id
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
        } catch (error) {
          // If the update fails, it means another lab already acted on this case
          if (error.code === 'P2025') { // Prisma "Record not found" error
            return Response.json(
              { error: 'This case has already been handled by another lab' },
              { status: 409 }
            );
          }
          throw error; // Re-throw other errors
        }
      } else {
        // For cases already assigned to this lab, just update the status
        updatedCase = await prisma.case.update({
          where: { id },
          data: {
            status: 'REJECTED'
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
      }
    }

    return Response.json({
      message: `Case ${action}ed successfully`,
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
    console.error('Error accepting/rejecting case:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 