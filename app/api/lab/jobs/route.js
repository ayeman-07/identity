import { requireLab } from '../../../../lib/auth.js';
import { prisma } from '../../../../lib/prisma.js';

export async function GET(request) {
  try {
    const authResult = await requireLab(request);
    
    if (authResult.error) {
      return Response.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Check if user has a lab profile
    if (!authResult.user.lab) {
      return Response.json(
        { error: 'Lab profile not found. Please complete your profile first.' },
        { status: 404 }
      );
    }

    const labId = authResult.user.lab.id;

    // Fetch all cases assigned to this lab (accepted jobs)
    const cases = await prisma.case.findMany({
      where: { 
        labId,
        status: {
          in: ['ACCEPTED', 'IN_PROGRESS', 'READY', 'DISPATCHED', 'DELIVERED']
        }
      },
      include: {
        clinic: {
          select: { id: true, name: true }
        },
        files: {
          select: {
            id: true,
            originalName: true,
            fileType: true,
            fileSize: true,
            uploadedAt: true
          }
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Transform data to match the expected format
    const transformedCases = cases.map(caseItem => ({
      id: caseItem.id,
      title: caseItem.title,
      description: caseItem.description,
      status: caseItem.status,
      createdAt: caseItem.createdAt,
      updatedAt: caseItem.updatedAt,
      clinic: caseItem.clinic,
      files: caseItem.files,
      messageCount: caseItem._count.messages
    }));

    return Response.json({
      success: true,
      cases: transformedCases
    });

  } catch (error) {
    console.error('Lab jobs API error:', error);
    return Response.json(
      { error: 'Failed to fetch lab jobs' },
      { status: 500 }
    );
  }
}
