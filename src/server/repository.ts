import { randomUUID } from 'node:crypto';
import { categories as seedCategories } from '@/data/categories';
import { gallery as seedGallery } from '@/data/gallery';
import { products as seedProducts } from '@/data/products';
import { team as seedTeam } from '@/data/team';
import type { Category, Product, TeamMember } from '@/types/catalog';
import { getPool, query } from './db';
import type { AdminSnapshot, ContactInfo, ContactMessage, Customer, GalleryRecord, Inquiry, InquiryItem } from './models';
import { hashSecret, normalizePhone, validateCategory, validateContactInfo, validateCustomer, validateGallery, validateProduct, validateTeamMember } from './validation';

const now = () => new Date().toISOString();
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export const defaultContactInfo: ContactInfo = {
  phone: '+880 1711-000000',
  whatsappNumber: '+880 1711-000000',
  email: 'care@a2protectivecare.com',
  address: 'Road 11, Banani, Dhaka-1213, Bangladesh',
  hours: 'Saturday – Thursday: 9:00 AM – 8:00 PM',
  title: 'Let’s talk about what you need.',
  description:
    'A product question, an availability inquiry, or a business conversation. Start here.',
  introduction:
    'Good conversations start with a hello. Connect directly with our team.',
  mapUrl: '',
};

declare global {
  var __a2_memory: AdminSnapshot | undefined;
}

const memory: AdminSnapshot = (globalThis.__a2_memory ??= {
  products: clone(seedProducts),
  categories: clone(seedCategories),
  team: clone(seedTeam),
  gallery: seedGallery.map((item) => ({ ...clone(item), mediaType: 'image', sourceType: 'url', mediaUrl: item.image, visible: true })),
  customers: [],
  contacts: [],
  inquiries: [],
  contactInfo: clone(defaultContactInfo),
});

function parse<T>(value: unknown, fallback: T): T {
  if (typeof value !== 'string') return (value as T) ?? fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
}

export function usingDatabase() { return Boolean(getPool()); }

export async function getSnapshot(): Promise<AdminSnapshot> {
  if (!usingDatabase()) return clone(memory);
  try {
    const [products, categories, team, gallery, customers, contacts, inquiries, settings] = await Promise.all([
      query('SELECT * FROM products ORDER BY created_at DESC'),
      query('SELECT * FROM categories ORDER BY sort_order ASC, created_at DESC'),
      query('SELECT * FROM team_members ORDER BY sort_order ASC, created_at DESC'),
      query('SELECT * FROM gallery_items WHERE visible = 1 ORDER BY sort_order ASC, created_at DESC'),
      query('SELECT c.*, COUNT(i.id) AS inquiry_count FROM customers c LEFT JOIN inquiries i ON i.customer_id = c.id GROUP BY c.id ORDER BY c.updated_at DESC'),
      query('SELECT * FROM contact_messages ORDER BY created_at DESC'),
      query('SELECT * FROM inquiries ORDER BY created_at DESC'),
      query("SELECT setting_value FROM site_settings WHERE setting_key = 'contact_info'").catch(() => []),
    ]);

    const rawContactSetting = Array.isArray(settings) && settings[0]?.setting_value
      ? parse<Partial<ContactInfo>>(settings[0].setting_value, {})
      : memory.contactInfo;
    const contactInfo = validateContactInfo(rawContactSetting || defaultContactInfo);

    return {
      products: products.map((row) => ({
        ...row,
        categoryId: row.category_id || row.categoryId,
        shortDescription: row.short_description ?? row.shortDescription ?? '',
        featured: Boolean(row.featured),
        newArrival: Boolean(row.new_arrival ?? row.newArrival),
        inStock: row.in_stock == null ? (row.inStock == null ? undefined : Boolean(row.inStock)) : Boolean(row.in_stock),
        sample: Boolean(row.sample),
        images: parse(row.images, []),
        features: parse(row.features, []),
        specifications: parse(row.specifications, undefined),
        price: row.price == null ? undefined : Number(row.price),
        salePrice: row.sale_price == null ? (row.salePrice == null ? undefined : Number(row.salePrice)) : Number(row.sale_price),
      })) as unknown as Product[],
      categories: categories.map((row) => ({
        ...row,
        featured: Boolean(row.featured),
        order: Number(row.sort_order ?? row.order ?? 0),
      })) as Category[],
      team: team.map((row) => ({
        ...row,
        order: Number(row.sort_order ?? row.order ?? 0),
        social: parse(row.social, undefined),
      })) as TeamMember[],
      gallery: gallery.map((row) => ({
        ...row,
        title: String(row.title || ''),
        category: String(row.category || 'Visual Showcase'),
        description: String(row.description || ''),
        image: String(row.image || row.media_url || '/images/hero.webp'),
        mediaUrl: row.media_url ? String(row.media_url) : undefined,
        mediaType: row.media_type || 'image',
        sourceType: row.source_type || 'url',
        mimeType: row.mime_type || undefined,
        mediaBlob: row.media_blob ? `data:${row.mime_type || 'application/octet-stream'};base64,${Buffer.from(row.media_blob as never).toString('base64')}` : undefined,
        order: Number(row.sort_order ?? row.order ?? 0),
        visible: Boolean(row.visible ?? true),
      })) as unknown as GalleryRecord[],
      customers: customers.map((row) => ({ ...row, inquiryCount: Number(row.inquiry_count || 0) })) as Customer[],
      contacts: contacts as ContactMessage[],
      inquiries: inquiries.map((row) => ({ ...row, items: parse(row.items, []), total: row.total == null ? undefined : Number(row.total) })) as unknown as Inquiry[],
      contactInfo,
    };
  } catch {
    return clone(memory);
  }
}

