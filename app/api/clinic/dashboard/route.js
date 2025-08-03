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

    // Fetch all cases for this clinic
    const cases = await prisma.case.findMany({
      where: { clinicId },
      include: {
        lab: {
          select: { id: true, name: true, rating: true }
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Calculate statistics
    const totalCases = cases.length;
    const activeCases = cases.filter(c => c.status !== 'DELIVERED').length;
    const completedCases = cases.filter(c => c.status === 'DELIVERED').length;
    const recentCases = cases.slice(0, 5);

    // Status breakdown
    const statusBreakdown = {
      NEW: cases.filter(c => c.status === 'NEW').length,
      ACCEPTED: cases.filter(c => c.status === 'ACCEPTED').length,
      IN_PROGRESS: cases.filter(c => c.status === 'IN_PROGRESS').length,
      READY: cases.filter(c => c.status === 'READY').length,
      DISPATCHED: cases.filter(c => c.status === 'DISPATCHED').length,
      DELIVERED: cases.filter(c => c.status === 'DELIVERED').length,
      CANCELLED: cases.filter(c => c.status === 'CANCELLED').length,
      REJECTED: cases.filter(c => c.status === 'REJECTED').length
    };

    // Get favorite labs
    const favoriteLabs = await prisma.favoriteLab.findMany({
      where: { clinicId },
      include: {
        lab: {
          select: {
            id: true,
            name: true,
            rating: true,
            specialties: true,
            location: true,
            turnaroundTime: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get recommended labs (from seeded data and high-rated labs)
    const favoriteLabIds = favoriteLabs.map(fl => fl.lab.id);
    
    // Get all labs that aren't already favorites
    const recommendedLabs = await prisma.lab.findMany({
      where: {
        id: { notIn: favoriteLabIds }
      },
      select: {
        id: true,
        name: true,
        rating: true,
        specialties: true,
        location: true,
        turnaroundTime: true,
        user: {
          select: {
            id: true
          }
        }
      },
      orderBy: { rating: 'desc' },
      take: 5
    });

    // Get recent messages for notifications
    const recentMessages = await prisma.message.findMany({
      where: {
        case: { clinicId },
        sender: { role: 'LAB' } // Only messages from labs
      },
      include: {
        case: {
          select: { id: true, title: true }
        },
        sender: {
          select: { name: true }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 5
    });

    return Response.json({
      success: true,
      data: {
        clinic: {
          id: authResult.user.clinic.id,
          name: authResult.user.clinic.name
        },
        stats: {
          totalCases,
          activeCases,
          completedCases,
          statusBreakdown
        },
        recentCases: recentCases.map(c => ({
          id: c.id,
          title: c.title,
          status: c.status,
          labName: c.lab?.name || 'Unassigned',
          updatedAt: c.updatedAt,
          messageCount: c._count.messages
        })),
        favoriteLabs: favoriteLabs.map(fl => ({
          id: fl.lab.id,
          name: fl.lab.name,
          rating: fl.lab.rating,
          specialties: fl.lab.specialties,
          location: fl.lab.location,
          turnaroundTime: fl.lab.turnaroundTime
        })),
        recommendedLabs: recommendedLabs.map(lab => ({
          id: lab.id,
          name: lab.name,
          rating: lab.rating,
          specialties: lab.specialties,
          location: lab.location,
          turnaroundTime: lab.turnaroundTime
        })),
        recentMessages: recentMessages.map(m => ({
          id: m.id,
          content: m.content.substring(0, 100) + (m.content.length > 100 ? '...' : ''),
          timestamp: m.timestamp,
          caseId: m.case.id,
          caseTitle: m.case.title,
          senderName: m.sender.name
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching clinic dashboard:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 