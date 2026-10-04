import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { authenticateAdmin } from './repository';
const COOKIE = 'a2_admin_session';
const secret = () => process.env.SESSION_SECRET || 'local-development-only-secret-change-me';
export function signSession(payload: { id: string; email: string; role: string }) {
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 1000 * 60 * 60 * 12 })).toString('base64url');
  const signature = createHmac('sha256', secret()).update(body).digest('base64url');
  return `${body}.${signature}`;
}
export function verifySession(token?: string) {
  if (!token) return null;
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;
  const expected = createHmac('sha256', secret()).update(body).digest('base64url');
  try {
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as { id: string; email: string; role: string; exp: number };
    return payload.exp > Date.now() ? payload : null;
  } catch { return null; }
}
export async function getSession() {
  const jar = await cookies();
  return verifySession(jar.get(COOKIE)?.value);
}
export async function requireAdmin() {
  const session = await getSession();
  if (!session || session.role !== 'admin') throw new Error('Unauthorized');
  return session;
}
export async function loginAdmin(email: string, password: string) {
  const admin = await authenticateAdmin(email, password);
  if (!admin) return null;
  const jar = await cookies();
  jar.set(COOKIE, signSession(admin), { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 12, path: '/' });
  return admin;
}
export async function logoutAdmin() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
