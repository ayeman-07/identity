import { authenticateToken } from '../../../../lib/auth.js';
import cloudinary from '../../../../lib/cloudinary.js';

// Returns a signed payload for client uploads to Cloudinary without exposing API secret
// Query params (optional): folder, resourceType
export async function GET(request) {
  const auth = await authenticateToken(request);
  if (auth.error) return Response.json({ error: auth.error }, { status: auth.status });
  // Optional: Restrict by role if needed
  if (!['CLINIC','LAB'].includes(auth.user.role)) {
    return Response.json({ error: 'Unauthorized role' }, { status: 403 });
  }
  try {
    const url = new URL(request.url);
    const folder = url.searchParams.get('folder') || 'dental-cases';
    const resourceType = url.searchParams.get('resourceType') || 'auto';
    const timestamp = Math.round(Date.now() / 1000);

    // Only sign parameters we will send
    const paramsToSign = { timestamp, folder };
    const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET);

    return Response.json({
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder,
      resourceType,
      timestamp,
      signature
    });
  } catch (e) {
    console.error('Signature generation error', e);
    return Response.json({ error: 'Failed to generate signature' }, { status: 500 });
  }
}
