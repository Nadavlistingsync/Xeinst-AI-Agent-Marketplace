import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create Supabase client only if environment variables are available
const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // If Supabase is not configured, return success (for development)
    if (!supabase) {
      console.log('Supabase not configured, simulating waitlist signup for:', email);
      return NextResponse.json(
        { message: 'Successfully added to waitlist (development mode)', data: { email } },
        { status: 200 }
      );
    }

    // Check if email already exists
    const { data: existingEmail } = await supabase
      .from('waitlist')
      .select('email')
      .eq('email', email)
      .single();

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Insert new email
    const { error } = await supabase
      .from('waitlist')
      .insert([
        {
          email,
          created_at: new Date().toISOString(),
          source: 'website'
        }
      ]);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to save email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Successfully added to waitlist' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Waitlist API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
