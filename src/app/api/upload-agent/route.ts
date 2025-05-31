import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { Deployment } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const modelType = formData.get('modelType') as string;
    const framework = formData.get('framework') as string;
    const requirements = formData.get('requirements') as string;
    const apiEndpoint = formData.get('apiEndpoint') as string;
    const environment = formData.get('environment') as string;
    const version = formData.get('version') as string;
    const source = formData.get('source') as string;

    if (!file || !name || !description || !modelType || !framework) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Save file to local storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = join(process.cwd(), 'public', 'uploads', fileName);
    await writeFile(filePath, buffer);

    // Create deployment record
    const [deployment] = await db
      .insert(Deployment)
      .values({
        name,
        description,
        model_type: modelType,
        framework,
        requirements: requirements || null,
        api_endpoint: apiEndpoint || null,
        environment: environment || 'production',
        version,
        file_url: `/uploads/${fileName}`,
        status: 'pending',
        deployed_by: session.user.id,
        source,
      })
      .returning();

    return NextResponse.json({ deployment });
  } catch (error) {
    console.error('Error uploading agent:', error);
    return NextResponse.json(
      { error: 'Failed to upload agent' },
      { status: 500 }
    );
  }
} 