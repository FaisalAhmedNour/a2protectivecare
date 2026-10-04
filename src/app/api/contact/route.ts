import { NextResponse } from 'next/server';
import { saveContact } from '@/server/repository';
import { validateContact, type ContactInput } from '@/lib/contact';
export async function POST(request: Request) {
  const input = await request.json().catch(() => null) as ContactInput | null;
  if (!input) return NextResponse.json({ error: 'Invalid form data.' }, { status: 400 });
  const error = validateContact(input);
  if (error) return NextResponse.json({ error }, { status: 400 });
  const contact = await saveContact(input);
  return NextResponse.json({ success: true, contactId: contact.id });
}
