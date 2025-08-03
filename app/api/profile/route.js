import { authenticateToken, requireClinic, requireLab } from '../../../lib/auth.js';
import { prisma } from '../../../lib/prisma.js';

// GET profile - requires authentication
export async function GET(request) {
  const authResult = await authenticateToken(request);
  
  if (authResult.error) {
    return Response.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  return Response.json({
    message: 'Profile retrieved successfully',
    user: authResult.user
  });
}

// PUT profile - requires authentication
export async function PUT(request) {
  const authResult = await authenticateToken(request);
  
  if (authResult.error) {
    return Response.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  const { name } = await request.json();

  if (!name) {
    return Response.json(
      { error: 'Name is required' },
      { status: 400 }
    );
  }

  // Update user name
  const updatedUser = await prisma.user.update({
    where: { id: authResult.user.id },
    data: { name },
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  });

  return Response.json({
    message: 'Profile updated successfully',
    user: updatedUser
  });
} 