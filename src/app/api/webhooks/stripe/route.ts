import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Payment system is not implemented yet" },
    { status: 501 }
  );
} 