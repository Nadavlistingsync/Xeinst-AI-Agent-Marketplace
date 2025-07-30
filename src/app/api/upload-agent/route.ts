import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { withEnhancedErrorHandling, ErrorCategory, ErrorSeverity, EnhancedAppError } from '@/lib/enhanced-error-handling';

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
  
  return withEnhancedErrorHandling(async () => {
    if (!session?.user?.id) {
      throw new EnhancedAppError(
        'Authentication required',
        401,
        ErrorCategory.AUTHENTICATION,
        ErrorSeverity.MEDIUM,
        'AUTH_REQUIRED',
        null,
        false,
        undefined,
        'Please sign in to upload agents',
        ['Sign in to your account', 'Check your credentials']
      );
    }

    // Check user upload limits
    const userUploadCount = await prisma.deployment.count({
      where: { createdBy: session.user.id }
    });

    const maxUploads = 50; // Limit users to 50 agents
    if (userUploadCount >= maxUploads) {
      throw new EnhancedAppError(
        'Upload limit exceeded',
        429,
        ErrorCategory.RATE_LIMIT,
        ErrorSeverity.MEDIUM,
        'UPLOAD_LIMIT_EXCEEDED',
        { current: userUploadCount, limit: maxUploads },
        false,
        undefined,
        `You have reached the maximum of ${maxUploads} agent uploads`,
        ['Delete some existing agents', 'Contact support for limit increase']
      );
    }

    // Parse form data
    let formData;
    try {
      formData = await req.formData();
    } catch (error) {
      throw new EnhancedAppError(
        'Invalid form data',
        400,
        ErrorCategory.VALIDATION,
        ErrorSeverity.MEDIUM,
        'INVALID_FORM_DATA',
        null,
        false,
        undefined,
        'Failed to parse upload form data',
        ['Check your upload format', 'Try uploading again']
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
      throw new EnhancedAppError(
        'Missing required fields',
        400,
        ErrorCategory.VALIDATION,
        ErrorSeverity.MEDIUM,
        'MISSING_REQUIRED_FIELDS',
        { provided: { hasFile: !!file, hasName: !!name, hasDescription: !!description } },
        false,
        undefined,
        'Please provide all required fields: file, name, and description',
        ['Check all required fields are filled', 'Ensure file is selected']
      );
    }

    // Validate file type and size
    if (!file.name.endsWith('.zip')) {
      throw new EnhancedAppError(
        'Invalid file type',
        400,
        ErrorCategory.VALIDATION,
        ErrorSeverity.MEDIUM,
        'INVALID_FILE_TYPE',
        { fileName: file.name, fileType: file.type },
        false,
        undefined,
        'Only ZIP files are allowed for agent uploads',
        ['Convert your file to ZIP format', 'Check file extension']
      );
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      throw new EnhancedAppError(
        'File too large',
        400,
        ErrorCategory.VALIDATION,
        ErrorSeverity.MEDIUM,
        'FILE_TOO_LARGE',
        { fileSize: file.size, maxSize: 50 * 1024 * 1024 },
        false,
        undefined,
        'File size exceeds 50MB limit',
        ['Compress your file', 'Reduce file size', 'Split into smaller files']
      );
    }

    // Validate name and description
    if (name.length < 1 || name.length > 100) {
      throw new EnhancedAppError(
        'Invalid agent name',
        400,
        ErrorCategory.VALIDATION,
        ErrorSeverity.MEDIUM,
        'INVALID_AGENT_NAME',
        { nameLength: name.length, minLength: 1, maxLength: 100 },
        false,
        undefined,
        'Agent name must be between 1 and 100 characters',
        ['Shorten or lengthen the name', 'Use descriptive but concise names']
      );
    }

    if (description.length < 1 || description.length > 1000) {
      throw new EnhancedAppError(
        'Invalid description',
        400,
        ErrorCategory.VALIDATION,
        ErrorSeverity.MEDIUM,
        'INVALID_DESCRIPTION',
        { descriptionLength: description.length, minLength: 1, maxLength: 1000 },
        false,
        undefined,
        'Description must be between 1 and 1000 characters',
        ['Shorten or lengthen the description', 'Provide clear but concise description']
      );
    }

    // Validate price
    if (pricePerRun < 0 || pricePerRun > 1000) {
      throw new EnhancedAppError(
        'Invalid price',
        400,
        ErrorCategory.VALIDATION,
        ErrorSeverity.MEDIUM,
        'INVALID_PRICE',
        { price: pricePerRun, minPrice: 0, maxPrice: 1000 },
        false,
        undefined,
        'Price must be between 0 and 1000 credits',
        ['Set a price between 0 and 1000', 'Consider market rates']
      );
    }

    // Validate tags
    if (tags.length > 10) {
      throw new EnhancedAppError(
        'Too many tags',
        400,
        ErrorCategory.VALIDATION,
        ErrorSeverity.MEDIUM,
        'TOO_MANY_TAGS',
        { tagCount: tags.length, maxTags: 10 },
        false,
        undefined,
        'Maximum 10 tags allowed',
        ['Reduce number of tags', 'Combine similar tags']
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
      throw new EnhancedAppError(
        'Agent name already exists',
        409,
        ErrorCategory.VALIDATION,
        ErrorSeverity.MEDIUM,
        'DUPLICATE_AGENT_NAME',
        { existingAgentId: existingAgent.id },
        false,
        undefined,
        'You already have an agent with this name',
        ['Choose a different name', 'Update existing agent', 'Delete old agent first']
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
      throw new EnhancedAppError(
        'File processing failed',
        500,
        ErrorCategory.FILE_UPLOAD,
        ErrorSeverity.HIGH,
        'FILE_PROCESSING_ERROR',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        true, // Retryable
        5000, // Retry after 5 seconds
        'Failed to process uploaded file',
        ['Try uploading again', 'Check file integrity', 'Use a different file']
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
      throw new EnhancedAppError(
        'File upload failed',
        500,
        ErrorCategory.FILE_UPLOAD,
        ErrorSeverity.HIGH,
        'S3_UPLOAD_FAILED',
        { error: error instanceof Error ? error.message : 'Unknown S3 error' },
        true, // Retryable
        10000, // Retry after 10 seconds
        'Failed to upload file to storage',
        ['Try uploading again', 'Check your connection', 'Contact support']
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

      throw new EnhancedAppError(
        'Agent creation failed',
        500,
        ErrorCategory.DATABASE,
        ErrorSeverity.HIGH,
        'AGENT_CREATION_FAILED',
        { error: error instanceof Error ? error.message : 'Unknown database error' },
        true, // Retryable
        5000, // Retry after 5 seconds
        'Failed to create agent in database',
        ['Try uploading again', 'Check your data', 'Contact support']
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

  }, { 
    endpoint: '/api/upload-agent', 
    method: 'POST',
    context: { userId: session?.user?.id }
  });
} 