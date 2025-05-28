import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Perform a simple query to check DB connection
    await db.execute('SELECT 1');
    return NextResponse.json({ status: 'ok' });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
} 