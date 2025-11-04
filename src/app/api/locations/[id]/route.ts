import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db/mongodb';
import { Location } from '@/db/models';
import mongoose from 'mongoose';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
  }
  const location = await Location.findById(params.id);
  if (!location) {
    return NextResponse.json({ message: 'Location not found' }, { status: 404 });
  }
  return NextResponse.json(location);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
  }
  const body = await request.json();
  const updatedLocation = await Location.findByIdAndUpdate(params.id, body, { new: true });
  if (!updatedLocation) {
    return NextResponse.json({ message: 'Location not found' }, { status: 404 });
  }
  return NextResponse.json(updatedLocation);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
  }
  const deletedLocation = await Location.findByIdAndDelete(params.id);
  if (!deletedLocation) {
    return NextResponse.json({ message: 'Location not found' }, { status: 404 });
  }
  return NextResponse.json({ message: 'Location deleted successfully' });
}
