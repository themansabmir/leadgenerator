import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db/mongodb';
import { Category } from '@/db/models';
import mongoose from 'mongoose';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
  }
  const category = await Category.findById(params.id);
  if (!category) {
    return NextResponse.json({ message: 'Category not found' }, { status: 404 });
  }
  return NextResponse.json(category);
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
  }
  const body = await request.json();
  const updatedCategory = await Category.findByIdAndUpdate(params.id, body, { new: true });
  if (!updatedCategory) {
    return NextResponse.json({ message: 'Category not found' }, { status: 404 });
  }
  return NextResponse.json(updatedCategory);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  if (!mongoose.Types.ObjectId.isValid(params.id)) {
    return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
  }
  const deletedCategory = await Category.findByIdAndDelete(params.id);
  if (!deletedCategory) {
    return NextResponse.json({ message: 'Category not found' }, { status: 404 });
  }
  return NextResponse.json({ message: 'Category deleted successfully' });
}
