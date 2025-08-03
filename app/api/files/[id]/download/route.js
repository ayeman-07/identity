import { authenticateToken } from '../../../../../lib/auth.js';
import { prisma } from '../../../../../lib/prisma.js';
import path from 'path';
import fs from 'fs';

export async function GET(request, { params }) {
  const authResult = await authenticateToken(request);
  
  if (authResult.error) {
    return Response.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { id } = await params;

    // Get file record from database
    const fileRecord = await prisma.file.findUnique({
      where: { id },
      include: {
        case: {
          include: {
            clinic: {
              select: {
                userId: true
              }
            },
            lab: {
              select: {
                userId: true
              }
            }
          }
        }
      }
    });

    if (!fileRecord) {
      return Response.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Check access permissions
    const user = authResult.user;
    const caseItem = fileRecord.case;
    
    // Allow access if user is the clinic owner or the assigned lab
    const hasAccess = 
      caseItem.clinic.userId === user.id || // Clinic owner can always access
      (caseItem.lab && caseItem.lab.userId === user.id) || // Assigned lab can access
      (user.role === 'LAB' && caseItem.labId === null); // Any lab can view files from unassigned cases

    if (!hasAccess) {
      return Response.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Construct file path
    const filePath = path.join(process.cwd(), 'public', fileRecord.filePath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return Response.json(
        { error: 'File not found on server' },
        { status: 404 }
      );
    }

    // Read file
    const fileBuffer = fs.readFileSync(filePath);

    // Set appropriate headers
    const headers = new Headers();
    headers.set('Content-Type', fileRecord.fileType);
    headers.set('Content-Disposition', `inline; filename="${fileRecord.originalName}"`);
    headers.set('Content-Length', fileRecord.fileSize.toString());
    headers.set('Cache-Control', 'no-cache');
    headers.set('Access-Control-Allow-Origin', '*');

    console.log('Sending file response with headers:', Object.fromEntries(headers.entries()));

    return new Response(fileBuffer, {
      status: 200,
      headers: headers
    });

  } catch (error) {
    console.error('Error downloading file:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 