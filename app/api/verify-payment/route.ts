import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  return NextResponse.json(
    { error: 'Payment verification endpoint has been removed.' },
    { status: 410 }
  );
}
