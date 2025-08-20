import { prisma } from '../../../../lib/prisma.js';
import { sendMail, passwordResetEmail } from '../../../../lib/mailer.js';

// Generate 6-digit OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send reset email via configured transport
async function sendResetEmail(email, otp) {
  const tpl = passwordResetEmail({ otp });
  await sendMail({ to: email, subject: tpl.subject, html: tpl.html, text: tpl.text });
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

    // Optional throttle: prevent >1 requests every 60s
    const existing = await prisma.passwordResetToken.findUnique({ where: { email } });
    if (existing) {
      const secondsSince = (Date.now() - existing.createdAt.getTime()) / 1000;
      if (secondsSince < 60) {
        return Response.json({ message: 'If the email exists, a password reset link has been sent' });
      }
      // Remove old token before creating new
      await prisma.passwordResetToken.delete({ where: { email } });
    }

    // Generate OTP & expiry
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.passwordResetToken.create({ data: { email, token: otp, expiresAt } });

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