import { requireClinic } from '../../../../lib/auth.js';
import { prisma } from '../../../../lib/prisma.js';

export async function POST(request) {
  const authResult = await requireClinic(request);
  if (authResult.error) {
    return Response.json({ error: authResult.error }, { status: authResult.status });
  }
  try {
    const url = new URL(request.url);
    const caseId = url.searchParams.get('caseId');
    if (!caseId) return Response.json({ error: 'caseId required' }, { status:400 });

    const body = await request.json();
    const { originalName, fileType, fileSize, fileUrl, publicId } = body;
    if (!fileUrl || !originalName) return Response.json({ error: 'fileUrl & originalName required' }, { status:400 });

    // Basic size/type validation
    if (fileSize && fileSize > 120 * 1024 * 1024) {
      return Response.json({ error: 'File too large' }, { status:400 });
    }

    const caseItem = await prisma.case.findUnique({
      where: { id: caseId },
      include: { clinic: { select: { userId: true } } }
    });
    if (!caseItem) return Response.json({ error: 'Case not found' }, { status:404 });
    if (caseItem.clinic.userId !== authResult.user.id) return Response.json({ error: 'Unauthorized' }, { status:403 });

    const fileRecord = await prisma.file.create({
      data: {
        filename: publicId || originalName,
        originalName,
        filePath: fileUrl, // for backward compatibility, store URL also in filePath (legacy code may use)
        fileUrl,
        fileType: fileType || 'application/octet-stream',
        fileSize: fileSize || 0,
        caseId
      }
    });

    return Response.json({ file: fileRecord });
  } catch (err) {
    console.error('Cloudinary metadata save error:', err);
    return Response.json({ error: 'Internal server error' }, { status:500 });
  }
}
