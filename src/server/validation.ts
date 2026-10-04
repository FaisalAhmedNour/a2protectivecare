import { createHash } from 'node:crypto';
import type { Category, Product, TeamMember } from '@/types/catalog';
import type { ContactInfo, Customer } from './models';

export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) throw new Error('Enter a valid phone number.');
  return `+${digits}`;
}

export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function validateProduct(input: Partial<Product>) {
  if (!input.name?.trim() || input.name.trim().length > 160) throw new Error('Product name is required.');
  if (!input.categoryId?.trim()) throw new Error('Choose a category.');
  if (input.price !== undefined && input.price !== null && (!Number.isFinite(input.price) || input.price < 0)) throw new Error('Price must be a positive amount.');
  if (input.salePrice !== undefined && input.salePrice !== null && (!Number.isFinite(input.salePrice) || input.salePrice < 0)) throw new Error('Sale price must be a positive amount.');
  if (input.price !== undefined && input.salePrice !== undefined && input.price !== null && input.salePrice !== null && input.salePrice > input.price) throw new Error('Sale price cannot exceed the regular price.');
  
  const images = Array.isArray(input.images) ? input.images.map(String).filter((img) => img.trim().length > 0) : [];
  const features = Array.isArray(input.features) ? input.features.map(String).map((f) => f.trim()).filter(Boolean) : [];
  const specifications = Array.isArray(input.specifications)
    ? input.specifications
        .filter((s) => s && typeof s === 'object' && String(s.label || '').trim() && String(s.value || '').trim())
        .map((s) => ({ label: String(s.label).trim(), value: String(s.value).trim() }))
    : undefined;

  return {
    ...input,
    name: input.name.trim(),
    slug: slugify(input.slug || input.name),
    sku: input.sku?.trim() || undefined,
    categoryId: input.categoryId.trim(),
    shortDescription: input.shortDescription?.trim() || '',
    description: input.description?.trim() || '',
    price: input.price == null || input.price === ('' as unknown) ? undefined : Number(input.price),
    salePrice: input.salePrice == null || input.salePrice === ('' as unknown) ? undefined : Number(input.salePrice),
    featured: Boolean(input.featured),
    newArrival: Boolean(input.newArrival),
    inStock: input.inStock === undefined || input.inStock === null ? undefined : Boolean(input.inStock),
    sample: Boolean(input.sample),
    images,
    features,
    specifications,
  };
}

export function validateCategory(input: Partial<Category>) {
  if (!input.name?.trim() || input.name.trim().length > 160) {
    throw new Error('Category name is required.');
  }

  const name = input.name.trim();
  const slug = slugify(input.slug || name) || slugify(name) || 'category';
  const description = input.description?.trim() || '';
  const image = input.image?.trim() || '/images/medicine.webp';
  const featured = input.featured !== false;
  const order =
    input.order !== undefined && input.order !== null && !Number.isNaN(Number(input.order))
      ? Number(input.order)
      : 0;

  return {
    ...input,
    name,
    slug,
    description,
    image,
    featured,
    order,
  };
}

export function validateCustomer(input: Partial<Customer>) {
  if (!input.name?.trim() || input.name.trim().length > 100) {
    throw new Error('Customer name is required.');
  }
  if (!input.phone?.trim()) {
    throw new Error('Customer phone number is required.');
  }
  const phone = normalizePhone(input.phone);
  if (!input.address?.trim() || input.address.trim().length < 3) {
    throw new Error('Delivery address is required.');
  }

  return {
    ...input,
    name: input.name.trim(),
    phone,
    address: input.address.trim(),
  };
}

export function validateTeamMember(input: Partial<TeamMember>) {
  if (!input.name?.trim() || input.name.trim().length > 160) {
    throw new Error('Team member name is required.');
  }
  const name = input.name.trim();
  const designation = input.designation?.trim() || 'Team Member';
  const photo = input.photo?.trim() || undefined;
  const bio = input.bio?.trim() || '';
  const order =
    input.order !== undefined && input.order !== null && !Number.isNaN(Number(input.order))
      ? Number(input.order)
      : 0;

  const social = Array.isArray(input.social)
    ? input.social
        .filter((s) => s && typeof s === 'object' && String(s.label || '').trim() && String(s.url || '').trim())
        .map((s) => ({ label: String(s.label).trim(), url: String(s.url).trim() }))
    : undefined;

  return {
    ...input,
    name,
    designation,
    photo,
    bio,
    order,
    social,
  };
}

