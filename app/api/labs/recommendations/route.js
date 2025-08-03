import { authenticateToken } from '../../../../lib/auth.js';
import { prisma } from '../../../../lib/prisma.js';

export async function GET(request) {
  const authResult = await authenticateToken(request);
  
  if (authResult.error || authResult.user.role !== 'CLINIC') {
    return Response.json(
      { error: 'Access denied. Clinic access required.' },
      { status: 403 }
    );
  }

  try {
    // Get clinic
    const clinic = await prisma.clinic.findUnique({
      where: { userId: authResult.user.id }
    });

    if (!clinic) {
      return Response.json(
        { error: 'Clinic not found' },
        { status: 404 }
      );
    }

    // Get recent cases to analyze clinic's preferences
    const recentCases = await prisma.case.findMany({
      where: {
        clinicId: clinic.id,
        labId: { not: null },
        status: { in: ['DELIVERED', 'DISPATCHED'] }
      },
      include: {
        lab: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20 // Analyze last 20 cases
    });

    // Get labs used before
    const labsUsedBefore = [...new Set(recentCases.map(c => c.labId))];
    
    // Calculate average turnaround for each lab
    const labPerformance = {};
    recentCases.forEach(caseItem => {
      if (!labPerformance[caseItem.labId]) {
        labPerformance[caseItem.labId] = {
          labId: caseItem.labId,
          caseCount: 0,
          totalTurnaround: 0,
          lab: caseItem.lab
        };
      }
      labPerformance[caseItem.labId].caseCount++;
      
      // Calculate turnaround time (simplified - using created to updated)
      const turnaround = Math.ceil((new Date(caseItem.updatedAt) - new Date(caseItem.createdAt)) / (1000 * 60 * 60 * 24));
      labPerformance[caseItem.labId].totalTurnaround += turnaround;
    });

    // Get all labs for recommendations
    const allLabs = await prisma.lab.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            cases: true,
            reviews: true,
            favorites: true
          }
        }
      }
    });

    // Score labs based on different criteria
    const scoredLabs = allLabs.map(lab => {
      let score = 0;
      let reasons = [];

      // Previously used labs get higher scores
      if (labsUsedBefore.includes(lab.id)) {
        score += 50;
        reasons.push('Previously used');
        
        // Performance bonus
        const performance = labPerformance[lab.id];
        if (performance) {
          const avgTurnaround = performance.totalTurnaround / performance.caseCount;
          if (avgTurnaround <= lab.turnaroundTime) {
            score += 30;
            reasons.push('Fast delivery');
          }
        }
      }

      // High rating bonus
      if (lab.rating >= 4.5) {
        score += 25;
        reasons.push('Highly rated');
      } else if (lab.rating >= 4.0) {
        score += 15;
        reasons.push('Well rated');
      }

      // Fast turnaround bonus
      if (lab.turnaroundTime <= 3) {
        score += 20;
        reasons.push('Quick turnaround');
      } else if (lab.turnaroundTime <= 5) {
        score += 10;
        reasons.push('Good turnaround');
      }

      // Popular lab bonus
      if (lab._count.cases > 50) {
        score += 15;
        reasons.push('Experienced');
      } else if (lab._count.cases > 20) {
        score += 10;
        reasons.push('Established');
      }

      // Many favorites bonus
      if (lab._count.favorites > 10) {
        score += 10;
        reasons.push('Popular choice');
      }

      // Specialty match (simplified - assuming clinic specialties match case needs)
      const commonSpecialties = clinic.specialties.filter(spec => 
        lab.specialties.includes(spec)
      );
      if (commonSpecialties.length > 0) {
        score += commonSpecialties.length * 15;
        reasons.push(`Specializes in ${commonSpecialties.join(', ')}`);
      }

      return {
        ...lab,
        recommendationScore: score,
        recommendationReasons: reasons,
        isUsedBefore: labsUsedBefore.includes(lab.id),
        averagePerformance: labPerformance[lab.id] ? 
          Math.round(labPerformance[lab.id].totalTurnaround / labPerformance[lab.id].caseCount) : null
      };
    });

    // Sort by score and return top recommendations
    const recommendations = scoredLabs
      .filter(lab => lab.recommendationScore > 0)
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 6); // Top 6 recommendations

    // Also get favorite labs
    const favoriteLabs = await prisma.favoriteLab.findMany({
      where: {
        clinicId: clinic.id
      },
      include: {
        lab: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            },
            _count: {
              select: {
                cases: true,
                reviews: true
              }
            }
          }
        }
      },
      take: 3
    });

    return Response.json({
      recommendations,
      favorites: favoriteLabs.map(fav => fav.lab),
      stats: {
        totalLabsUsed: labsUsedBefore.length,
        totalCases: recentCases.length
      }
    });

  } catch (error) {
    console.error('Error fetching lab recommendations:', error);
    return Response.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}
