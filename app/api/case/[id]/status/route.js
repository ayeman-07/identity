import { requireLab } from '../../../../../lib/auth.js';
import { prisma } from '../../../../../lib/prisma.js';

export async function PATCH(request, { params }) {
  console.log('Status API called');
  
  try {
    const authResult = await requireLab(request);
    console.log('Auth result:', authResult.error ? 'Failed' : 'Success', authResult.user?.id);
    
    if (authResult.error) {
      return Response.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { id } = await params;
    const { status } = await request.json();

    console.log('Status update request:', { caseId: id, requestedStatus: status, userId: authResult.user.id });

    // Validation
    if (!status) {
      return Response.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    // Define the valid status transitions and valid statuses
    const validStatuses = ['ACCEPTED', 'IN_PROGRESS', 'DESIGNING', 'READY', 'DISPATCHED', 'DELIVERED'];
    if (!validStatuses.includes(status)) {
      return Response.json(
        { error: 'Invalid status. Valid statuses: ' + validStatuses.join(', ') },
        { status: 400 }
      );
    }

    // Get the case and verify lab ownership
    console.log('Fetching case with id:', id);
    const existingCase = await prisma.case.findUnique({
      where: { id },
      include: {
        lab: {
          select: {
            id: true,
            userId: true
          }
        }
      }
    });

    if (!existingCase) {
      console.log('Case not found:', id);
      return Response.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    console.log('Found case:', { 
      id: existingCase.id, 
      currentStatus: existingCase.status, 
      labId: existingCase.labId,
      labUserId: existingCase.lab?.userId 
    });

    // Check if lab is assigned to this case
    if (!existingCase.labId || existingCase.lab.userId !== authResult.user.id) {
      console.log('Authorization failed:', {
        hasLabId: !!existingCase.labId,
        labUserId: existingCase.lab?.userId,
        requestUserId: authResult.user.id
      });
      return Response.json(
        { error: 'You are not authorized to update this case' },
        { status: 403 }
      );
    }

    // Validate status transitions
    const currentStatus = existingCase.status;
    const validTransitions = {
      'ACCEPTED': ['DESIGNING', 'IN_PROGRESS'], // Allow backward compatibility
      'IN_PROGRESS': ['DESIGNING', 'READY'], // Transition legacy status
      'DESIGNING': ['READY'],
      'READY': ['DISPATCHED'],
      'DISPATCHED': ['DELIVERED'],
      'DELIVERED': [] // No further transitions allowed
    };

    if (!validTransitions[currentStatus]?.includes(status)) {
      return Response.json(
        { error: `Cannot change status from ${currentStatus} to ${status}. Valid next status: ${validTransitions[currentStatus]?.join(', ') || 'None (final status)'}` },
        { status: 400 }
      );
    }

    console.log('Validation passed, updating case');

    // Prepare status history entry
    const newHistoryEntry = {
      status: status,
      timestamp: new Date().toISOString(),
      updatedBy: authResult.user.name || 'Lab User'
    };

    // Get current history, handle null case
    const currentHistory = Array.isArray(existingCase.statusHistory) ? existingCase.statusHistory : [];
    const updatedHistory = [...currentHistory, newHistoryEntry];

    console.log('Updating case with:', { 
      currentStatus: currentStatus, 
      newStatus: status, 
      historyLength: updatedHistory.length 
    });

    // Update case status and history
    const updatedCase = await prisma.case.update({
      where: { id },
      data: { 
        status,
        statusHistory: updatedHistory
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
        },
        files: {
          select: {
            id: true,
            filename: true,
            originalName: true,
            fileSize: true,
            fileType: true,
            filePath: true,
            uploadedAt: true
          }
        }
      }
    });

    console.log('Case updated successfully');

    return Response.json({
      message: 'Case status updated successfully',
      case: {
        id: updatedCase.id,
        title: updatedCase.title,
        status: updatedCase.status,
        statusHistory: updatedCase.statusHistory,
        clinic: updatedCase.clinic,
        lab: updatedCase.lab,
        files: updatedCase.files,
        updatedAt: updatedCase.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating case status:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return Response.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
} 