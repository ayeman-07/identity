import { authenticateToken } from '../../../lib/auth.js';
import { prisma } from '../../../lib/prisma.js';

export async function GET(request) {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    return Response.json({
      message: 'Database connection successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return Response.json(
      { error: 'Database connection failed', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const authResult = await authenticateToken(request);
    
    if (authResult.error) {
      return Response.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Test user data
    const user = await prisma.user.findUnique({
      where: { id: authResult.user.id },
      include: {
        clinic: true,
        lab: true
      }
    });

    return Response.json({
      message: 'Authentication successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasClinic: !!user.clinic,
        hasLab: !!user.lab,
        clinicId: user.clinic?.id,
        labId: user.lab?.id
      }
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return Response.json(
      { error: 'Test failed', details: error.message },
      { status: 500 }
    );
  }
} 