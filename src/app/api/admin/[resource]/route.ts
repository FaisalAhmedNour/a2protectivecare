import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/server/auth';
import { deleteResource, getSnapshot, saveResource } from '@/server/repository';

const resources = ['products', 'categories', 'team', 'gallery', 'customers', 'contacts', 'inquiries', 'contactInfo'] as const;
type Resource = (typeof resources)[number];
function isResource(value: string): value is Resource {
  return resources.includes(value as Resource);
}

function triggerRevalidation() {
  try {
    revalidatePath('/', 'layout');
    revalidatePath('/products');
    revalidatePath('/categories');
    revalidatePath('/gallery');
    revalidatePath('/about');
    revalidatePath('/contact');
  } catch (e) {
    console.warn('Revalidation warning:', e);
  }
}

export async function GET(_request: Request, context: { params: Promise<{ resource: string }> }) {
  try {
    await requireAdmin();
    const { resource } = await context.params;
    if (!isResource(resource)) return NextResponse.json({ error: 'Unknown resource.' }, { status: 404 });
    const snapshot = await getSnapshot();
    if (resource === 'contactInfo') {
      return NextResponse.json({ item: snapshot.contactInfo });
    }
    return NextResponse.json({ items: snapshot[resource] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(request: Request, context: { params: Promise<{ resource: string }> }) {
  try {
    await requireAdmin();
    const { resource } = await context.params;
    if (!isResource(resource)) return NextResponse.json({ error: 'Unknown resource.' }, { status: 404 });
    const item = await saveResource(resource, await request.json());
    triggerRevalidation();
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not save resource.' }, { status: 400 });
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ resource: string }> }) {
  try {
    await requireAdmin();
    const { resource } = await context.params;
    if (!isResource(resource)) return NextResponse.json({ error: 'Unknown resource.' }, { status: 404 });
    const body = await request.json();
    const item = await saveResource(resource, body, body.id ? String(body.id) : undefined);
    triggerRevalidation();
    return NextResponse.json({ item });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not update resource.' }, { status: 400 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ resource: string }> }) {
  try {
    await requireAdmin();
    const { resource } = await context.params;
    if (!isResource(resource)) return NextResponse.json({ error: 'Unknown resource.' }, { status: 404 });
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'An id is required.' }, { status: 400 });
    await deleteResource(resource, id);
    triggerRevalidation();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not delete resource.' }, { status: 400 });
  }
}

