import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

// Batch scan schema - expecting an array of items to scan
const BatchScanSchema = z.object({
  name: z.string().min(1),
  items: z.array(z.object({
    contentType: z.enum(['text', 'image', 'video', 'url']),
    contentName: z.string(),
    fileUrl: z.string().url().optional(),
  })).min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = BatchScanSchema.safeParse(body);
    
    if (!validated.success) {
      return NextResponse.json({ error: 'Invalid request', details: validated.error.errors }, { status: 400 });
    }
    
    const { name, items } = validated.data;
    const userId = "mock-user-id"; // In reality, use getSession() from next-auth

    // Create a batch job in the database
    const batchJob = await db.batchJob.create({
      data: {
        userId,
        name,
        totalItems: items.length,
        status: 'queued',
      },
    });

    // Create scans linked to the batch
    await db.scan.createMany({
      data: items.map(item => ({
        userId,
        batchId: batchJob.id,
        contentName: item.contentName,
        contentType: item.contentType,
        fileUrl: item.fileUrl,
        status: 'queued',
      })),
    });

    // In a real application, you would now trigger a background job here
    // using a queueing system like BullMQ (e.g., `queue.add('process-batch', { batchId: batchJob.id })`)

    return NextResponse.json({ batchId: batchJob.id, status: 'queued' });
  } catch (error) {
    console.error('Batch creation failed:', error);
    return NextResponse.json({ error: 'Failed to queue batch job' }, { status: 500 });
  }
}
