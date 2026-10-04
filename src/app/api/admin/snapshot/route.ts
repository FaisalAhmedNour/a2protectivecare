import { NextResponse } from 'next/server';
import { requireAdmin } from '@/server/auth';
import { getSnapshot, usingDatabase } from '@/server/repository';
export async function GET() {
  try { await requireAdmin(); return NextResponse.json({ ...await getSnapshot(), database: usingDatabase() }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Unauthorized' }, { status: 401 }); }
}
