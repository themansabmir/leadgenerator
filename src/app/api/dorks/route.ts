import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db/mongodb';
import { Dork } from '@/db/models';

export async function GET() {
  await connectDB();
  const dorks = await Dork.find({});
  return NextResponse.json({ dorks });
}

export async function POST(request: NextRequest) {
  await connectDB();
  const body = await request.json();
  const newDork = new Dork(body);
  await newDork.save();
  return NextResponse.json(newDork);
}
