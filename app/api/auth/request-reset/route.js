import { prisma } from '../../../../lib/prisma.js';

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Mock email sending function
async function sendResetEmail(email, otp) {
  // In production, this would use a real email service like SendGrid, AWS SES, etc.
  console.log(`Password reset email sent to ${email} with OTP: ${otp}`);
  return true;
}

export async function POST(request) {
  try {
    const { email } = await request.json();

    // Validation
    if (!email) {
      return Response.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      return Response.json({
        message: 'If the email exists, a password reset link has been sent'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Delete any existing reset tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email }
    });

    // Create new reset token
    await prisma.passwordResetToken.create({
      data: {
        email,
        token: otp,
        expiresAt
      }
    });

    // Send email (mocked for now)
    await sendResetEmail(email, otp);

    return Response.json({
      message: 'If the email exists, a password reset link has been sent'
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 