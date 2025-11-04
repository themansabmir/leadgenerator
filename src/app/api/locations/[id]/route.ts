import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db/mongodb';
import { Location } from '@/db/models';
import mongoose from 'mongoose';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
  }
  const location = await Location.findById(id);
  if (!location) {
    return NextResponse.json({ success: false, error: 'Location not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: location });
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
  }
  const body = await request.json();
  const updatedLocation = await Location.findByIdAndUpdate(id, body, { new: true });
  if (!updatedLocation) {
    return NextResponse.json({ success: false, error: 'Location not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: updatedLocation });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
  }
  const deletedLocation = await Location.findByIdAndDelete(id);
  if (!deletedLocation) {
    return NextResponse.json({ success: false, error: 'Location not found' }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
