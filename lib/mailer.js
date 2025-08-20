import nodemailer from 'nodemailer';

// If RESEND_API_KEY is present, use Resend API (lightweight fetch) else fallback to SMTP transport.
async function sendViaResend({ from, to, subject, html, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null; // signal no resend
  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ from, to, subject, html, text })
    });
    if (!resp.ok) {
      const body = await resp.text();
      console.error('Resend email failed', resp.status, body);
      return null;
    }
    return await resp.json();
  } catch (e) {
    console.error('Resend email error', e);
    return null;
  }
}

// Basic SMTP transport
export function createTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;
  if (!SMTP_HOST || !SMTP_PORT) {
    throw new Error('SMTP configuration missing');
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === 'true',
    auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined
  });
}

export async function sendMail({ to, subject, html, text }) {
  const from = process.env.MAIL_FROM || 'Identity <no-reply@identity.local>';
  // Try Resend first if key configured
  const resendResult = await sendViaResend({ from, to, subject, html, text });
  if (resendResult) return resendResult;
  // Fallback to SMTP if configured
  if (process.env.SMTP_HOST) {
    const transporter = createTransport();
    return transporter.sendMail({ from, to, subject, text, html });
  }
  throw new Error('No email transport configured (missing RESEND_API_KEY or SMTP settings)');
}

export function passwordResetEmail({ otp, minutes = 15 }) {
  return {
    subject: 'Your Password Reset Code',
    text: `Use this code to reset your password: ${otp} (expires in ${minutes} minutes). If you did not request this, ignore this email.`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.5;padding:16px;">
      <h2 style="margin:0 0 12px;font-size:18px;">Password Reset</h2>
      <p>Use the code below to reset your password. It expires in <strong>${minutes} minutes</strong>.</p>
      <div style="font-size:32px;font-weight:700;letter-spacing:4px;background:#111;color:#fff;padding:12px 20px;display:inline-block;border-radius:8px;">${otp}</div>
      <p style="margin-top:24px;font-size:12px;color:#777;">If you did not request this, you can safely ignore this email.</p>
    </div>`
  };
}
