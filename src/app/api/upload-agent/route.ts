import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
// import { withEnhancedErrorHandling, ErrorCategory, ErrorSeverity, EnhancedAppError } from '@/lib/enhanced-error-handling';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  try {
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check user upload limits
    const userUploadCount = await prisma.deployment.count({
      where: { createdBy: session.user.id }
    });

    const maxUploads = 50; // Limit users to 50 agents
    if (userUploadCount >= maxUploads) {
      return NextResponse.json(
        { success: false, error: 'Upload limit exceeded' },
        { status: 429 }
      );
    }

    // Parse form data
    let formData;
    try {
      formData = await req.formData();
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid form data' },
        { status: 400 }
      );
    }

    // Extract and validate form fields
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const isPublic = formData.get('isPublic') === 'true';
    const tags = formData.get('tags') ? JSON.parse(formData.get('tags') as string) : [];
    const pricePerRun = formData.get('pricePerRun') ? parseFloat(formData.get('pricePerRun') as string) : 1;

    // Validate required fields
    if (!file || !name || !description) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate file type and size
    if (!file.name.endsWith('.zip')) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type' },
        { status: 400 }
      );
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      return NextResponse.json(
        { success: false, error: 'File too large' },
        { status: 400 }
      );
    }

    // Validate name and description
    if (name.length < 1 || name.length > 100) {
      return NextResponse.json(
        { success: false, error: 'Invalid agent name' },
        { status: 400 }
      );
    }

    if (description.length < 1 || description.length > 1000) {
      return NextResponse.json(
        { success: false, error: 'Invalid description' },
        { status: 400 }
      );
    }

    // Validate price
    if (pricePerRun < 0 || pricePerRun > 1000) {
      return NextResponse.json(
        { success: false, error: 'Invalid price' },
        { status: 400 }
      );
    }

    // Validate tags
    if (tags.length > 10) {
      return NextResponse.json(
        { success: false, error: 'Too many tags' },
        { status: 400 }
      );
    }

    // Check for duplicate agent names for this user
    const existingAgent = await prisma.deployment.findFirst({
      where: {
        createdBy: session.user.id,
        name: name
      }
    });

    if (existingAgent) {
      return NextResponse.json(
        { success: false, error: 'Agent name already exists' },
        { status: 409 }
      );
    }

    // Upload file to S3 with enhanced error handling
    const fileExt = file.name.split('.').pop();
    const s3Key = `uploads/${session.user.id}/${uuidv4()}.${fileExt}`;
    
    let buffer;
    try {
      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'File processing failed' },
        { status: 500 }
      );
    }

    try {
      await s3.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: buffer,
        ContentType: file.type,
        Metadata: {
          uploadedBy: session.user.id,
          originalName: file.name,
          fileSize: file.size.toString(),
          uploadTimestamp: new Date().toISOString(),
        },
      }));
    } catch (error) {
      console.error('S3 upload error:', error);
      return NextResponse.json(
        { success: false, error: 'File upload failed' },
        { status: 500 }
      );
    }

    // Create agent in database with enhanced metadata
    let agent;
    try {
      agent = await prisma.deployment.create({
        data: {
          name,
          description,
          createdBy: session.user.id,
          isPublic,
          version: '1.0.0',
          environment: 'production',
          framework: 'custom',
          modelType: 'custom',
          status: 'active',
          accessLevel: isPublic ? 'public' : 'private',
          licenseType: 'free',
          deployedBy: session.user.id,
          startDate: new Date(),
          rating: 0,
          totalRatings: 0,
          downloadCount: 0,
          health: {
            originalFileName: file.name,
            fileSize: file.size,
            uploadTimestamp: new Date().toISOString(),
            uploadMethod: 'web_upload',
            validationPassed: true,
            tags: tags,
          },
          source: s3Key,
          pricePerRun: pricePerRun,
        }
      });
    } catch (error) {
      console.error('Database creation error:', error);
      
      // Try to clean up S3 file if database creation fails
      try {
        await s3.send(new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: s3Key,
        }));
      } catch (cleanupError) {
        console.error('Failed to cleanup S3 file:', cleanupError);
      }

      return NextResponse.json(
        { success: false, error: 'Agent creation failed' },
        { status: 500 }
      );
    }

    // Log successful upload
    await prisma.agentLog.create({
      data: {
        deploymentId: agent.id,
        level: 'info',
        message: 'Agent uploaded successfully',
        metadata: {
          uploadedBy: session.user.id,
          fileSize: file.size,
          isPublic,
          pricePerRun,
          tags,
        },
      },
    });

    return NextResponse.json({ 
      success: true, 
      data: { 
        id: agent.id,
        name: agent.name,
        description: agent.description,
        isPublic: agent.isPublic,
        pricePerRun: agent.pricePerRun,
        tags: tags,
        fileUrl: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`,
        uploadTimestamp: new Date().toISOString(),
      } 
    });

  } catch (error) {
    console.error('POST /api/upload-agent error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload agent' },
      { status: 500 }
    );
  }
} 