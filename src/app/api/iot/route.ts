import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { iotMetrics } from '@/db/schema';
import { eq, and, gte, lte, asc } from 'drizzle-orm';

const VALID_METRICS = ['heart_rate', 'steps', 'sleep_hours'] as const;
type ValidMetric = typeof VALID_METRICS[number];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const metric = searchParams.get('metric');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const limit = Math.min(parseInt(searchParams.get('limit') || '100'), 1000);
    const offset = parseInt(searchParams.get('offset') || '0');

    // Validate metric if provided
    if (metric && !VALID_METRICS.includes(metric as ValidMetric)) {
      return NextResponse.json({ 
        error: 'Invalid metric type. Valid values are: heart_rate, steps, sleep_hours',
        code: 'INVALID_METRIC'
      }, { status: 400 });
    }

    const whereConditions = [];

    if (metric) {
      whereConditions.push(eq(iotMetrics.metric, metric));
    }

    // Validate and apply timestamp filters
    if (from) {
      const fromMs = parseInt(from);
      if (isNaN(fromMs)) {
        return NextResponse.json({ 
          error: 'Invalid "from" timestamp',
          code: 'INVALID_TIMESTAMP'
        }, { status: 400 });
      }
      whereConditions.push(gte(iotMetrics.recordedAt, fromMs));
    }

    if (to) {
      const toMs = parseInt(to);
      if (isNaN(toMs)) {
        return NextResponse.json({ 
          error: 'Invalid "to" timestamp',
          code: 'INVALID_TIMESTAMP'
        }, { status: 400 });
      }
      whereConditions.push(lte(iotMetrics.recordedAt, toMs));
    }

    // Build query
    let dataQuery = db.select({
      recorded_at: iotMetrics.recordedAt,
      value: iotMetrics.value
    }).from(iotMetrics)
      .orderBy(asc(iotMetrics.recordedAt));

    // Apply where conditions
    if (whereConditions.length > 0) {
      dataQuery = dataQuery.where(whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions));
    }

    const results = await dataQuery.limit(limit).offset(offset);

    // Calculate summary statistics
    let summary = {};
    if (results.length > 0) {
      const values = results.map(r => r.value);
      summary = {
        latest: values[values.length - 1],
        average: parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)),
        min: Math.min(...values),
        max: Math.max(...values)
      };
    }

    return NextResponse.json({
      data: results,
      summary
    });
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
    const { metric, value, recorded_at } = body;
    
    if (!metric || !VALID_METRICS.includes(metric as ValidMetric)) {
      return NextResponse.json({ 
        error: 'Metric is required and must be one of: heart_rate, steps, sleep_hours',
        code: 'INVALID_METRIC'
      }, { status: 400 });
    }
    
    if (value === undefined || value === null || isNaN(parseFloat(value))) {
      return NextResponse.json({ 
        error: 'Value is required and must be a valid number',
        code: 'INVALID_VALUE'
      }, { status: 400 });
    }
    
    if (!recorded_at || isNaN(parseInt(recorded_at))) {
      return NextResponse.json({ 
        error: 'recorded_at is required and must be a valid unix timestamp in milliseconds',
        code: 'INVALID_TIMESTAMP'
      }, { status: 400 });
    }

    const parsedValue = parseFloat(value);
    if (parsedValue < 0) {
      return NextResponse.json({ 
        error: 'Value must be a positive number',
        code: 'INVALID_VALUE_RANGE'
      }, { status: 400 });
    }
    
    const newMetric = await db.insert(iotMetrics).values({
      metric,
      value: parsedValue,
      recordedAt: parseInt(recorded_at),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }).returning();
    
    return NextResponse.json(newMetric[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}