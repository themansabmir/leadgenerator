import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db/mongodb';
import { Category } from '@/db/models';
import mongoose from 'mongoose';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
  }
  const category = await Category.findById(id);
  if (!category) {
    return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: category });
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
  }
  const body = await request.json();
  const updatedCategory = await Category.findByIdAndUpdate(id, body, { new: true });
  if (!updatedCategory) {
    return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: updatedCategory });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
  }
  const deletedCategory = await Category.findByIdAndDelete(id);
  if (!deletedCategory) {
    return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
