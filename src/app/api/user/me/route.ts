import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { isDatabaseAvailable, createDatabaseErrorResponse } from "../../../lib/db-check";

export async function GET(_req: NextRequest) {
    // Check if database is available
    if (!isDatabaseAvailable()) {
      return NextResponse.json(
        createDatabaseErrorResponse(),
        { status: 503 }
      );
    }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      credits: true,
    },
  });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  return NextResponse.json(user);
} 