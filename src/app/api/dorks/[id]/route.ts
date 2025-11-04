import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db/mongodb';
import { Dork } from '@/db/models';
import mongoose from 'mongoose';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
  }
  const dork = await Dork.findById(params.id);
  if (!dork) {
    return NextResponse.json({ message: 'Dork not found' }, { status: 404 });
  }
  return NextResponse.json(dork);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
  }
  const body = await request.json();
  const updatedDork = await Dork.findByIdAndUpdate(params.id, body, { new: true });
  if (!updatedDork) {
    return NextResponse.json({ message: 'Dork not found' }, { status: 404 });
  }
  return NextResponse.json(updatedDork);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
  }
  const deletedDork = await Dork.findByIdAndDelete(params.id);
  if (!deletedDork) {
    return NextResponse.json({ message: 'Dork not found' }, { status: 404 });
  }
  return NextResponse.json({ message: 'Dork deleted successfully' });
}
