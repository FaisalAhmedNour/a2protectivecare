import { NextResponse } from 'next/server';
import { loginAdmin } from '@/server/auth';
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    if (!body.email || !body.password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }
    const admin = await loginAdmin(String(body.email), String(body.password));
    if (!admin) {
      return NextResponse.json({ error: 'Invalid administrator credentials.' }, { status: 401 });
    }
    return NextResponse.json({ admin: { id: admin.id, email: admin.email, role: admin.role } });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Failed to process login request.' }, { status: 500 });
  }
}
