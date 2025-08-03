import jwt from 'jsonwebtoken';
import { prisma } from './prisma.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token and attach user to request
export const authenticateToken = async (req) => {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return { error: 'Access token required', status: 401 };
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Get user from database to ensure they still exist
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
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
      return { error: 'User not found', status: 401 };
    }

    return { user };
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return { error: 'Token expired', status: 401 };
    }
    if (error.name === 'JsonWebTokenError') {
      return { error: 'Invalid token', status: 401 };
    }
    return { error: 'Authentication failed', status: 401 };
  }
};

// Middleware for role-based access control
export const requireRole = (allowedRoles) => {
  return async (req) => {
    const authResult = await authenticateToken(req);
    
    if (authResult.error) {
      return authResult;
    }

    if (!allowedRoles.includes(authResult.user.role)) {
      return { 
        error: 'Insufficient permissions', 
        status: 403 
      };
    }

    return authResult;
  };
};

// Specific role middleware
export const requireClinic = requireRole(['CLINIC']);
export const requireLab = requireRole(['LAB']);

// Generate JWT token
export const generateToken = (userId, email, role) => {
  return jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
}; 