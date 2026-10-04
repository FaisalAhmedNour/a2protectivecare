import { NextResponse } from 'next/server';
import { requireAdmin } from '@/server/auth';
import { getSnapshot, updateContactStatus } from '@/server/repository';
export async function GET() { try { await requireAdmin(); return NextResponse.json({ items: (await getSnapshot()).contacts }); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); } }
export async function PATCH(request: Request) { try { await requireAdmin(); const body = await request.json(); if (!body.id || !['new', 'read', 'archived'].includes(body.status)) return NextResponse.json({ error: 'Invalid contact status.' }, { status: 400 }); return NextResponse.json({ item: await updateContactStatus(String(body.id), body.status) }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not update contact.' }, { status: 400 }); } }
