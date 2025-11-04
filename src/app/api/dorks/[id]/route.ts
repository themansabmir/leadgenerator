import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db/mongodb';
import { Dork } from '@/db/models';
import mongoose from 'mongoose';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
  }
  const dork = await Dork.findById(id);
  if (!dork) {
    return NextResponse.json({ success: false, error: 'Dork not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: dork });
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
  }
  const body = await request.json();
  const updatedDork = await Dork.findByIdAndUpdate(id, body, { new: true });
  if (!updatedDork) {
    return NextResponse.json({ success: false, error: 'Dork not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: updatedDork });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
  }
  const deletedDork = await Dork.findByIdAndDelete(id);
  if (!deletedDork) {
    return NextResponse.json({ success: false, error: 'Dork not found' }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
