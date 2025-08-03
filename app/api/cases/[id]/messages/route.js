import { authenticateToken } from '../../../../../lib/auth.js';
import { prisma } from '../../../../../lib/prisma.js';

// GET /api/cases/[id]/messages - Get all messages for a case
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

    // Get the case to verify access permissions
    const caseData = await prisma.case.findUnique({
      where: { id },
      include: {
        clinic: {
          include: {
            user: {
              select: { id: true }
            }
          }
        },
        lab: {
          include: {
            user: {
              select: { id: true }
            }
          }
        }
      }
    });

    if (!caseData) {
      return Response.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to view messages
    const isClinic = authResult.user.role === 'CLINIC' && caseData.clinic.user.id === authResult.user.id;
    const isAssignedLab = authResult.user.role === 'LAB' && caseData.lab?.user.id === authResult.user.id;

    if (!isClinic && !isAssignedLab) {
      return Response.json(
        { error: 'Access denied. Only the case clinic or assigned lab can view messages.' },
        { status: 403 }
      );
    }

    // Get all messages for this case
    const messages = await prisma.message.findMany({
      where: {
        caseId: id
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    });

    return Response.json({
      messages,
      caseInfo: {
        id: caseData.id,
        title: caseData.title,
        status: caseData.status,
        clinic: caseData.clinic.name,
        lab: caseData.lab?.name || null
      }
    });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/cases/[id]/messages - Add a new message
export async function POST(request, { params }) {
  const authResult = await authenticateToken(request);
  
  if (authResult.error) {
    return Response.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { id } = await params;
    const { content } = await request.json();

    // Validate content
    if (!content || content.trim().length === 0) {
      return Response.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return Response.json(
        { error: 'Message content must be 1000 characters or less' },
        { status: 400 }
      );
    }

    // Get the case to verify access permissions
    const caseData = await prisma.case.findUnique({
      where: { id },
      include: {
        clinic: {
          include: {
            user: {
              select: { id: true }
            }
          }
        },
        lab: {
          include: {
            user: {
              select: { id: true }
            }
          }
        }
      }
    });

    if (!caseData) {
      return Response.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    // Check if messaging is allowed (case must be assigned to a lab)
    if (!caseData.labId) {
      return Response.json(
        { error: 'Messaging is not available for unassigned cases' },
        { status: 400 }
      );
    }

    // Check if user has permission to send messages
    const isClinic = authResult.user.role === 'CLINIC' && caseData.clinic.user.id === authResult.user.id;
    const isAssignedLab = authResult.user.role === 'LAB' && caseData.lab?.user.id === authResult.user.id;

    if (!isClinic && !isAssignedLab) {
      return Response.json(
        { error: 'Access denied. Only the case clinic or assigned lab can send messages.' },
        { status: 403 }
      );
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        caseId: id,
        senderId: authResult.user.id,
        content: content.trim()
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    });

    return Response.json({
      message: 'Message sent successfully',
      data: message
    });

  } catch (error) {
    console.error('Error sending message:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
