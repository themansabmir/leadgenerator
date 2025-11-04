import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db/mongodb';
import { Category } from '@/db/models';

export async function GET() {
  await connectDB();
  const categories = await Category.find({});
  return NextResponse.json({ categories });
}

export async function POST(request: NextRequest) {
  await connectDB();
  const body = await request.json();
  const newCategory = new Category(body);
  await newCategory.save();
  return NextResponse.json(newCategory);
}
