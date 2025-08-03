import { requireClinic } from '../../../../lib/auth.js';
import { prisma } from '../../../../lib/prisma.js';

export async function POST(request) {
  const authResult = await requireClinic(request);
  
  if (authResult.error) {
    return Response.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
          const formData = await request.formData();
      const title = formData.get('title');
      const caseNotes = formData.get('caseNotes');
      const toothNumber = formData.get('toothNumber');
      const labId = formData.get('labId'); // Optional - can be null for unassigned

    // Validation
    if (!title || !toothNumber) {
      return Response.json(
        { error: 'Title and tooth number are required' },
        { status: 400 }
      );
    }

    // Validate labId if provided
    let validatedLabId = null;
    if (labId && labId.trim() !== '') {
      const labExists = await prisma.lab.findUnique({
        where: { id: labId }
      });
      
      if (labExists) {
        validatedLabId = labId;
      } else {
        // If labId is provided but doesn't exist, return error
        return Response.json(
          { error: 'Selected lab does not exist' },
          { status: 400 }
        );
      }
    }

    // Note: File validation and upload will be handled separately via /api/files/upload
    // This endpoint now only creates the case record

    // Get clinic ID
    const clinic = await prisma.clinic.findUnique({
      where: { userId: authResult.user.id }
    });

    if (!clinic) {
      return Response.json(
        { error: 'Clinic profile not found' },
        { status: 404 }
      );
    }

    // Create case in database (files will be uploaded separately)
    const newCase = await prisma.case.create({
      data: {
        title,
        caseNotes: caseNotes || null,
        toothNumber,
        status: 'NEW',
        clinicId: clinic.id,
        labId: validatedLabId
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
      message: 'Case uploaded successfully',
      case: {
        id: newCase.id,
        title: newCase.title,
        status: newCase.status,
        toothNumber: newCase.toothNumber,
        createdAt: newCase.createdAt,
        clinic: newCase.clinic,
        lab: newCase.lab
      }
    });

  } catch (error) {
    console.error('Error uploading case:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 