import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db/mongodb';
import { Location } from '@/db/models';

export async function GET() {
  await connectDB();
  const locations = await Location.find({});
  return NextResponse.json({ locations });
}

export async function POST(request: NextRequest) {
  await connectDB();
  const body = await request.json();
  const newLocation = new Location(body);
  await newLocation.save();
  return NextResponse.json(newLocation);
}
