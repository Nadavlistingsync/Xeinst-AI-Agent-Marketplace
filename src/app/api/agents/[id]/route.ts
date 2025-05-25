import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function PUT(
  request: NextRequest,
  { params }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const updates = await request.json();

    // Check if user owns the agent
    const { data: agent } = await supabase
      .from('products')
      .select('created_by')
      .eq('id', id)
      .single();

    if (!agent || agent.created_by !== session.user.email) {
      return NextResponse.json(
        { error: 'You do not have permission to edit this agent' },
        { status: 403 }
      );
    }

    // Update the agent
    const { data, error } = await supabase
      .from('products')
      .update({
        name: updates.name,
        description: updates.description,
        tag: updates.tag,
        price: updates.price,
        long_description: updates.long_description,
        features: updates.features,
        requirements: updates.requirements,
        is_public: updates.is_public,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ agent: data });
  } catch (error) {
    console.error('Error updating agent:', error);
    return NextResponse.json(
      { error: 'Failed to update agent' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Check if user owns the agent
    const { data: agent } = await supabase
      .from('products')
      .select('created_by, file_url')
      .eq('id', id)
      .single();

    if (!agent || agent.created_by !== session.user.email) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this agent' },
        { status: 403 }
      );
    }

    // Delete the file from storage if it exists
    if (agent.file_url) {
      const { error: storageError } = await supabase.storage
        .from('deployments')
        .remove([agent.file_url]);

      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
      }
    }

    // Delete the agent from the database
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting agent:', error);
    return NextResponse.json(
      { error: 'Failed to delete agent' },
      { status: 500 }
    );
  }
} 