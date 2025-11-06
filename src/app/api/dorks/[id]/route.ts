import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/db/mongodb';
import { Dork } from '@/db/models';
import mongoose from 'mongoose';
import {
  logRequestStart,
  logRequestComplete,
  logError,
  logWarn,
  logDatabaseOperation,
  createRequestContext,
} from '@/lib/utils/logger';

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const startTime = Date.now();
  const { id } = await context.params;
  const requestContext = createRequestContext('GET', `/api/dorks/${id}`, { dorkId: id });
  
  try {
    logRequestStart('GET', `/api/dorks/${id}`, requestContext);
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      logWarn(`Invalid dork ID format: ${id}`, requestContext);
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
    }
    
    logDatabaseOperation('findById', 'dorks', requestContext);
    const dork = await Dork.findById(id);
    
    if (!dork) {
      logWarn(`Dork not found: ${id}`, requestContext);
      return NextResponse.json({ success: false, error: 'Dork not found' }, { status: 404 });
    }
    
    const duration = Date.now() - startTime;
    logRequestComplete('GET', `/api/dorks/${id}`, 200, duration, requestContext);
    return NextResponse.json({ success: true, data: dork });
  } catch (error) {
    const duration = Date.now() - startTime;
    logError(`GET /api/dorks/${id} failed`, error, { ...requestContext, duration });
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const startTime = Date.now();
  const { id } = await context.params;
  const requestContext = createRequestContext('PUT', `/api/dorks/${id}`, { dorkId: id });
  
  try {
    logRequestStart('PUT', `/api/dorks/${id}`, requestContext);
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      logWarn(`Invalid dork ID format: ${id}`, requestContext);
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
    }
    
    const body = await request.json();
    logDatabaseOperation('update', 'dorks', { ...requestContext, updates: body });
    
    const updatedDork = await Dork.findByIdAndUpdate(id, body, { new: true });
    
    if (!updatedDork) {
      logWarn(`Dork not found for update: ${id}`, requestContext);
      return NextResponse.json({ success: false, error: 'Dork not found' }, { status: 404 });
    }
    
    const duration = Date.now() - startTime;
    logRequestComplete('PUT', `/api/dorks/${id}`, 200, duration, requestContext);
    return NextResponse.json({ success: true, data: updatedDork });
  } catch (error) {
    const duration = Date.now() - startTime;
    logError(`PUT /api/dorks/${id} failed`, error, { ...requestContext, duration });
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const startTime = Date.now();
  const { id } = await context.params;
  const requestContext = createRequestContext('DELETE', `/api/dorks/${id}`, { dorkId: id });
  
  try {
    logRequestStart('DELETE', `/api/dorks/${id}`, requestContext);
    await connectDB();
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      logWarn(`Invalid dork ID format: ${id}`, requestContext);
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
    }
    
    logDatabaseOperation('delete', 'dorks', requestContext);
    const deletedDork = await Dork.findByIdAndDelete(id);
    
    if (!deletedDork) {
      logWarn(`Dork not found for deletion: ${id}`, requestContext);
      return NextResponse.json({ success: false, error: 'Dork not found' }, { status: 404 });
    }
    
    const duration = Date.now() - startTime;
    logRequestComplete('DELETE', `/api/dorks/${id}`, 204, duration, requestContext);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    const duration = Date.now() - startTime;
    logError(`DELETE /api/dorks/${id} failed`, error, { ...requestContext, duration });
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
