import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { prisma } from '@/types/prisma';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import stream from 'stream';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let name, description, modelType, framework, environment, source, filePath;

    if (req.headers.get('content-type')?.includes('application/json')) {
      // Handle GitHub link
      const body = await req.json();
      const githubUrl = body.githubUrl;
      name = body.name;
      description = body.description;
      modelType = body.modelType;
      framework = body.framework;
      environment = body.environment;
      source = body.source;

      if (!githubUrl || !name || !description || !modelType || !framework) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      // Parse repo info
      const match = githubUrl.match(/github.com\/(.+?)\/(.+?)(?:\.git)?(?:\/|$)/);
      if (!match) {
        return NextResponse.json({ error: 'Invalid GitHub URL' }, { status: 400 });
      }
      const owner = match[1];
      const repo = match[2];
      // Download default branch as zip
      const zipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/main.zip`;
      const zipRes = await fetch(zipUrl);
      if (!zipRes.ok) {
        return NextResponse.json({ error: 'Failed to fetch repo ZIP from GitHub' }, { status: 400 });
      }
      const fileName = `${Date.now()}_${repo}.zip`;
      filePath = join(process.cwd(), 'public', 'uploads', fileName);
      const fileStream = createWriteStream(filePath);
      if (!zipRes.body) throw new Error('No response body from GitHub');
      const nodeStream = stream.Readable.fromWeb(zipRes.body);
      await pipeline(nodeStream, fileStream);
    } else {
      // Handle file upload
      const formData = await req.formData();
      const file = formData.get('file') as File;
      name = formData.get('name') as string;
      description = formData.get('description') as string;
      modelType = formData.get('modelType') as string;
      framework = formData.get('framework') as string;
      environment = formData.get('environment') as string;
      source = formData.get('source') as string;

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
      filePath = join(process.cwd(), 'public', 'uploads', fileName);
      await writeFile(filePath, buffer);
    }

    // Create deployment record
    const deployment = await prisma.deployment.create({
      data: {
        name: name,
        description: description,
        accessLevel: 'public',
        licenseType: 'open-source',
        environment: environment || 'production',
        framework: framework,
        modelType: modelType,
        source: source,
        deployedBy: session.user.id,
        createdBy: session.user.id
      }
    });

    return NextResponse.json({ deployment });
  } catch (error) {
    console.error('Error uploading agent:', error);
    return NextResponse.json(
      { error: 'Failed to upload agent' },
      { status: 500 }
    );
  }
} 