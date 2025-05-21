import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const price = formData.get('price') as string;
  const category = formData.get('category') as string;
  const uploader_id = formData.get('uploader_id') as string;

  if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });

  // Upload file to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('products')
    .upload(`${Date.now()}_${file.name}`, file, { contentType: file.type });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  // Insert product metadata into DB
  const { data, error } = await supabase
    .from('products')
    .insert([
      {
        name,
        description,
        price: parseFloat(price),
        category,
        uploader_id,
        file_url: uploadData.path,
      },
    ])
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ product: data[0] });
} 