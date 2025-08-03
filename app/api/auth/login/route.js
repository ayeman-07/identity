import bcrypt from 'bcryptjs';
import { prisma } from '../../../../lib/prisma.js';
import { generateToken } from '../../../../lib/auth.js';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return Response.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        clinic: {
          select: {
            id: true,
            name: true
          }
        },
        lab: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!user) {
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken(user.id, user.email, user.role);

    return Response.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        clinic: user.clinic,
        lab: user.lab
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 