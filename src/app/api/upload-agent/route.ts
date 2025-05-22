import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
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
    const price = formData.get('price') as string;
    const source = formData.get('source') as string;

    if (!file || !name || !description || !modelType || !framework) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const filePath = `deployments/${fileName}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('deployments')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check for duplicate slugs
    const { data: existingProduct } = await supabase
      .from('products')
      .select('slug')
      .eq('slug', slug)
      .single();

    const finalSlug = existingProduct
      ? `${slug}-${timestamp}`
      : slug;

    // Create product record
    const { data: product, error: dbError } = await supabase
      .from('products')
      .insert([
        {
          name,
          slug: finalSlug,
          description,
          model_type: modelType,
          framework,
          requirements,
          api_endpoint: apiEndpoint,
          environment,
          version,
          price: parseFloat(price),
          file_url: filePath,
          status: 'active',
          created_by: session.user.id,
          source,
        },
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to create product' },
        { status: 500 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 