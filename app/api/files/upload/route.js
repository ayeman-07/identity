import { requireClinic } from '../../../../lib/auth.js';
import { prisma } from '../../../../lib/prisma.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';

// Allowed file types
const allowedTypes = [
  'application/sla', // STL files
  'application/zip',
  'application/x-zip-compressed',
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'application/pdf',
  'model/stl' // Alternative MIME type for STL
];

const allowedExtensions = ['.stl', '.zip', '.jpg', '.jpeg', '.png', '.gif', '.pdf'];

// Helper function to validate file type
const isValidFileType = (file) => {
  const fileExtension = path.extname(file.name).toLowerCase();
  return allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension);
};

// Helper function to save file to disk
const saveFile = async (file) => {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  
  // Ensure directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Generate unique filename
  const fileExtension = path.extname(file.name);
  const uniqueName = `${uuidv4()}${fileExtension}`;
  const filePath = path.join(uploadDir, uniqueName);

  // Convert file to buffer and save
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  // Determine proper MIME type for STL files if browser didn't detect it
  let fileType = file.type;
  if (fileExtension.toLowerCase() === '.stl' && (!fileType || fileType === 'application/octet-stream')) {
    fileType = 'model/stl';
  }

  return {
    filename: uniqueName,
    originalName: file.name,
    filePath: `/uploads/${uniqueName}`,
    fileType: fileType,
    fileSize: file.size
  };
};

export async function POST(request) {
  const authResult = await requireClinic(request);
  
  if (authResult.error) {
    return Response.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    // Get caseId from query parameters
    const url = new URL(request.url);
    const caseId = url.searchParams.get('caseId');

    if (!caseId) {
      return Response.json(
        { error: 'Case ID is required' },
        { status: 400 }
      );
    }

    // Verify case exists and belongs to the clinic
    const caseItem = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        clinic: {
          select: {
            userId: true
          }
        }
      }
    });

    if (!caseItem) {
      return Response.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    if (caseItem.clinic.userId !== authResult.user.id) {
      return Response.json(
        { error: 'You are not authorized to upload files for this case' },
        { status: 403 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const files = formData.getAll('files');

    if (!files || files.length === 0) {
      return Response.json(
        { error: 'No files uploaded' },
        { status: 400 }
      );
    }

    // Validate files
    const invalidFiles = [];
    const validFiles = [];

    for (const file of files) {
      if (!isValidFileType(file)) {
        invalidFiles.push(file.name);
      } else if (file.size > 50 * 1024 * 1024) { // 50MB limit
        invalidFiles.push(`${file.name} (too large)`);
      } else {
        validFiles.push(file);
      }
    }

    if (invalidFiles.length > 0) {
      return Response.json(
        { error: `Invalid files: ${invalidFiles.join(', ')}. Only STL, ZIP, images, and PDF files under 50MB are allowed.` },
        { status: 400 }
      );
    }

    // Save files and create database records
    const savedFiles = [];
    
    for (const file of validFiles) {
      try {
        // Save file to disk
        const fileData = await saveFile(file);

        // Save file metadata to database
        const fileRecord = await prisma.file.create({
          data: {
            filename: fileData.filename,
            originalName: fileData.originalName,
            filePath: fileData.filePath,
            fileType: fileData.fileType,
            fileSize: fileData.fileSize,
            caseId: caseId
          }
        });

        savedFiles.push({
          id: fileRecord.id,
          filename: fileRecord.filename,
          originalName: fileRecord.originalName,
          filePath: fileRecord.filePath,
          fileType: fileRecord.fileType,
          fileSize: fileRecord.fileSize,
          uploadedAt: fileRecord.uploadedAt
        });
      } catch (fileError) {
        console.error(`Error saving file ${file.name}:`, fileError);
        return Response.json(
          { error: `Failed to save file: ${file.name}` },
          { status: 500 }
        );
      }
    }

    return Response.json({
      message: 'Files uploaded successfully',
      files: savedFiles
    });

  } catch (error) {
    console.error('Error uploading files:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 