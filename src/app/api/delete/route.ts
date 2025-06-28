import { NextRequest, NextResponse } from 'next/server';
import { del } from '@vercel/blob';

export async function POST(request: NextRequest) {
  const { url } = await request.json();
  if (!url) {
    return NextResponse.json({ success: false, error: 'Missing url' }, { status: 400 });
  }
  try {
    await del(url);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to delete blob', err);
    return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 });
  }
}