export async function getPublicProducts() { return (await getSnapshot()).products; }
export async function getPublicCategories() { return (await getSnapshot()).categories; }
export async function getPublicTeam() { return (await getSnapshot()).team; }
export async function getPublicGallery() {
  const all = (await getSnapshot()).gallery;
  return all
    .filter((item) => item.visible !== false)
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
}
export async function getPublicContactInfo() { return (await getSnapshot()).contactInfo || defaultContactInfo; }

export async function upsertCustomer(input: { name: string; phone: string; address: string }) {
  const phone = normalizePhone(input.phone);
  const existing = memory.customers.find((customer) => customer.phone === phone);
  const customer: Customer = existing ? { ...existing, name: input.name.trim(), address: input.address.trim(), phone, updatedAt: now() } : { id: randomUUID(), name: input.name.trim(), phone, address: input.address.trim(), createdAt: now(), updatedAt: now() };
  const index = memory.customers.findIndex((item) => item.phone === phone);
  if (index >= 0) memory.customers[index] = customer; else memory.customers.unshift(customer);
  if (usingDatabase()) {
    try {
      await query('INSERT INTO customers (id,name,phone,address,created_at,updated_at) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name), address=VALUES(address), updated_at=VALUES(updated_at)', [customer.id, customer.name, customer.phone, customer.address, customer.createdAt, customer.updatedAt]);
    } catch (e) {
      console.warn('DB upsertCustomer failed, stored in memory:', e);
    }
  }
  return customer;
}

export async function createInquiry(input: { customerId: string; items: InquiryItem[]; whatsappMessage: string }) {
  const validItems = input.items.filter((item) => item.quantity > 0);
  if (!validItems.length) throw new Error('Add at least one product.');
  const inquiry: Inquiry = { id: randomUUID(), customerId: input.customerId, items: validItems, total: validItems.every((item) => item.subtotal !== undefined) ? validItems.reduce((sum, item) => sum + (item.subtotal || 0), 0) : undefined, whatsappMessage: input.whatsappMessage, createdAt: now() };
  memory.inquiries.unshift(inquiry);
  const customer = memory.customers.find((item) => item.id === input.customerId);
  if (customer) customer.inquiryCount = (customer.inquiryCount || 0) + 1;
  if (usingDatabase()) {
    try {
      await query('INSERT INTO inquiries (id,customer_id,items,total,whatsapp_message,created_at) VALUES (?,?,?,?,?,?)', [inquiry.id, inquiry.customerId, JSON.stringify(inquiry.items), inquiry.total ?? null, inquiry.whatsappMessage, inquiry.createdAt]);
    } catch (e) {
      console.warn('DB createInquiry failed, stored in memory:', e);
    }
  }
  return inquiry;
}

export async function saveContact(input: Omit<ContactMessage, 'id' | 'status' | 'createdAt'>) {
  const contact: ContactMessage = { ...input, id: randomUUID(), status: 'new', createdAt: now() };
  memory.contacts.unshift(contact);
  if (usingDatabase()) {
    try {
      await query('INSERT INTO contact_messages (id,name,phone,email,subject,message,status,created_at) VALUES (?,?,?,?,?,?,?,?)', [contact.id, contact.name, contact.phone, contact.email, contact.subject, contact.message, contact.status, contact.createdAt]);
    } catch (e) {
      console.warn('DB saveContact failed, stored in memory:', e);
    }
  }
  return contact;
}
export async function updateContactStatus(id: string, status: ContactMessage['status']) {
  const contact = memory.contacts.find((item) => item.id === id);
  if (!contact) throw new Error('Contact message not found.');
  contact.status = status;
  if (usingDatabase()) {
    try {
      await query('UPDATE contact_messages SET status = ? WHERE id = ?', [status, id]);
    } catch (e) {
      console.warn('DB updateContactStatus failed, updated in memory:', e);
    }
  }
  return contact;
}

