import bcrypt from 'bcryptjs';
import { prisma } from '../../../../lib/prisma.js';
import { generateToken } from '../../../../lib/auth.js';

export async function POST(request) {
  try {
    const { name, email, password, role } = await request.json();

    // Validation
    if (!name || !email || !password || !role) {
      return Response.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (!['CLINIC', 'LAB'].includes(role)) {
      return Response.json(
        { error: 'Role must be either CLINIC or LAB' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return Response.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role
        }
      });

      // Create clinic or lab profile based on role
      if (role === 'CLINIC') {
        await tx.clinic.create({
          data: {
            name,
            userId: user.id
          }
        });
      } else if (role === 'LAB') {
        await tx.lab.create({
          data: {
            name,
            services: [],
            turnaroundTime: 7, // Default 7 days
            location: '',
            userId: user.id
          }
        });
      }

      return user;
    });

    // Generate JWT token
    const token = generateToken(result.id, result.email, result.role);

    return Response.json({
      message: 'User registered successfully',
      token,
      user: {
        id: result.id,
        name: result.name,
        email: result.email,
        role: result.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 