import { NextResponse } from 'next/server';
import { createInquiry, upsertCustomer } from '@/server/repository';
import { normalizePhone } from '@/server/validation';
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.name || !body?.phone || !body?.address || !Array.isArray(body.items) || !body.message) return NextResponse.json({ error: 'Name, phone, address, products, and message are required.' }, { status: 400 });
  try {
    const customer = await upsertCustomer({ name: String(body.name), phone: normalizePhone(String(body.phone)), address: String(body.address) });
    const inquiry = await createInquiry({ customerId: customer.id, items: body.items, whatsappMessage: String(body.message) });
    return NextResponse.json({ success: true, customerId: customer.id, inquiryId: inquiry.id });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not save inquiry.' }, { status: 400 }); }
}
