import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    console.log('Received agent data:', data);
    // TODO: Save data to a database or external service
    return NextResponse.json({ success: true, message: 'Agent uploaded successfully!' });
  } catch {
    return NextResponse.json({ success: false, message: 'Failed to upload agent.' }, { status: 500 });
  }
} 