export function validateContactInfo(input: Partial<ContactInfo>): ContactInfo {
  const phone = input.phone?.trim() || '+880 1711-000000';
  const whatsappNumber = input.whatsappNumber?.trim() || phone;
  const email = input.email?.trim() || 'care@a2protectivecare.com';
  const address = input.address?.trim() || 'Road 11, Banani, Dhaka-1213, Bangladesh';
  const hours = input.hours?.trim() || 'Saturday – Thursday: 9:00 AM – 8:00 PM';
  const title = input.title?.trim() || 'Let’s talk about what you need.';
  const description =
    input.description?.trim() ||
    'A product question, an availability inquiry, or a business conversation. Start here.';
  const introduction =
    input.introduction?.trim() ||
    'Good conversations start with a hello. Connect directly with our team.';
  const mapUrl = input.mapUrl?.trim() || '';

  return {
    phone,
    whatsappNumber,
    email,
    address,
    hours,
    title,
    description,
    introduction,
    mapUrl,
  };
}

export function validateGallery(input: {
  id?: string;
  title?: string;
  category?: string;
  description?: string;
  mediaType?: string;
  sourceType?: string;
  mediaUrl?: string;
  image?: string;
  mimeType?: string;
  mediaBlob?: string;
  order?: number;
  visible?: boolean;
}) {
  if (!input.title?.trim() || input.title.trim().length > 200) {
    throw new Error('Gallery title is required (max 200 characters).');
  }
  const title = input.title.trim();
  const category = input.category?.trim() || 'Visual Showcase';
  const description = input.description?.trim() || '';
  const mediaType = input.mediaType === 'video' ? 'video' : 'image';
  const sourceType = input.sourceType === 'blob' ? 'blob' : 'url';
  const visible = input.visible !== false;
  const order =
    input.order !== undefined && input.order !== null && !Number.isNaN(Number(input.order))
      ? Number(input.order)
      : 0;

  let mediaUrl = input.mediaUrl?.trim() || undefined;
  let image = input.image?.trim() || undefined;
  const mediaBlob = input.mediaBlob || undefined;
  const mimeType = input.mimeType || (mediaType === 'video' ? 'video/mp4' : 'image/webp');

  if (sourceType === 'url') {
    const targetUrl = mediaUrl || image;
    if (!targetUrl) {
      throw new Error('Enter an image or video URL / relative path.');
    }
    const trimmed = targetUrl.trim();
    if (trimmed.startsWith('/') || trimmed.startsWith('data:')) {
      // Relative site path or inline data-url
    } else {
      try {
        const parsed = new URL(trimmed);
        if (!['https:', 'http:'].includes(parsed.protocol)) {
          throw new Error('Media URLs must use HTTP, HTTPS, or relative site path (e.g. /images/hero.webp).');
        }
      } catch {
        throw new Error('Enter a valid URL (http://, https://) or relative site path (e.g. /images/hero.webp).');
      }
    }
    mediaUrl = trimmed;
    if (mediaType === 'image' && !image) image = trimmed;
  }

  if (sourceType === 'blob') {
    if (!mediaBlob) throw new Error('Upload a media file.');
    if (mediaBlob.length > 70_000_000) throw new Error('Uploaded media must be 50 MB or smaller.');
    if (mediaType === 'video' && !['video/mp4', 'video/webm'].includes(mimeType)) {
      throw new Error('Uploaded videos must be MP4 or WebM.');
    }
  }

  return {
    ...input,
    title,
    category,
    description,
    mediaType,
    sourceType,
    mediaUrl,
    image: image || mediaUrl || '/images/hero.webp',
    mediaBlob,
    mimeType,
    order,
    visible,
  };
}

export function hashSecret(value: string) {
  return createHash('sha256').update(value).digest('hex');
}