export async function authenticateAdmin(email: string, password: string) {
  const expectedEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const expectedPassword = process.env.ADMIN_PASSWORD || 'change-this-before-running-in-production';
  if (email.trim().toLowerCase() !== expectedEmail.toLowerCase() || hashSecret(password) !== hashSecret(expectedPassword)) return null;
  if (usingDatabase()) {
    try {
      await query('INSERT INTO admin_users (id,email,password_hash,role,created_at) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE email=VALUES(email)', ['env-admin', expectedEmail, hashSecret(expectedPassword), 'admin', now()]);
    } catch (e) {
      console.warn('DB admin_users sync failed, proceeding with env auth:', e);
    }
  }
  return { id: 'env-admin', email: expectedEmail, role: 'admin' as const, createdAt: now() };
}

export async function saveResource(
  resource: keyof AdminSnapshot,
  input: Record<string, unknown>,
  id?: string
) {
  if (resource === 'contactInfo') {
    const validated = validateContactInfo(input as Partial<ContactInfo>);
    memory.contactInfo = validated;
    if (usingDatabase()) {
      try {
        await query(
          'CREATE TABLE IF NOT EXISTS site_settings (setting_key VARCHAR(100) PRIMARY KEY, setting_value LONGTEXT NOT NULL, updated_at DATETIME NOT NULL)'
        );
        await query(
          'INSERT INTO site_settings (setting_key, setting_value, updated_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE setting_value=VALUES(setting_value), updated_at=VALUES(updated_at)',
          ['contact_info', JSON.stringify(validated), now()]
        );
      } catch (e) {
        console.warn('DB saveResource(contactInfo) failed, stored in memory:', e);
      }
    }
    return validated;
  }
  if (resource === 'contacts') {
    const targetId = id || String(input.id || '');
    if (targetId && input.status) {
      return await updateContactStatus(targetId, input.status as ContactMessage['status']);
    }
  }
  if (resource === 'products') {
    const value = validateProduct(input as Partial<Product>) as Product;
    const product = { ...value, id: id || String(value.id || randomUUID()), sample: Boolean(value.sample) };
    const index = memory.products.findIndex((item) => item.id === id);
    if (index >= 0) memory.products[index] = { ...memory.products[index], ...product }; else memory.products.unshift(product);
    if (usingDatabase()) {
      try {
        await query('INSERT INTO products (id,name,slug,sku,category_id,short_description,description,price,sale_price,featured,new_arrival,in_stock,images,features,specifications,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),sku=VALUES(sku),category_id=VALUES(category_id),short_description=VALUES(short_description),description=VALUES(description),price=VALUES(price),sale_price=VALUES(sale_price),featured=VALUES(featured),new_arrival=VALUES(new_arrival),in_stock=VALUES(in_stock),images=VALUES(images),features=VALUES(features),specifications=VALUES(specifications),updated_at=VALUES(updated_at)', [product.id, product.name, product.slug, product.sku || null, product.categoryId, product.shortDescription, product.description, product.price ?? null, product.salePrice ?? null, product.featured ? 1 : 0, product.newArrival ? 1 : 0, product.inStock == null ? null : product.inStock ? 1 : 0, JSON.stringify(product.images || []), JSON.stringify(product.features || []), JSON.stringify(product.specifications || null), now(), now()]);
      } catch (e) {
        console.warn('DB saveResource(products) failed, stored in memory:', e);
      }
    }
    return product;
  }
  if (resource === 'categories') {
    const value = validateCategory(input as Partial<Category>) as Category;
    const category: Category = { ...value, id: id || String(value.id || (input.id as string) || randomUUID()) };
    const index = memory.categories.findIndex((item) => item.id === (id || category.id));
    if (index >= 0) memory.categories[index] = { ...memory.categories[index], ...category }; else memory.categories.unshift(category);
    if (usingDatabase()) {
      try {
        await query(
          'INSERT INTO categories (id,name,slug,description,image,featured,sort_order,created_at) VALUES (?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name),slug=VALUES(slug),description=VALUES(description),image=VALUES(image),featured=VALUES(featured),sort_order=VALUES(sort_order)',
          [category.id, category.name, category.slug, category.description, category.image, category.featured === false ? 0 : 1, category.order ?? 0, now()]
        );
      } catch (e) {
        console.warn('DB saveResource(categories) failed, stored in memory:', e);
      }
    }
    return category;
  }
  if (resource === 'customers') {
    const value = validateCustomer(input as Partial<Customer>);
    const existing = memory.customers.find((c) => c.id === id || c.phone === value.phone);
    const customer: Customer = {
      id: id || existing?.id || String(value.id || randomUUID()),
      name: value.name,
      phone: value.phone,
      address: value.address,
      createdAt: existing?.createdAt || now(),
      updatedAt: now(),
      inquiryCount: existing?.inquiryCount || 0,
    };
    const index = memory.customers.findIndex((item) => item.id === customer.id || item.phone === customer.phone);
    if (index >= 0) memory.customers[index] = { ...memory.customers[index], ...customer };
    else memory.customers.unshift(customer);
    if (usingDatabase()) {
      try {
        await query(
          'INSERT INTO customers (id,name,phone,address,created_at,updated_at) VALUES (?,?,?,?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name), phone=VALUES(phone), address=VALUES(address), updated_at=VALUES(updated_at)',
          [customer.id, customer.name, customer.phone, customer.address, customer.createdAt, customer.updatedAt]
        );
      } catch (e) {
        console.warn('DB saveResource(customers) failed, stored in memory:', e);
      }
    }
    return customer;
  }
  if (resource === 'gallery') {
    const validated = validateGallery(input as Parameters<typeof validateGallery>[0]);
    const record = {
      ...validated,
      id: id || String(validated.id || (input.id as string) || randomUUID()),
    } as unknown as GalleryRecord;
    const index = memory.gallery.findIndex((item) => item.id === (id || record.id));
    if (index >= 0) memory.gallery[index] = { ...memory.gallery[index], ...record };
    else memory.gallery.unshift(record);
    if (usingDatabase()) {
      try {
        await query(
          'INSERT INTO gallery_items (id,title,description,category,image,media_type,source_type,media_url,mime_type,media_blob,visible,sort_order,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE title=VALUES(title),description=VALUES(description),category=VALUES(category),image=VALUES(image),media_type=VALUES(media_type),source_type=VALUES(source_type),media_url=VALUES(media_url),mime_type=VALUES(mime_type),media_blob=VALUES(media_blob),visible=VALUES(visible),sort_order=VALUES(sort_order)',
          [
            record.id,
            record.title,
            record.description || '',
            record.category || 'Visual Showcase',
            record.image || record.mediaUrl || '/images/hero.webp',
            record.mediaType || 'image',
            record.sourceType || 'url',
            record.mediaUrl || null,
            record.mimeType || null,
            record.mediaBlob ? Buffer.from(String(record.mediaBlob).split(',').pop() || '', 'base64') : null,
            record.visible !== false ? 1 : 0,
            record.order || 0,
            now(),
          ]
        );
      } catch (e) {
        console.warn('DB saveResource(gallery) failed, stored in memory:', e);
      }
    }
    return record;
  }
  if (resource === 'team') {
    const value = validateTeamMember(input as Partial<TeamMember>);
    const member: TeamMember = {
      ...value,
      id: id || String(value.id || (input.id as string) || randomUUID()),
    };
    const index = memory.team.findIndex((item) => item.id === (id || member.id));
    if (index >= 0) memory.team[index] = { ...memory.team[index], ...member };
    else memory.team.unshift(member);
    if (usingDatabase()) {
      try {
        await query(
          'INSERT INTO team_members (id,name,designation,photo,bio,social,sort_order,created_at) VALUES (?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name),designation=VALUES(designation),photo=VALUES(photo),bio=VALUES(bio),social=VALUES(social),sort_order=VALUES(sort_order)',
          [member.id, member.name, member.designation, member.photo || null, member.bio, JSON.stringify(member.social || []), member.order ?? 0, now()]
        );
      } catch (e) {
        console.warn('DB saveResource(team) failed, stored in memory:', e);
      }
    }
    return member;
  }
  const list = memory[resource] as unknown as Array<Record<string, unknown> & { id: string }>;
  const record: Record<string, unknown> & { id: string } = { ...input, id: id || String(input.id || randomUUID()) };
  const index = list.findIndex((item) => item.id === id);
  if (index >= 0) list[index] = { ...list[index], ...record };
  else list.unshift(record);
  return record;
}

export async function deleteResource(
  resource: keyof AdminSnapshot,
  id: string
) {
  const list = memory[resource] as unknown as Array<Record<string, unknown> & { id: string }>;
  if (Array.isArray(list)) {
    const index = list.findIndex((item) => item.id === id);
    if (index >= 0) list.splice(index, 1);
  }
  if (usingDatabase()) {
    try {
      const tableMap: Record<string, string> = {
        products: 'products',
        categories: 'categories',
        team: 'team_members',
        gallery: 'gallery_items',
        customers: 'customers',
        contacts: 'contact_messages',
        inquiries: 'inquiries',
      };
      const table = tableMap[resource];
      if (table) {
        await query(`DELETE FROM ${table} WHERE id = ?`, [id]);
      }
    } catch (e) {
      console.warn(`DB deleteResource(${resource}) failed, removed from memory:`, e);
    }
  }
  return true;
}
