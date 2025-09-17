import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { historyItems } from '@/db/schema';
import { eq, and, desc, asc } from 'drizzle-orm';

const VALID_TYPES = ['visit', 'prescription', 'test_result'];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type');
    const order = searchParams.get('order') || 'desc';
    
    let query = db.select().from(historyItems);
    
    if (type && VALID_TYPES.includes(type)) {
      query = query.where(eq(historyItems.type, type));
    }
    
    const orderBy = order === 'asc' ? asc(historyItems.date) : desc(historyItems.date);
    const results = await query.orderBy(orderBy).limit(limit).offset(offset);
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, title, description, date } = body;
    
    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json({ 
        error: 'Type is required and must be one of: visit, prescription, test_result',
        code: 'INVALID_TYPE'
      }, { status: 400 });
    }
    
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Title is required and must be a non-empty string',
        code: 'INVALID_TITLE'
      }, { status: 400 });
    }
    
    if (!date || isNaN(parseInt(date))) {
      return NextResponse.json({ 
        error: 'Date is required and must be a valid unix timestamp in milliseconds',
        code: 'INVALID_DATE'
      }, { status: 400 });
    }
    
    const newItem = await db.insert(historyItems).values({
      type,
      title: title.trim(),
      description: description?.trim() || null,
      date: parseInt(date),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }).returning();
    
    return NextResponse.json(newItem[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid ID is required',
        code: 'INVALID_ID'
      }, { status: 400 });
    }
    
    const deleted = await db.delete(historyItems)
      .where(eq(historyItems.id, parseInt(id)))
      .returning();
    
    if (deleted.length === 0) {
      return NextResponse.json({ 
        error: 'History item not found',
        code: 'RECORD_NOT_FOUND'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      message: 'History item deleted successfully',
      deletedItem: deleted[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}