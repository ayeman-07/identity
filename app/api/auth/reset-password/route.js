import bcrypt from 'bcryptjs';
import { prisma } from '../../../../lib/prisma.js';

export async function POST(request) {
  try {
    const { email, otp, newPassword } = await request.json();

    // Validation
    if (!email || !otp || !newPassword) {
      return Response.json(
        { error: 'Email, OTP, and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return Response.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Find the reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { email }
    });

    if (!resetToken) {
      return Response.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (new Date() > resetToken.expiresAt) {
      // Clean up expired token
      await prisma.passwordResetToken.delete({
        where: { email }
      });
      return Response.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (resetToken.token !== otp) {
      return Response.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and delete reset token
    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
      }),
      prisma.passwordResetToken.delete({
        where: { email }
      })
    ]);

    return Response.json({
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 