import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { appointments } from '@/db/schema';
import { eq, and, or, like, desc, asc, gte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status');
    const upcoming = searchParams.get('upcoming') === 'true';

    let query = db.select().from(appointments);

    const conditions = [];
    if (status) {
      conditions.push(eq(appointments.status, status));
    }
    if (upcoming) {
      const now = Date.now();
      conditions.push(gte(appointments.date, now));
    }

    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions));
    }

    query = query.orderBy(asc(appointments.date));
    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { patient_name, doctor_name, specialty, date, notes } = body;

    if (!patient_name || !doctor_name || !specialty || !date) {
      return NextResponse.json({
        error: 'Missing required fields: patient_name, doctor_name, specialty, date',
        code: 'MISSING_REQUIRED_FIELDS'
      }, { status: 400 });
    }

    const validatedDate = parseInt(date);
    if (isNaN(validatedDate)) {
      return NextResponse.json({
        error: 'Date must be a valid unix timestamp in milliseconds',
        code: 'INVALID_DATE'
      }, { status: 400 });
    }

    const newAppointment = await db.insert(appointments).values({
      patientName: patient_name.trim(),
      doctorName: doctor_name.trim(),
      specialty: specialty.trim(),
      date: validatedDate,
      status: 'scheduled',
      notes: notes?.trim() || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }).returning();

    return NextResponse.json(newAppointment[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({
        error: 'Valid ID is required',
        code: 'INVALID_ID'
      }, { status: 400 });
    }

    const { status, date, notes } = body;
    const updates: any = {};

    if (status !== undefined) {
      if (!['scheduled', 'completed', 'canceled'].includes(status)) {
        return NextResponse.json({
          error: 'Status must be one of: scheduled, completed, canceled',
          code: 'INVALID_STATUS'
        }, { status: 400 });
      }
      updates.status = status;
    }
    if (date !== undefined) {
      const parsedDate = parseInt(date);
      if (isNaN(parsedDate)) {
        return NextResponse.json({
          error: 'Date must be a valid unix timestamp in milliseconds',
          code: 'INVALID_DATE'
        }, { status: 400 });
      }
      updates.date = parsedDate;
    }
    if (notes !== undefined) {
      updates.notes = notes?.trim() || null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({
        error: 'No fields to update',
        code: 'NO_FIELDS_TO_UPDATE'
      }, { status: 400 });
    }

    updates.updatedAt = new Date().toISOString();

    const updatedAppointment = await db.update(appointments)
      .set(updates)
      .where(eq(appointments.id, parseInt(id)))
      .returning();

    if (updatedAppointment.length === 0) {
      return NextResponse.json({
        error: 'Appointment not found',
        code: 'RECORD_NOT_FOUND'
      }, { status: 404 });
    }

    return NextResponse.json(updatedAppointment[0], { status: 200 });
  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error }, { status: 500 });
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

    const deletedAppointment = await db.delete(appointments)
      .where(eq(appointments.id, parseInt(id)))
      .returning();

    if (deletedAppointment.length === 0) {
      return NextResponse.json({
        error: 'Appointment not found',
        code: 'RECORD_NOT_FOUND'
      }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Successfully deleted appointment',
      deletedRecord: deletedAppointment[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error }, { status: 500 });
  }
}