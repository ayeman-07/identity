import { requireClinic } from '../../../../lib/auth.js';
import { prisma } from '../../../../lib/prisma.js';

export async function GET(request) {
  try {
    const authResult = await requireClinic(request);
    
    if (authResult.error) {
      return Response.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Check if user has a clinic profile
    if (!authResult.user.clinic) {
      return Response.json(
        { error: 'Clinic profile not found. Please complete your profile first.' },
        { status: 404 }
      );
    }

    const clinicId = authResult.user.clinic.id;

    // Fetch all cases belonging to this clinic
    const cases = await prisma.case.findMany({
      where: { clinicId },
      include: {
        lab: {
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
      toothNumber: caseItem.toothNumber,
      status: caseItem.status,
      createdAt: caseItem.createdAt,
      updatedAt: caseItem.updatedAt,
      lab: caseItem.lab,
      files: caseItem.files,
      messageCount: caseItem._count.messages
    }));

    return Response.json({
      success: true,
      cases: transformedCases
    });

  } catch (error) {
    console.error('Clinic cases API error:', error);
    return Response.json(
      { error: 'Failed to fetch clinic cases' },
      { status: 500 }
    );
  }
}
