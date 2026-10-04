'use client';

import { useMemo, useState } from 'react';
import {
  Check,
  Clock,
  Copy,
  ExternalLink,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Pencil,
  Phone,
  Plus,
  Save,
  Search,
  ShoppingBag,
  Star,
  Trash2,
  Upload,
  User,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Resource = 'products' | 'categories' | 'team' | 'gallery' | 'customers';
type Item = { id?: string; [key: string]: unknown };
type ContactInfoItem = {
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  hours: string;
  title: string;
  description: string;
  introduction: string;
  mapUrl?: string;
};
type ContactMessageItem = {
  id: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'archived';
  createdAt?: string;
  created_at?: string;
};

const display = (value: unknown) =>
  typeof value === 'string' || typeof value === 'number' ? String(value) : '';

const tabs = [
  { id: 'products', label: 'Products' },
  { id: 'categories', label: 'Categories' },
  { id: 'customers', label: 'Customers' },
  { id: 'contacts', label: 'Contacts' },
  { id: 'team', label: 'Team' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'inquiries', label: 'Inquiries' },
] as const;

const editable: Resource[] = ['products', 'categories', 'team', 'gallery', 'customers'];

export function AdminDashboard({ initialData }: { initialData: unknown }) {
  const router = useRouter();
  const [active, setActive] = useState<(typeof tabs)[number]['id']>('products');
  const [data, setData] = useState<Record<string, Item[]>>(
    (initialData as Record<string, Item[]>) || {},
  );
  const [contactInfo, setContactInfo] = useState<ContactInfoItem>(() => {
    const init = (initialData as Record<string, unknown>)?.contactInfo;
    return (init as ContactInfoItem) || {
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
  });
  const [editing, setEditing] = useState<Item | null>(null);
  const [notice, setNotice] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingCustomerInquiries, setViewingCustomerInquiries] = useState<Item | null>(null);

  const blank: Record<Resource, Item> = useMemo(
    () => ({
      products: {
        name: '',
        slug: '',
        categoryId: data.categories?.[0]?.id ? String(data.categories[0].id) : 'category-one',
        shortDescription: '',
        description: '',
        price: '',
        salePrice: '',
        sku: '',
        images: [],
        features: [],
        specifications: [],
        inStock: true,
        featured: false,
        newArrival: false,
        sample: false,
      },
      categories: {
        name: '',
        slug: '',
        description: '',
        image: '/images/medicine.webp',
        featured: true,
        order: 0,
      },
      customers: {
        name: '',
        phone: '',
        address: '',
      },
      team: { name: '', designation: '', bio: '', photo: '', order: 0, social: [] },
      gallery: {
        title: '',
        description: '',
        category: 'Brand',
        image: '/images/hero.webp',
        mediaType: 'image',
        sourceType: 'url',
        mediaUrl: '',
        mediaBlob: '',
        mimeType: '',
        visible: true,
        order: 0,
      },
    }),
    [data.categories],
  );

  const items = data[active] || [];
  const stats = useMemo(
    () => ({
      products: data.products?.length || 0,
      categories: data.categories?.length || 0,
      customers: data.customers?.length || 0,
      team: data.team?.length || 0,
      contacts: data.contacts?.length || 0,
      inquiries: data.inquiries?.length || 0,
      gallery: data.gallery?.length || 0,
    }),
    [data],
  );

  const load = async () => {
    try {
      const response = await fetch('/api/admin/snapshot', { cache: 'no-store' });
      if (response.status === 401) {
        router.push('/admin/login/');
        return;
      }
      const json = await response.json().catch(() => null);
      if (json) {
        setData(json);
        if (json.contactInfo) {
          setContactInfo(json.contactInfo);
        }
      }
    } catch {
      setNotice('Could not refresh data.');
    }
  };

  async function remove(id: string) {
    if (!id) return;
    if (active === 'categories') {
      const linked = (data.products || []).filter((p) => p.categoryId === id);
      const msg = linked.length
        ? `Delete this category? Note: ${linked.length} product(s) are currently assigned to it.`
        : 'Delete this category?';
      if (!confirm(msg)) return;
    } else {
      if (!confirm('Delete this item?')) return;
    }
    try {
      await fetch(`/api/admin/${active}?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      await load();
    } catch {
      setNotice('Could not delete item.');
    }
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing || !editable.includes(active as Resource)) return;
    const payload = { ...editing };
    for (const key of ['price', 'salePrice', 'order']) {
      if (payload[key] === '') delete payload[key];
    }
    try {
      const response = await fetch(`/api/admin/${active}`, {
        method: editing.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setNotice(result.error || 'Could not save.');
        return;
      }
      setNotice('Saved.');
      setEditing(null);
      await load();
    } catch {
      setNotice('Network error. Could not save.');
    }
  }

  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <div>
          <span className="admin-kicker">A2 PROTECTIVE CARE</span>
          <h1>Content control room</h1>
        </div>
        <button
          className="button button-outline"
          onClick={async () => {
            await fetch('/api/admin/logout', { method: 'POST' });
            router.push('/admin/login/');
          }}
        >
          <LogOut size={17} /> Sign out
        </button>
      </header>

      <div className="admin-stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
        <div>
          <span>Products</span>
          <strong>{stats.products}</strong>
        </div>
        <div>
          <span>Categories</span>
          <strong>{stats.categories}</strong>
        </div>
        <div>
          <span>Team members</span>
          <strong>{stats.team}</strong>
        </div>
        <div>
          <span>Customers</span>
          <strong>{stats.customers}</strong>
        </div>
        <div>
          <span>Messages</span>
          <strong>{stats.contacts}</strong>
        </div>
        <div>
          <span>Inquiries</span>
          <strong>{stats.inquiries}</strong>
        </div>
        <div>
          <span>Gallery media</span>
          <strong>{stats.gallery}</strong>
        </div>
      </div>

      <div className="admin-layout">
        <aside className="admin-sidebar" aria-label="Admin sections">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={active === tab.id ? 'active' : ''}
              onClick={() => {
                setActive(tab.id);
                setEditing(null);
                setSearchQuery('');
                setViewingCustomerInquiries(null);
              }}
            >
              {tab.label}
              <span>{data[tab.id]?.length || 0}</span>
            </button>
          ))}
        </aside>

        <section className="admin-content">
          <div className="admin-section-head">
            <div>
              <span className="eyebrow">Workspace</span>
              <h2>{tabs.find((tab) => tab.id === active)?.label}</h2>
            </div>
            {editable.includes(active as Resource) && (
              <button
                className="button button-primary"
                onClick={() => setEditing({ ...blank[active as Resource] })}
              >
                <Plus size={17} /> Add new
              </button>
            )}
          </div>

          {notice && (
            <p className="admin-notice" role="status">
              {notice}
            </p>
          )}

          {['customers', 'products', 'categories', 'team', 'gallery'].includes(active) && (
            <div className="admin-search-wrap">
              <Search size={16} />
              <input
                type="search"
                placeholder={`Search ${active} by keywords...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}

          {viewingCustomerInquiries && (
            <CustomerInquiriesViewer
              customer={viewingCustomerInquiries}
              inquiries={data.inquiries || []}
              onClose={() => setViewingCustomerInquiries(null)}
            />
          )}

          {editing && (
            <form className="admin-editor" onSubmit={save}>
              <div className="admin-editor-head">
                <h3>{editing.id ? 'Edit entry' : 'New entry'}</h3>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => setEditing(null)}
                  aria-label="Close editor"
                >
                  <X />
                </button>
              </div>
              <EditorFields
                active={active as Resource}
                value={editing}
                setValue={setEditing}
                categories={data.categories || []}
              />
              <button className="button button-primary" type="submit" style={{ marginTop: 15 }}>
                <Save size={17} /> Save changes
              </button>
            </form>
          )}

          {active === 'contacts' ? (
            <ContactsManager
              key={JSON.stringify(contactInfo)}
              contactInfo={contactInfo}
              setContactInfo={setContactInfo}
              contacts={(data.contacts as unknown as ContactMessageItem[]) || []}
              load={load}
              setNotice={setNotice}
            />
          ) : active === 'inquiries' ? (
            <InquiriesManager
              inquiries={data.inquiries || []}
              customers={data.customers || []}
              load={load}
              setNotice={setNotice}
            />
          ) : (
            <div className="admin-list">
              {items.length ? (
                items
                  .filter((item) => {
                    if (!searchQuery.trim()) return true;
                    const q = searchQuery.toLowerCase();
                    if (active === 'customers') {
                      return `${item.name || ''} ${item.phone || ''} ${item.address || ''}`
                        .toLowerCase()
                        .includes(q);
                    }
                    if (active === 'products') {
                      return `${item.name || ''} ${item.sku || ''} ${item.slug || ''}`
                        .toLowerCase()
                        .includes(q);
                    }
                    if (active === 'categories') {
                      return `${item.name || ''} ${item.slug || ''} ${item.description || ''}`
                        .toLowerCase()
                        .includes(q);
                    }
                    if (active === 'team') {
                      return `${item.name || ''} ${item.designation || ''} ${item.bio || ''}`
                        .toLowerCase()
                        .includes(q);
                    }
                    if (active === 'gallery') {
                      return `${item.title || ''} ${item.description || ''} ${item.category || ''} ${item.mediaType || ''}`
                        .toLowerCase()
                        .includes(q);
                    }
                    return true;
                  })
                  .map((item) => {
                    const customerInquiries =
                      active === 'customers'
                        ? (data.inquiries || []).filter(
                            (i) =>
                              i.customerId === item.id ||
                              (i.whatsappMessage &&
                                item.phone &&
                                String(i.whatsappMessage).includes(String(item.phone))),
                          )
                        : [];

                    return (
                      <article key={item.id} className="admin-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0 }}>
                          {active === 'categories' && (
                            <div className="admin-category-thumb">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={String(item.image || '/images/medicine.webp')}
                                alt={String(item.name || 'Category')}
                              />
                            </div>
                          )}

                          {active === 'team' && (
                            <div className="admin-team-thumb">
                              {item.photo ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={String(item.photo)}
                                  alt={String(item.name || 'Team Member')}
                                />
                              ) : (
                                <span>
                                  {String(item.name || 'T')
                                    .split(' ')
                                    .map((n) => n[0])
                                    .slice(0, 2)
                                    .join('') || 'T'}
                                </span>
                              )}
                            </div>
                          )}

                          {active === 'gallery' && (
                            <div className="admin-gallery-thumb">
                              {item.mediaType === 'video' ? (
                                <video src={String(item.mediaUrl || item.mediaBlob || '')} />
                              ) : (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={String(item.mediaUrl || item.image || item.mediaBlob || '/images/hero.webp')}
                                  alt={String(item.title || 'Gallery media')}
                                />
                              )}
                            </div>
                          )}

                          {active === 'customers' && (
                            <div className="admin-customer-avatar">
                              {String(item.name || 'C')
                                .split(' ')
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join('') || 'C'}
                            </div>
                          )}

                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: 6,
                              }}
                            >
                              <strong>
                                {display(item.name) ||
                                  display(item.title) ||
                                  display(item.subject) ||
                                  'Untitled'}
                              </strong>
                              {active === 'categories' && Boolean(item.featured) && (
                                <span className="admin-badge-pill">Featured</span>
                              )}
                              {active === 'categories' && (
                                <span className="admin-count-pill">
                                  {(data.products || []).filter((p) => p.categoryId === item.id).length}{' '}
                                  items
                                </span>
                              )}
                              {active === 'team' && Boolean(item.designation) && (
                                <span className="admin-badge-pill">{String(item.designation)}</span>
                              )}
                              {active === 'team' && item.order != null ? (
                                <span className="admin-count-pill">Order #{String(item.order)}</span>
                              ) : null}
                              {active === 'team' && Array.isArray(item.social) && item.social.length > 0 ? (
                                <span className="admin-count-pill">
                                  {item.social.length} link{item.social.length > 1 ? 's' : ''}
                                </span>
                              ) : null}
                              {active === 'gallery' && Boolean(item.category) && (
                                <span className="admin-badge-pill">{String(item.category)}</span>
                              )}
                              {active === 'gallery' && (
                                <span className="admin-count-pill">
                                  {item.mediaType === 'video' ? '🎬 Video' : '🖼 Image'}
                                </span>
                              )}
                              {active === 'gallery' && item.order != null ? (
                                <span className="admin-count-pill">Order #{String(item.order)}</span>
                              ) : null}
                              {active === 'gallery' && item.visible === false ? (
                                <span className="admin-badge-pill" style={{ background: 'var(--muted)', color: '#fff' }}>
                                  Hidden
                                </span>
                              ) : null}
                              {active === 'customers' && (
                                <span
                                  className="admin-count-pill"
                                  style={{ cursor: 'pointer' }}
                                  onClick={() => setViewingCustomerInquiries(item)}
                                  title="Click to view inquiries"
                                >
                                  {customerInquiries.length || Number(item.inquiryCount) || 0} inquiries
                                </span>
                              )}
                            </div>
                            <span>
                              {active === 'products' ? (
                                <>
                                  {data.categories?.find((c) => c.id === item.categoryId)?.name ? (
                                    <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                                      {String(
                                        data.categories.find((c) => c.id === item.categoryId)?.name,
                                      )}{' '}
                                      •{' '}
                                    </span>
                                  ) : null}
                                  {item.price ? `৳${item.price} • ` : ''}
                                  {item.slug ? `/products/${String(item.slug)}/` : 'No slug'}
                                </>
                              ) : active === 'categories' ? (
                                <>
                                  <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                                    {item.slug ? `/categories/${String(item.slug)}/` : 'No slug'}
                                  </span>
                                  {item.description
                                    ? ` • ${String(item.description)
                                        .replace(/^\[CATEGORY DESCRIPTION\]\s*—\s*/i, '')
                                        .slice(0, 70)}...`
                                    : ''}
                                </>
                              ) : active === 'team' ? (
                                <>
                                  <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                                    {String(item.designation || 'Team Member')}
                                  </span>
                                  {item.bio
                                    ? ` • ${String(item.bio).slice(0, 80)}${String(item.bio).length > 80 ? '...' : ''}`
                                    : ''}
                                </>
                              ) : active === 'gallery' ? (
                                <>
                                  <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                                    {String(item.category || 'Visual Showcase')}
                                  </span>
                                  {item.description
                                    ? ` • ${String(item.description).slice(0, 80)}${String(item.description).length > 80 ? '...' : ''}`
                                    : ''}
                                </>
                              ) : active === 'customers' ? (
                                <>
                                  <a
                                    href={`tel:${item.phone}`}
                                    style={{ color: 'var(--primary)', fontWeight: 600 }}
                                  >
                                    {display(item.phone)}
                                  </a>
                                  {item.address ? ` • ${display(item.address)}` : ''}
                                </>
                              ) : (
                                display(item.phone) ||
                                display(item.designation) ||
                                display(item.mediaType) ||
                                display(item.email) ||
                                'Content entry'
                              )}
                            </span>
                          </div>
                        </div>
                        <div className="admin-row-actions">
                          {active === 'products' && Boolean(item.slug) && (
                            <Link
                              href={`/products/${String(item.slug)}/`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="icon-button"
                              title="View live product page"
                              aria-label="View live product page"
                            >
                              <ExternalLink size={16} />
                            </Link>
                          )}
                          {active === 'categories' && Boolean(item.slug) && (
                            <Link
                              href={`/categories/${String(item.slug)}/`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="icon-button"
                              title="View live category page"
                              aria-label="View live category page"
                            >
                              <ExternalLink size={16} />
                            </Link>
                          )}
                          {active === 'team' && (
                            <Link
                              href="/team/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="icon-button"
                              title="View live team page"
                              aria-label="View live team page"
                            >
                              <ExternalLink size={16} />
                            </Link>
                          )}
                          {active === 'gallery' && (
                            <Link
                              href="/gallery/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="icon-button"
                              title="View live gallery page"
                              aria-label="View live gallery page"
                            >
                              <ExternalLink size={16} />
                            </Link>
                          )}
                          {active === 'customers' && Boolean(item.phone) && (
                            <a
                              href={`https://wa.me/${String(item.phone).replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="icon-button"
                              title="Chat on WhatsApp"
                              aria-label="Chat on WhatsApp"
                            >
                              <MessageSquare size={16} />
                            </a>
                          )}
                          {active === 'customers' && Boolean(item.phone) && (
                            <a
                              href={`tel:${String(item.phone)}`}
                              className="icon-button"
                              title="Call customer"
                              aria-label="Call customer"
                            >
                              <Phone size={16} />
                            </a>
                          )}
                          {active === 'customers' && (
                            <button
                              className="icon-button"
                              title="View Inquiries History"
                              aria-label="View Inquiries History"
                              onClick={() => setViewingCustomerInquiries(item)}
                            >
                              <ShoppingBag size={16} />
                            </button>
                          )}
                          {editable.includes(active as Resource) && (
                            <button
                              className="icon-button"
                              onClick={() => setEditing({ ...item })}
                              aria-label="Edit"
                              title="Edit item"
                            >
                              <Pencil size={16} />
                            </button>
                          )}
                          {editable.includes(active as Resource) && (
                            <button
                              className="icon-button danger"
                              onClick={() => remove(item.id || '')}
                              aria-label="Delete"
                              title="Delete item"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })
              ) : (
                <div className="admin-empty">No entries found. Click &quot;Add new&quot; to create one.</div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function EditorFields({
  active,
  value,
  setValue,
  categories = [],
}: {
  active: Resource;
  value: Item;
  setValue: React.Dispatch<React.SetStateAction<Item | null>>;
  categories?: Item[];
}) {
  const set = (key: string, next: unknown) =>
    setValue((current) => (current ? { ...current, [key]: next } : current));

  return (
    <div className="admin-fields">
      {active === 'products' && (
        <>
          <Field
            label="Product Name"
            value={value.name}
            onChange={(v) => set('name', v)}
            required
          />
          <Field
            label="URL Slug (leave empty to auto-generate)"
            value={value.slug}
            onChange={(v) => set('slug', v)}
          />

          <label>
            Category
            <select
              value={String(value.categoryId || (categories[0]?.id ?? 'category-one'))}
              onChange={(e) => set('categoryId', e.target.value)}
              required
            >
              {categories.map((c) => (
                <option key={String(c.id)} value={String(c.id)}>
                  {String(c.name || c.id)}
                </option>
              ))}
            </select>
          </label>

          <Field label="SKU Code" value={value.sku} onChange={(v) => set('sku', v)} />

          <Field
            label="Price (BDT)"
            type="number"
            value={value.price}
            onChange={(v) => set('price', v === '' ? '' : Number(v))}
          />
          <Field
            label="Sale Price (BDT)"
            type="number"
            value={value.salePrice}
            onChange={(v) => set('salePrice', v === '' ? '' : Number(v))}
          />

          <TextArea
            label="Short Description (Summary under price)"
            value={value.shortDescription}
            onChange={(v) => set('shortDescription', v)}
            rows={2}
          />
          <TextArea
            label="Full Description (About this product)"
            value={value.description}
            onChange={(v) => set('description', v)}
            rows={4}
          />

          {/* Multi-Image Manager */}
          <ProductImagesManager value={value} setValue={setValue} />

          {/* Feature Bullet Points Manager */}
          <ProductFeaturesManager value={value} setValue={setValue} />

          {/* Key-Value Specifications Manager */}
          <ProductSpecificationsManager value={value} setValue={setValue} />

          {/* Stock & Availability */}
          <label>
            Stock / Availability Status
            <select
              value={
                value.inStock === false
                  ? 'out_of_stock'
                  : value.inStock === true
                    ? 'in_stock'
                    : 'to_confirm'
              }
              onChange={(e) => {
                const val = e.target.value;
                set('inStock', val === 'in_stock' ? true : val === 'out_of_stock' ? false : undefined);
              }}
            >
              <option value="in_stock">Available for inquiry (In stock)</option>
              <option value="out_of_stock">Unavailable / Out of stock</option>
              <option value="to_confirm">Availability to be confirmed</option>
            </select>
          </label>

          {/* Badges & Checkboxes */}
          <div className="admin-checkbox-group">
            <label className="admin-checkbox-label">
              <input
                type="checkbox"
                checked={Boolean(value.featured)}
                onChange={(e) => set('featured', e.target.checked)}
              />
              Featured Product (Homepage & collections)
            </label>

            <label className="admin-checkbox-label">
              <input
                type="checkbox"
                checked={Boolean(value.newArrival)}
                onChange={(e) => set('newArrival', e.target.checked)}
              />
              New Arrival Badge
            </label>

            <label className="admin-checkbox-label">
              <input
                type="checkbox"
                checked={Boolean(value.sample)}
                onChange={(e) => set('sample', e.target.checked)}
              />
              Demo / Sample Listing Disclaimer
            </label>
          </div>
        </>
      )}

      {active === 'categories' && (
        <CategoryEditorFields value={value} setValue={setValue} />
      )}

      {active === 'customers' && (
        <>
          <Field
            label="Customer Full Name"
            value={value.name}
            onChange={(v) => set('name', v)}
            required
          />
          <Field
            label="Phone Number (e.g. +8801700000000)"
            type="tel"
            value={value.phone}
            onChange={(v) => set('phone', v)}
            required
          />
          <TextArea
            label="Delivery Address"
            value={value.address}
            onChange={(v) => set('address', v)}
            rows={3}
          />
        </>
      )}

      {active === 'team' && (
        <TeamEditorFields value={value} setValue={setValue} />
      )}

      {active === 'gallery' && (
        <GalleryEditorFields value={value} setValue={setValue} />
      )}
    </div>
  );
}

function ProductImagesManager({
  value,
  setValue,
}: {
  value: Item;
  setValue: React.Dispatch<React.SetStateAction<Item | null>>;
}) {
  const images = Array.isArray(value.images) ? (value.images as string[]) : [];
  const [urlInput, setUrlInput] = useState('');

  const updateImages = (next: string[]) => {
    setValue((current) => (current ? { ...current, images: next } : current));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      if (file.size > 15 * 1024 * 1024) {
        alert('Each image must be 15 MB or smaller.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setValue((current) => {
            if (!current) return current;
            const curImages = Array.isArray(current.images) ? [...current.images] : [];
            return { ...current, images: [...curImages, String(reader.result)] };
          });
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const addUrl = () => {
    if (!urlInput.trim()) return;
    updateImages([...images, urlInput.trim()]);
    setUrlInput('');
  };

  const makePrimary = (index: number) => {
    if (index <= 0 || index >= images.length) return;
    const next = [...images];
    const [selected] = next.splice(index, 1);
    next.unshift(selected);
    updateImages(next);
  };

  const removeImage = (index: number) => {
    updateImages(images.filter((_, i) => i !== index));
  };

  return (
    <div className="admin-fieldset">
      <div className="admin-fieldset-head">
        <div>
          <span className="eyebrow">Visuals</span>
          <h4>Product Images & Gallery ({images.length})</h4>
        </div>
      </div>

      <div className="admin-image-actions">
        <label className="upload-field" style={{ margin: 0 }}>
          <Upload size={17} /> Upload Image(s) from device
          <input type="file" accept="image/*" multiple onChange={handleFileUpload} />
        </label>

        <div className="admin-image-url-row">
          <input
            type="text"
            placeholder="Or enter image URL / path (e.g. /images/medicine.webp)"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addUrl();
              }
            }}
          />
          <button
            type="button"
            className="button button-outline"
            style={{ padding: '8px 14px', whiteSpace: 'nowrap' }}
            onClick={addUrl}
          >
            <Plus size={16} /> Add URL
          </button>
        </div>
      </div>

      {images.length > 0 ? (
        <div className="admin-images-grid">
          {images.map((src, index) => (
            <div key={src + index} className="admin-image-item">
              <div className="admin-image-preview">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Product preview ${index + 1}`} />
                {index === 0 && <span className="admin-image-badge">Primary</span>}
              </div>
              <div className="admin-image-item-actions">
                {index > 0 ? (
                  <button
                    type="button"
                    className="icon-button"
                    title="Make Main Image"
                    onClick={() => makePrimary(index)}
                  >
                    <Star size={14} />
                  </button>
                ) : (
                  <span style={{ fontSize: '0.7rem', color: 'var(--primary)' }}>Main</span>
                )}
                <button
                  type="button"
                  className="icon-button danger"
                  title="Remove image"
                  onClick={() => removeImage(index)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="small muted" style={{ margin: 0 }}>
          No images uploaded yet. Upload images above or add a URL path. If left empty, default concept placeholder will be used.
        </p>
      )}
    </div>
  );
}

function ProductFeaturesManager({
  value,
  setValue,
}: {
  value: Item;
  setValue: React.Dispatch<React.SetStateAction<Item | null>>;
}) {
  const features = Array.isArray(value.features) ? (value.features as string[]) : [];
  const [newFeature, setNewFeature] = useState('');

  const addFeature = () => {
    if (!newFeature.trim()) return;
    setValue((current) =>
      current ? { ...current, features: [...features, newFeature.trim()] } : current,
    );
    setNewFeature('');
  };

  const removeFeature = (index: number) => {
    setValue((current) =>
      current ? { ...current, features: features.filter((_, i) => i !== index) } : current,
    );
  };

  const updateFeature = (index: number, text: string) => {
    const next = [...features];
    next[index] = text;
    setValue((current) => (current ? { ...current, features: next } : current));
  };

  return (
    <div className="admin-fieldset">
      <div className="admin-fieldset-head">
        <div>
          <span className="eyebrow">Highlights</span>
          <h4>Product Feature Bullet Points ({features.length})</h4>
        </div>
      </div>

      <div className="admin-dynamic-row">
        <input
          type="text"
          placeholder="e.g. Product information awaiting verification"
          value={newFeature}
          onChange={(e) => setNewFeature(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addFeature();
            }
          }}
        />
        <button
          type="button"
          className="button button-outline"
          style={{ padding: '8px 14px', whiteSpace: 'nowrap' }}
          onClick={addFeature}
        >
          <Plus size={16} /> Add Bullet
        </button>
      </div>

      {features.length > 0 && (
        <div className="admin-dynamic-list">
          {features.map((feat, index) => (
            <div key={index} className="admin-dynamic-row">
              <input
                type="text"
                value={feat}
                onChange={(e) => updateFeature(index, e.target.value)}
              />
              <button
                type="button"
                className="icon-button danger"
                title="Remove bullet point"
                onClick={() => removeFeature(index)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductSpecificationsManager({
  value,
  setValue,
}: {
  value: Item;
  setValue: React.Dispatch<React.SetStateAction<Item | null>>;
}) {
  const specs = Array.isArray(value.specifications)
    ? (value.specifications as { label: string; value: string }[])
    : [];
  const [label, setLabel] = useState('');
  const [specVal, setSpecVal] = useState('');

  const presets = [
    'Manufacturer',
    'Pack size',
    'Strength',
    'Dosage form',
    'Prescription status',
    'Active ingredients',
    'Storage condition',
  ];

  const addSpec = () => {
    if (!label.trim() || !specVal.trim()) return;
    setValue((current) =>
      current
        ? {
            ...current,
            specifications: [...specs, { label: label.trim(), value: specVal.trim() }],
          }
        : current,
    );
    setLabel('');
    setSpecVal('');
  };

  const removeSpec = (index: number) => {
    setValue((current) =>
      current ? { ...current, specifications: specs.filter((_, i) => i !== index) } : current,
    );
  };

  const updateSpec = (index: number, key: 'label' | 'value', text: string) => {
    const next = [...specs];
    next[index] = { ...next[index], [key]: text };
    setValue((current) => (current ? { ...current, specifications: next } : current));
  };

  return (
    <div className="admin-fieldset">
      <div className="admin-fieldset-head">
        <div>
          <span className="eyebrow">Specifications Table</span>
          <h4>Product Information Key-Value Attributes ({specs.length})</h4>
        </div>
      </div>

      <div className="admin-presets">
        <span style={{ fontSize: '0.75rem', color: 'var(--muted)', alignSelf: 'center' }}>
          Quick presets:
        </span>
        {presets.map((preset) => (
          <button
            key={preset}
            type="button"
            className="admin-preset-btn"
            onClick={() => setLabel(preset)}
          >
            + {preset}
          </button>
        ))}
      </div>

      <div className="admin-spec-inputs">
        <input
          type="text"
          placeholder="Attribute Label (e.g. Pack size)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <input
          type="text"
          placeholder="Value (e.g. 10 x 10 Strip)"
          value={specVal}
          onChange={(e) => setSpecVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addSpec();
            }
          }}
        />
        <button
          type="button"
          className="button button-outline"
          style={{ padding: '8px 14px', whiteSpace: 'nowrap' }}
          onClick={addSpec}
        >
          <Plus size={16} /> Add Spec
        </button>
      </div>

      {specs.length > 0 && (
        <div className="admin-dynamic-list" style={{ marginTop: 8 }}>
          {specs.map((spec, index) => (
            <div key={index} className="admin-spec-row">
              <input
                type="text"
                placeholder="Label"
                value={spec.label}
                onChange={(e) => updateSpec(index, 'label', e.target.value)}
              />
              <input
                type="text"
                placeholder="Value"
                value={spec.value}
                onChange={(e) => updateSpec(index, 'value', e.target.value)}
              />
              <button
                type="button"
                className="icon-button danger"
                title="Remove specification"
                onClick={() => removeSpec(index)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
}: {
  label: string;
  value: unknown;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label>
      {label}
      <input
        type={type}
        value={String(value ?? '')}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  value: unknown;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <label>
      {label}
      <textarea
        rows={rows}
        value={String(value ?? '')}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function InquiriesManager({
  inquiries,
  customers,
  load,
  setNotice,
}: {
  inquiries: Item[];
  customers: Item[];
  load: () => Promise<void>;
  setNotice: (msg: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'with-value' | 'multi-item'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const copyText = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      alert('Could not copy automatically.');
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this inquiry record?')) return;
    setDeletingId(id);
    try {
      const response = await fetch(`/api/admin/inquiries?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setNotice('Inquiry record deleted successfully.');
        await load();
      } else {
        const res = await response.json().catch(() => ({}));
        setNotice(res.error || 'Failed to delete inquiry.');
      }
    } catch {
      setNotice('Network error deleting inquiry.');
    } finally {
      setDeletingId(null);
    }
  };

  const processedInquiries = useMemo(() => {
    return inquiries.map((inq, idx) => {
      const id = String(inq.id || `inq-${idx}`);
      const customerId = String(inq.customerId || inq.customer_id || '');
      const matchedCustomer = customers.find((c) => c.id === customerId);

      const customerName =
        String(inq.customerName || matchedCustomer?.name || inq.name || '').trim() ||
        'Unregistered Customer';
      const customerPhone = String(
        inq.customerPhone || matchedCustomer?.phone || inq.phone || '',
      ).trim();
      const customerAddress = String(
        inq.customerAddress || matchedCustomer?.address || inq.address || '',
      ).trim();

      const items = (Array.isArray(inq.items) ? (inq.items as Item[]) : []).map((it) => {
        const qty = Number(it.quantity) || 1;
        const unitPrice = it.unitPrice != null ? Number(it.unitPrice) : undefined;
        const subtotal =
          it.subtotal != null
            ? Number(it.subtotal)
            : unitPrice != null
              ? unitPrice * qty
              : undefined;
        return {
          productId: String(it.productId || ''),
          name: String(it.name || it.productId || 'Product Item'),
          quantity: qty,
          unitPrice,
          subtotal,
        };
      });

      const calculatedTotal = items.reduce(
        (sum, it) => sum + (it.subtotal != null ? it.subtotal : 0),
        0,
      );
      const total =
        inq.total != null && Number(inq.total) > 0 ? Number(inq.total) : calculatedTotal;

      const whatsappMessage = String(inq.whatsappMessage || inq.whatsapp_message || '');
      const createdAt = String(inq.createdAt || inq.created_at || '');

      return {
        raw: inq,
        id,
        customerId,
        customerName,
        customerPhone,
        customerAddress,
        items,
        total,
        whatsappMessage,
        createdAt,
      };
    });
  }, [inquiries, customers]);

  const filteredInquiries = useMemo(() => {
    return processedInquiries.filter((inq) => {
      if (filter === 'with-value' && inq.total <= 0) return false;
      if (filter === 'multi-item' && inq.items.length <= 1) return false;

      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const matchText = `${inq.id} ${inq.customerName} ${inq.customerPhone} ${inq.customerAddress} ${inq.whatsappMessage} ${inq.items.map((i) => i.name).join(' ')}`.toLowerCase();
      return matchText.includes(q);
    });
  }, [processedInquiries, filter, search]);

  const stats = useMemo(() => {
    const totalCount = processedInquiries.length;
    const totalValue = processedInquiries.reduce((sum, i) => sum + (i.total || 0), 0);
    const totalUnits = processedInquiries.reduce(
      (sum, i) => sum + i.items.reduce((s, it) => s + (it.quantity || 1), 0),
      0,
    );
    const uniqueCustomers = new Set(
      processedInquiries.map((i) => i.customerPhone || i.customerId).filter(Boolean),
    ).size;

    return {
      totalCount,
      totalValue,
      totalUnits,
      uniqueCustomers,
    };
  }, [processedInquiries]);

  const counts = useMemo(
    () => ({
      all: processedInquiries.length,
      withValue: processedInquiries.filter((i) => i.total > 0).length,
      multiItem: processedInquiries.filter((i) => i.items.length > 1).length,
    }),
    [processedInquiries],
  );

  return (
    <div className="admin-contact-workspace">
      {/* 1. Inquiries KPI Summary Statistics */}
      <div
        className="admin-stat-grid"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', margin: 0 }}
      >
        <div>
          <span>Total Inquiries</span>
          <strong>{stats.totalCount}</strong>
        </div>
        <div>
          <span>Estimated Value</span>
          <strong>৳{stats.totalValue.toLocaleString()}</strong>
        </div>
        <div>
          <span>Items / Units</span>
          <strong>{stats.totalUnits}</strong>
        </div>
        <div>
          <span>Customers</span>
          <strong>{stats.uniqueCustomers}</strong>
        </div>
      </div>

      {/* 2. Inquiries Log List Container */}
      <div className="admin-card-container">
        <div className="admin-card-header">
          <div>
            <span className="eyebrow">Customer Direct Inquiries</span>
            <h3>Inquiries Breakdown & Order Transcripts ({counts.all})</h3>
            <p className="small muted" style={{ margin: '4px 0 0' }}>
              Full breakdowns of product inquiries and orders submitted via WhatsApp & Cart checkout.
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="admin-filter-pills">
          <button
            type="button"
            className={`admin-filter-pill ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Inquiries <span>({counts.all})</span>
          </button>
          <button
            type="button"
            className={`admin-filter-pill ${filter === 'with-value' ? 'active' : ''}`}
            onClick={() => setFilter('with-value')}
          >
            With Priced Value <span>({counts.withValue})</span>
          </button>
          <button
            type="button"
            className={`admin-filter-pill ${filter === 'multi-item' ? 'active' : ''}`}
            onClick={() => setFilter('multi-item')}
          >
            Multi-Item Orders <span>({counts.multiItem})</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="admin-search-wrap">
          <Search size={16} />
          <input
            type="search"
            placeholder="Search inquiries by customer name, phone, product name, or inquiry ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Inquiry Items List */}
        {filteredInquiries.length > 0 ? (
          <div className="admin-inbox-grid">
            {filteredInquiries.map((inq) => {
              const rawPhone = inq.customerPhone.replace(/\D/g, '');
              const waReplyText = encodeURIComponent(
                `Hello ${inq.customerName}, regarding your inquiry #${inq.id.slice(0, 8)} at A2 Protective Care: We received your request and would like to confirm your order details.`,
              );

              return (
                <article
                  key={inq.id}
                  className="admin-inbox-item"
                  style={{ borderLeft: '4px solid var(--primary)', padding: '18px' }}
                >
                  {/* Top Bar: Inquiry ID, Date, BDT Total */}
                  <div className="admin-inbox-head">
                    <div>
                      <div className="admin-inbox-sender">
                        <strong style={{ fontSize: '1.05rem' }}>
                          Inquiry #{inq.id.slice(0, 10)}
                        </strong>
                        <span
                          className="admin-badge-pill"
                          style={{ margin: 0, textTransform: 'none', fontWeight: 600 }}
                        >
                          {inq.items.length} product{inq.items.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="admin-inbox-meta" style={{ marginTop: 6, gap: 16 }}>
                        <span>
                          <Clock size={13} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                          {inq.createdAt
                            ? new Date(inq.createdAt).toLocaleString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Recent'}
                        </span>
                      </div>
                    </div>

                    {inq.total > 0 && (
                      <div style={{ textAlign: 'right' }}>
                        <span
                          style={{
                            display: 'block',
                            fontSize: '0.72rem',
                            color: 'var(--muted)',
                            textTransform: 'uppercase',
                            fontWeight: 700,
                          }}
                        >
                          Total Estimate
                        </span>
                        <strong style={{ color: 'var(--primary)', fontSize: '1.25rem' }}>
                          ৳{inq.total.toLocaleString()}
                        </strong>
                      </div>
                    )}
                  </div>

                  {/* Customer Information Box */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 16,
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      padding: '10px 14px',
                      fontSize: '0.86rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <User size={15} style={{ color: 'var(--primary)' }} />
                      <strong>{inq.customerName}</strong>
                    </div>

                    {inq.customerPhone ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Phone size={15} style={{ color: 'var(--primary)' }} />
                        <a
                          href={`tel:${inq.customerPhone}`}
                          style={{ color: 'var(--primary)', textDecoration: 'underline' }}
                        >
                          {inq.customerPhone}
                        </a>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--muted)' }}>(No phone provided)</span>
                    )}

                    {inq.customerAddress && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 200, flex: 1 }}>
                        <MapPin size={15} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                        <span style={{ color: 'var(--muted)' }}>{inq.customerAddress}</span>
                      </div>
                    )}
                  </div>

                  {/* Itemized Products Breakdown Table */}
                  {inq.items.length > 0 && (
                    <div style={{ overflowX: 'auto' }}>
                      <table className="admin-inquiry-table" style={{ margin: '6px 0 0' }}>
                        <thead>
                          <tr style={{ background: 'var(--surface)' }}>
                            <th style={{ fontWeight: 700 }}>Item / Product</th>
                            <th style={{ width: 80, textAlign: 'center', fontWeight: 700 }}>Quantity</th>
                            <th style={{ width: 110, textAlign: 'right', fontWeight: 700 }}>Unit Price</th>
                            <th style={{ width: 120, textAlign: 'right', fontWeight: 700 }}>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inq.items.map((item, idx) => (
                            <tr key={idx}>
                              <td>
                                <strong>{item.name}</strong>
                                {item.productId && (
                                  <span
                                    style={{
                                      display: 'block',
                                      fontSize: '0.72rem',
                                      color: 'var(--muted)',
                                    }}
                                  >
                                    ID: {item.productId}
                                  </span>
                                )}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <span className="admin-count-pill" style={{ margin: 0 }}>
                                  {item.quantity}
                                </span>
                              </td>
                              <td style={{ textAlign: 'right' }}>
                                {item.unitPrice != null && item.unitPrice > 0
                                  ? `৳${item.unitPrice.toLocaleString()}`
                                  : '—'}
                              </td>
                              <td style={{ textAlign: 'right', fontWeight: 600 }}>
                                {item.subtotal != null && item.subtotal > 0
                                  ? `৳${item.subtotal.toLocaleString()}`
                                  : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        {inq.total > 0 && (
                          <tfoot>
                            <tr style={{ borderTop: '2px solid var(--border)' }}>
                              <td colSpan={3} style={{ textAlign: 'right', fontWeight: 700 }}>
                                Inquiry Grand Total:
                              </td>
                              <td
                                style={{
                                  textAlign: 'right',
                                  fontWeight: 750,
                                  color: 'var(--primary)',
                                  fontSize: '0.95rem',
                                }}
                              >
                                ৳{inq.total.toLocaleString()}
                              </td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  )}

                  {/* WhatsApp Message Log Transcript */}
                  {Boolean(inq.whatsappMessage) && (
                    <div
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        padding: '12px 14px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 8,
                        }}
                      >
                        <span
                          className="eyebrow"
                          style={{
                            fontSize: '0.7rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                          }}
                        >
                          <MessageSquare size={13} style={{ color: 'var(--primary)' }} />
                          WhatsApp Order Message Transcript
                        </span>
                        <button
                          type="button"
                          className="button button-outline"
                          style={{ padding: '3px 9px', fontSize: '0.74rem' }}
                          onClick={() => copyText(inq.id, inq.whatsappMessage)}
                        >
                          {copiedId === inq.id ? (
                            <>
                              <Check size={13} /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy size={13} /> Copy Message
                            </>
                          )}
                        </button>
                      </div>
                      <pre
                        style={{
                          margin: 0,
                          fontSize: '0.8rem',
                          lineHeight: 1.5,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          color: 'var(--text)',
                          fontFamily: 'inherit',
                        }}
                      >
                        {inq.whatsappMessage}
                      </pre>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="admin-inbox-actions">
                    <div className="admin-inbox-btn-group">
                      {rawPhone && (
                        <a
                          href={`https://wa.me/${rawPhone}?text=${waReplyText}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="button button-outline"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          title="Open WhatsApp chat with customer"
                        >
                          <MessageSquare size={14} /> WhatsApp Reply
                        </a>
                      )}
                      {inq.customerPhone && (
                        <a
                          href={`tel:${inq.customerPhone}`}
                          className="button button-outline"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          title="Call customer directly"
                        >
                          <Phone size={14} /> Call {inq.customerPhone}
                        </a>
                      )}
                    </div>

                    <button
                      type="button"
                      className="icon-button danger"
                      onClick={() => handleDeleteInquiry(inq.id)}
                      disabled={deletingId === inq.id}
                      title="Delete this inquiry record"
                      aria-label="Delete inquiry"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="admin-empty" style={{ padding: '40px 20px' }}>
            {search.trim()
              ? 'No inquiries match your search filter.'
              : filter === 'all'
                ? 'No inquiries recorded yet. Inquiries placed by visitors will appear here with full product breakdowns.'
                : `No inquiries match the "${filter}" filter.`}
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryEditorFields({
  value,
  setValue,
}: {
  value: Item;
  setValue: React.Dispatch<React.SetStateAction<Item | null>>;
}) {
  const set = (key: string, next: unknown) =>
    setValue((current) => (current ? { ...current, [key]: next } : current));

  const imagePresets = [
    { label: 'Medicine & Rx', path: '/images/medicine.webp' },
    { label: 'Wellness Care', path: '/images/wellness.webp' },
    { label: 'First Aid Kit', path: '/images/first-aid.webp' },
    { label: 'Care Essentials', path: '/images/essentials.webp' },
    { label: 'Hero Concept', path: '/images/hero.webp' },
    { label: 'Facility & Lab', path: '/images/about.webp' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      alert('Image must be 15 MB or smaller.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        set('image', String(reader.result));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <>
      <Field
        label="Category Name"
        value={value.name}
        onChange={(v) => set('name', v)}
        required
      />

      <Field
        label="URL Slug (leave empty to auto-generate)"
        value={value.slug}
        onChange={(v) => set('slug', v)}
      />

      <Field
        label="Display Sort Order (e.g. 0, 1, 2...)"
        type="number"
        value={value.order ?? 0}
        onChange={(v) => set('order', v === '' ? 0 : Number(v))}
      />

      <div className="admin-checkbox-group" style={{ padding: '0 0 10px 0' }}>
        <label className="admin-checkbox-label">
          <input
            type="checkbox"
            checked={value.featured !== false}
            onChange={(e) => set('featured', e.target.checked)}
          />
          Featured Collection (Highlight on homepage and primary navigation)
        </label>
      </div>

      <TextArea
        label="Description (Displayed on category page hero and collection cards)"
        value={value.description}
        onChange={(v) => set('description', v)}
        rows={3}
      />

      {/* Category Image Manager */}
      <div className="admin-fieldset">
        <div className="admin-fieldset-head">
          <div>
            <span className="eyebrow">Visual Banner</span>
            <h4>Category Cover Image</h4>
          </div>
        </div>

        <div className="admin-presets">
          <span style={{ fontSize: '0.75rem', color: 'var(--muted)', alignSelf: 'center' }}>
            Choose stock concept:
          </span>
          {imagePresets.map((preset) => (
            <button
              key={preset.path}
              type="button"
              className={`admin-preset-btn ${value.image === preset.path ? 'active' : ''}`}
              onClick={() => set('image', preset.path)}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="admin-image-actions">
          <label className="upload-field" style={{ margin: 0 }}>
            <Upload size={17} /> Upload custom image from device
            <input type="file" accept="image/*" onChange={handleFileUpload} />
          </label>

          <div className="admin-image-url-row">
            <input
              type="text"
              placeholder="Or enter image URL / path (e.g. /images/medicine.webp)"
              value={String(value.image || '')}
              onChange={(e) => set('image', e.target.value)}
            />
          </div>
        </div>

        {value.image ? (
          <div className="admin-image-picker-preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={String(value.image)} alt="Category banner preview" />
            <div style={{ minWidth: 0, flex: 1 }}>
              <strong style={{ fontSize: '0.9rem', display: 'block' }}>Current Image</strong>
              <span className="admin-helper" style={{ wordBreak: 'break-all' }}>
                {String(value.image).startsWith('data:')
                  ? 'Uploaded image from device (Data URL)'
                  : String(value.image)}
              </span>
            </div>
            <button
              type="button"
              className="button button-outline"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              onClick={() => set('image', '/images/medicine.webp')}
            >
              Reset to Default
            </button>
          </div>
        ) : null}
      </div>
    </>
  );
}

function TeamSocialsManager({
  value,
  setValue,
}: {
  value: Item;
  setValue: React.Dispatch<React.SetStateAction<Item | null>>;
}) {
  const social = Array.isArray(value.social) ? (value.social as Array<{ label: string; url: string }>) : [];

  const updateSocial = (next: Array<{ label: string; url: string }>) => {
    setValue((current) => (current ? { ...current, social: next } : current));
  };

  const addPresetLink = (label: string, placeholderUrl: string) => {
    updateSocial([...social, { label, url: placeholderUrl }]);
  };

  const updateItem = (index: number, key: 'label' | 'url', val: string) => {
    const next = [...social];
    next[index] = { ...next[index], [key]: val };
    updateSocial(next);
  };

  const removeItem = (index: number) => {
    updateSocial(social.filter((_, i) => i !== index));
  };

  const presets = [
    { label: 'LinkedIn', url: 'https://linkedin.com/in/' },
    { label: 'Twitter / X', url: 'https://x.com/' },
    { label: 'Email', url: 'mailto:' },
    { label: 'WhatsApp', url: 'https://wa.me/' },
    { label: 'Website', url: 'https://' },
    { label: 'Phone', url: 'tel:' },
  ];

  return (
    <div className="admin-fieldset">
      <div className="admin-fieldset-head">
        <div>
          <span className="eyebrow">Connect</span>
          <h4>Social & Contact Links ({social.length})</h4>
        </div>
      </div>

      <div className="admin-presets">
        <span style={{ fontSize: '0.75rem', color: 'var(--muted)', alignSelf: 'center' }}>
          Quick add:
        </span>
        {presets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            className="admin-preset-btn"
            onClick={() => addPresetLink(preset.label, preset.url)}
          >
            + {preset.label}
          </button>
        ))}
      </div>

      {social.length > 0 ? (
        <div className="admin-dynamic-list" style={{ marginTop: 10 }}>
          {social.map((item, index) => (
            <div key={index} className="admin-spec-row">
              <input
                type="text"
                placeholder="Platform / Label (e.g. LinkedIn)"
                style={{ maxWidth: 160 }}
                value={item.label || ''}
                onChange={(e) => updateItem(index, 'label', e.target.value)}
              />
              <input
                type="text"
                placeholder="URL or link (e.g. https://linkedin.com/in/... or mailto:...)"
                value={item.url || ''}
                onChange={(e) => updateItem(index, 'url', e.target.value)}
              />
              <button
                type="button"
                className="icon-button danger"
                title="Remove social link"
                onClick={() => removeItem(index)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="small muted" style={{ margin: 0 }}>
          No social links added yet. Click a quick-add button above or add custom contact links.
        </p>
      )}
    </div>
  );
}

function TeamEditorFields({
  value,
  setValue,
}: {
  value: Item;
  setValue: React.Dispatch<React.SetStateAction<Item | null>>;
}) {
  const set = (key: string, next: unknown) =>
    setValue((current) => (current ? { ...current, [key]: next } : current));

  const designationPresets = [
    'Founder & Managing Director',
    'Managing Director',
    'Chief Pharmacist',
    'Head of Operations',
    'Quality Assurance Lead',
    'Logistics & Supply Director',
    'Medical Consultant',
    'Customer Experience Specialist',
  ];

  const photoPresets = [
    { label: 'Executive / Lab', path: '/images/about.webp' },
    { label: 'Healthcare Hero', path: '/images/hero.webp' },
    { label: 'Care Specialist', path: '/images/wellness.webp' },
    { label: 'Medical Supply', path: '/images/essentials.webp' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      alert('Photo must be 15 MB or smaller.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        set('photo', String(reader.result));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <>
      <Field
        label="Full Name"
        value={value.name}
        onChange={(v) => set('name', v)}
        required
      />

      <Field
        label="Designation / Role"
        value={value.designation}
        onChange={(v) => set('designation', v)}
        required
      />

      <div className="admin-presets" style={{ marginTop: -4, marginBottom: 12 }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--muted)', alignSelf: 'center' }}>
          Role presets:
        </span>
        {designationPresets.map((role) => (
          <button
            key={role}
            type="button"
            className={`admin-preset-btn ${value.designation === role ? 'active' : ''}`}
            onClick={() => set('designation', role)}
          >
            {role}
          </button>
        ))}
      </div>

      <Field
        label="Display Sort Order (Lower numbers appear first, e.g. 0, 1, 2...)"
        type="number"
        value={value.order ?? 0}
        onChange={(v) => set('order', v === '' ? 0 : Number(v))}
      />

      <TextArea
        label="Biography / Profile Summary"
        value={value.bio}
        onChange={(v) => set('bio', v)}
        rows={4}
      />

      {/* Profile Photo Manager */}
      <div className="admin-fieldset">
        <div className="admin-fieldset-head">
          <div>
            <span className="eyebrow">Visual Avatar</span>
            <h4>Profile Photo</h4>
          </div>
        </div>

        <div className="admin-presets">
          <span style={{ fontSize: '0.75rem', color: 'var(--muted)', alignSelf: 'center' }}>
            Choose stock photo:
          </span>
          {photoPresets.map((preset) => (
            <button
              key={preset.path}
              type="button"
              className={`admin-preset-btn ${value.photo === preset.path ? 'active' : ''}`}
              onClick={() => set('photo', preset.path)}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="admin-image-actions">
          <label className="upload-field" style={{ margin: 0 }}>
            <Upload size={17} /> Upload photo from device
            <input type="file" accept="image/*" onChange={handleFileUpload} />
          </label>

          <div className="admin-image-url-row">
            <input
              type="text"
              placeholder="Or enter image URL / path (e.g. /images/about.webp or https://...)"
              value={String(value.photo || '')}
              onChange={(e) => set('photo', e.target.value)}
            />
          </div>
        </div>

        {value.photo ? (
          <div className="admin-image-picker-preview" style={{ alignItems: 'center' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={String(value.photo)}
              alt="Team member preview"
              style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }}
            />
            <div style={{ minWidth: 0, flex: 1 }}>
              <strong style={{ fontSize: '0.9rem', display: 'block' }}>Active Photo</strong>
              <span className="admin-helper" style={{ wordBreak: 'break-all' }}>
                {String(value.photo).startsWith('data:')
                  ? 'Uploaded photo from device (Data URL)'
                  : String(value.photo)}
              </span>
            </div>
            <button
              type="button"
              className="button button-outline"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              onClick={() => set('photo', '')}
            >
              Remove Photo
            </button>
          </div>
        ) : (
          <p className="small muted" style={{ margin: 0 }}>
            No custom photo assigned. Initial letters avatar will be used as a clean fallback on the team page.
          </p>
        )}
      </div>

      {/* Social and Professional Links */}
      <TeamSocialsManager value={value} setValue={setValue} />
    </>
  );
}

function GalleryEditorFields({
  value,
  setValue,
}: {
  value: Item;
  setValue: React.Dispatch<React.SetStateAction<Item | null>>;
}) {
  const set = (key: string, next: unknown) =>
    setValue((current) => (current ? { ...current, [key]: next } : current));

  const categoryPresets = [
    'Collection concept',
    'Space concept',
    'Product concept',
    'Facility & Laboratory',
    'Healthcare & Care',
    'Packaging & Logistics',
    'Corporate & Team',
  ];

  const imagePresets = [
    { label: 'Hero Collection', path: '/images/hero.webp' },
    { label: 'Space & Store', path: '/images/story.webp' },
    { label: 'Medicine & Rx', path: '/images/medicine.webp' },
    { label: 'Wellness & Care', path: '/images/wellness.webp' },
    { label: 'First Aid Kit', path: '/images/first-aid.webp' },
    { label: 'Essentials Line', path: '/images/essentials.webp' },
    { label: 'Lab & Facility', path: '/images/about.webp' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = value.mediaType === 'video';
    const maxSize = isVideo ? 50 * 1024 * 1024 : 15 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`File must be ${isVideo ? '50 MB' : '15 MB'} or smaller.`);
      return;
    }
    if (isVideo && !['video/mp4', 'video/webm'].includes(file.type)) {
      alert('Videos must be MP4 or WebM format.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) {
        setValue((current) =>
          current
            ? {
                ...current,
                sourceType: 'blob',
                mediaBlob: String(reader.result),
                mimeType: file.type,
                image: !isVideo ? String(reader.result) : (current.image || '/images/hero.webp'),
                mediaUrl: '',
              }
            : current,
        );
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const activeMediaSrc = String(value.mediaUrl || value.image || value.mediaBlob || '');

  return (
    <>
      <Field
        label="Title / Headline"
        value={value.title}
        onChange={(v) => set('title', v)}
        required
      />

      <Field
        label="Category / Tag"
        value={value.category}
        onChange={(v) => set('category', v)}
        required
      />

      <div className="admin-presets" style={{ marginTop: -4, marginBottom: 12 }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--muted)', alignSelf: 'center' }}>
          Category presets:
        </span>
        {categoryPresets.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`admin-preset-btn ${value.category === cat ? 'active' : ''}`}
            onClick={() => set('category', cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <Field
        label="Display Sort Order (e.g. 0, 1, 2...)"
        type="number"
        value={value.order ?? 0}
        onChange={(v) => set('order', v === '' ? 0 : Number(v))}
      />

      <div className="admin-checkbox-group" style={{ padding: '0 0 10px 0' }}>
        <label className="admin-checkbox-label">
          <input
            type="checkbox"
            checked={value.visible !== false}
            onChange={(e) => set('visible', e.target.checked)}
          />
          Visible in Public Gallery (/gallery/)
        </label>
      </div>

      <TextArea
        label="Description / Caption"
        value={value.description}
        onChange={(v) => set('description', v)}
        rows={3}
      />

      {/* Media Type & Source Manager */}
      <div className="admin-fieldset">
        <div className="admin-fieldset-head">
          <div>
            <span className="eyebrow">Visual Asset</span>
            <h4>Gallery Media & Source</h4>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <label>
            Media Type
            <select
              value={String(value.mediaType || 'image')}
              onChange={(e) => {
                const nextType = e.target.value;
                setValue((cur) => (cur ? { ...cur, mediaType: nextType } : cur));
              }}
            >
              <option value="image">🖼 Image (Photography & Concepts)</option>
              <option value="video">🎬 Video (MP4 / WebM Showcase)</option>
            </select>
          </label>

          <label>
            Source Mode
            <select
              value={String(value.sourceType || 'url')}
              onChange={(e) => {
                const nextSource = e.target.value;
                setValue((cur) => (cur ? { ...cur, sourceType: nextSource } : cur));
              }}
            >
              <option value="url">URL or Relative Site Path</option>
              <option value="blob">Upload File From Device</option>
            </select>
          </label>
        </div>

        {value.mediaType !== 'video' && (
          <div className="admin-presets">
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', alignSelf: 'center' }}>
              Stock presets:
            </span>
            {imagePresets.map((preset) => (
              <button
                key={preset.path}
                type="button"
                className={`admin-preset-btn ${value.mediaUrl === preset.path || value.image === preset.path ? 'active' : ''}`}
                onClick={() => {
                  setValue((cur) =>
                    cur
                      ? {
                          ...cur,
                          sourceType: 'url',
                          mediaUrl: preset.path,
                          image: preset.path,
                          mediaBlob: '',
                        }
                      : cur,
                  );
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}

        <div className="admin-image-actions">
          <label className="upload-field" style={{ margin: 0 }}>
            <Upload size={17} />
            {value.mediaType === 'video'
              ? 'Upload video from device (MP4/WebM max 50MB)'
              : 'Upload custom image from device (max 15MB)'}
            <input
              type="file"
              accept={value.mediaType === 'video' ? 'video/mp4,video/webm' : 'image/*'}
              onChange={handleFileUpload}
            />
          </label>

          <div className="admin-image-url-row">
            <input
              type="text"
              placeholder={
                value.mediaType === 'video'
                  ? 'Or enter video URL (e.g. https://.../video.mp4)'
                  : 'Or enter image URL / path (e.g. /images/hero.webp)'
              }
              value={String(value.mediaUrl || value.image || '')}
              onChange={(e) => {
                const v = e.target.value;
                setValue((cur) =>
                  cur
                    ? {
                        ...cur,
                        sourceType: 'url',
                        mediaUrl: v,
                        image: v,
                        mediaBlob: '',
                      }
                    : cur,
                );
              }}
            />
          </div>
        </div>

        {activeMediaSrc ? (
          <div className="admin-image-picker-preview" style={{ alignItems: 'center' }}>
            {value.mediaType === 'video' ? (
              <video
                src={activeMediaSrc}
                controls
                style={{ width: 120, height: 72, borderRadius: 'var(--radius)', background: '#000', objectFit: 'contain' }}
              />
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={activeMediaSrc}
                alt="Gallery media preview"
                style={{ width: 72, height: 72, borderRadius: 'var(--radius)', objectFit: 'cover' }}
              />
            )}
            <div style={{ minWidth: 0, flex: 1 }}>
              <strong style={{ fontSize: '0.9rem', display: 'block' }}>Active Media Asset</strong>
              <span className="admin-helper" style={{ wordBreak: 'break-all' }}>
                {activeMediaSrc.startsWith('data:')
                  ? `Uploaded ${value.mediaType === 'video' ? 'video' : 'image'} data file`
                  : activeMediaSrc}
              </span>
            </div>
            <button
              type="button"
              className="button button-outline"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              onClick={() => {
                setValue((cur) =>
                  cur
                    ? {
                        ...cur,
                        mediaUrl: '/images/hero.webp',
                        image: '/images/hero.webp',
                        mediaBlob: '',
                        mediaType: 'image',
                        sourceType: 'url',
                      }
                    : cur,
                );
              }}
            >
              Reset to Default
            </button>
          </div>
        ) : (
          <p className="small muted" style={{ margin: 0 }}>
            No media asset selected. Choose a stock concept above, upload a file, or enter a URL.
          </p>
        )}
      </div>
    </>
  );
}

function CustomerInquiriesViewer({
  customer,
  inquiries,
  onClose,
}: {
  customer: Item;
  inquiries: Item[];
  onClose: () => void;
}) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const customerInquiries = inquiries.filter(
    (i) =>
      i.customerId === customer.id ||
      (i.whatsappMessage &&
        customer.phone &&
        String(i.whatsappMessage).includes(String(customer.phone))),
  );

  const copyText = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      alert('Could not copy automatically.');
    }
  };

  return (
    <div className="admin-editor" style={{ marginBottom: 25, border: '2px solid var(--primary)' }}>
      <div className="admin-editor-head">
        <div>
          <span className="eyebrow">Customer Inquiries Archive</span>
          <h3 style={{ margin: '4px 0 0' }}>
            {display(customer.name)} ({display(customer.phone)})
          </h3>
          <p className="small muted" style={{ margin: '4px 0 0' }}>
            {display(customer.address)}
          </p>
        </div>
        <button
          type="button"
          className="icon-button"
          onClick={onClose}
          aria-label="Close inquiries viewer"
        >
          <X />
        </button>
      </div>

      {customerInquiries.length > 0 ? (
        <div style={{ display: 'grid', gap: 14, marginTop: 14 }}>
          {customerInquiries.map((inq, idx) => {
            const items = Array.isArray(inq.items) ? (inq.items as Item[]) : [];
            const inqTotal =
              inq.total != null
                ? Number(inq.total)
                : items.reduce((sum, it) => sum + (Number(it.subtotal) || 0), 0);

            return (
              <div key={String(inq.id || idx)} className="admin-inquiry-box">
                <div className="admin-inquiry-box-head">
                  <div>
                    <strong>Inquiry #{String(inq.id || idx + 1).slice(0, 8)}</strong>
                    <span className="admin-helper">
                      {inq.createdAt || inq.created_at
                        ? new Date(String(inq.createdAt || inq.created_at)).toLocaleString()
                        : 'Recent'}
                    </span>
                  </div>
                  {inqTotal > 0 && (
                    <strong style={{ color: 'var(--primary)', fontSize: '1.05rem' }}>
                      ৳{inqTotal.toLocaleString()}
                    </strong>
                  )}
                </div>

                {items.length > 0 && (
                  <table className="admin-inquiry-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, itemIdx) => (
                        <tr key={itemIdx}>
                          <td>{display(item.name || item.productId)}</td>
                          <td>{display(item.quantity)}</td>
                          <td>{item.unitPrice ? `৳${item.unitPrice}` : '—'}</td>
                          <td>{item.subtotal ? `৳${item.subtotal}` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {Boolean(inq.whatsappMessage) && (
                  <div style={{ marginTop: 10, background: 'var(--surface)', padding: 10, borderRadius: 'var(--radius)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span className="eyebrow" style={{ fontSize: '0.68rem' }}>WhatsApp Message Log</span>
                      <button
                        type="button"
                        className="button button-outline"
                        style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                        onClick={() => copyText(String(inq.id || idx), String(inq.whatsappMessage))}
                      >
                        {copiedId === String(inq.id || idx) ? (
                          <><Check size={12} /> Copied</>
                        ) : (
                          <><Copy size={12} /> Copy Text</>
                        )}
                      </button>
                    </div>
                    <pre style={{ margin: 0, fontSize: '0.75rem', whiteSpace: 'pre-wrap', color: 'var(--muted)', fontFamily: 'inherit' }}>
                      {String(inq.whatsappMessage)}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="admin-empty" style={{ padding: '30px 20px', marginTop: 10 }}>
          No logged inquiries found for this customer record yet.
        </div>
      )}
    </div>
  );
}

function ContactsManager({
  contactInfo,
  setContactInfo,
  contacts,
  load,
  setNotice,
}: {
  contactInfo: ContactInfoItem;
  setContactInfo: React.Dispatch<React.SetStateAction<ContactInfoItem>>;
  contacts: ContactMessageItem[];
  load: () => Promise<void>;
  setNotice: (msg: string) => void;
}) {
  const [form, setForm] = useState<ContactInfoItem>(contactInfo);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'new' | 'read' | 'archived'>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleSaveContactInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const response = await fetch('/api/admin/contactInfo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setNotice(result.error || 'Could not save contact information.');
      } else {
        setContactInfo(result.item || form);
        setNotice('Business contact information updated and published.');
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
        await load();
      }
    } catch {
      setNotice('Network error saving contact details.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (id: string, nextStatus: 'new' | 'read' | 'archived') => {
    setUpdatingId(id);
    try {
      const response = await fetch('/api/admin/contacts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: nextStatus }),
      });
      if (response.ok) {
        setNotice(`Message status updated to "${nextStatus}".`);
        await load();
      } else {
        const res = await response.json().catch(() => ({}));
        setNotice(res.error || 'Failed to update message status.');
      }
    } catch {
      setNotice('Network error updating status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteContact = async (id: string) => {
    if (!confirm('Permanently delete this contact message?')) return;
    try {
      const response = await fetch(`/api/admin/contacts?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setNotice('Message deleted.');
        await load();
      } else {
        setNotice('Could not delete message.');
      }
    } catch {
      setNotice('Network error deleting message.');
    }
  };

  const filteredContacts = useMemo(() => {
    return contacts.filter((item) => {
      if (filter !== 'all' && (item.status || 'new') !== filter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        (item.name || '').toLowerCase().includes(q) ||
        (item.email || '').toLowerCase().includes(q) ||
        (item.phone || '').toLowerCase().includes(q) ||
        (item.subject || '').toLowerCase().includes(q) ||
        (item.message || '').toLowerCase().includes(q)
      );
    });
  }, [contacts, filter, search]);

  const counts = useMemo(() => {
    return {
      all: contacts.length,
      new: contacts.filter((c) => (c.status || 'new') === 'new').length,
      read: contacts.filter((c) => c.status === 'read').length,
      archived: contacts.filter((c) => c.status === 'archived').length,
    };
  }, [contacts]);

  return (
    <div className="admin-contact-workspace">
      {/* 1. Public Business Contact Information Editor */}
      <form className="admin-card-container" onSubmit={handleSaveContactInfo}>
        <div className="admin-card-header">
          <div>
            <span className="eyebrow">Public Settings</span>
            <h3>Business Contact Information & /contact/ Page Content</h3>
            <p className="small muted" style={{ margin: '4px 0 0' }}>
              These contact details are published live on the Contact page, Footer, and WhatsApp actions.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Link
              href="/contact/"
              target="_blank"
              rel="noopener noreferrer"
              className="button button-outline"
              style={{ padding: '8px 14px', fontSize: '0.82rem' }}
            >
              <ExternalLink size={15} /> Preview /contact/
            </Link>
            <button
              type="submit"
              className="button button-primary"
              disabled={isSaving}
              style={{ padding: '8px 18px' }}
            >
              <Save size={16} /> {isSaving ? 'Saving...' : 'Save Contact Info'}
            </button>
          </div>
        </div>

        {saveSuccess && (
          <p className="admin-notice" style={{ marginBottom: 14 }}>
            ✓ Contact information saved and published to the live website!
          </p>
        )}

        <div className="admin-fields">
          <Field
            label="Phone Number"
            value={form.phone}
            onChange={(v) => setForm((f) => ({ ...f, phone: v }))}
            required
          />
          <Field
            label="WhatsApp Number (International format e.g. +880 1711-000000)"
            value={form.whatsappNumber}
            onChange={(v) => setForm((f) => ({ ...f, whatsappNumber: v }))}
            required
          />
          <Field
            label="Official Support Email"
            type="email"
            value={form.email}
            onChange={(v) => setForm((f) => ({ ...f, email: v }))}
            required
          />
          <Field
            label="Business Hours (e.g. Saturday – Thursday: 9:00 AM – 8:00 PM)"
            value={form.hours}
            onChange={(v) => setForm((f) => ({ ...f, hours: v }))}
            required
          />
          <div className="admin-full-width">
            <Field
              label="Physical / Office Address"
              value={form.address}
              onChange={(v) => setForm((f) => ({ ...f, address: v }))}
              required
            />
          </div>
          <div className="admin-full-width">
            <Field
              label="Contact Page Main Heading Title"
              value={form.title}
              onChange={(v) => setForm((f) => ({ ...f, title: v }))}
            />
          </div>
          <TextArea
            label="Contact Page Subtitle / Description"
            value={form.description}
            onChange={(v) => setForm((f) => ({ ...f, description: v }))}
            rows={2}
          />
          <TextArea
            label="Welcome Introduction Note"
            value={form.introduction}
            onChange={(v) => setForm((f) => ({ ...f, introduction: v }))}
            rows={2}
          />
          <div className="admin-full-width">
            <Field
              label="Google Maps Embed URL (iframe src URL or map embed link)"
              value={form.mapUrl || ''}
              onChange={(v) => setForm((f) => ({ ...f, mapUrl: v }))}
            />
            <span className="admin-helper">
              Paste the &quot;src&quot; URL from Google Maps &gt; Share &gt; Embed a map (e.g. https://www.google.com/maps/embed?...). If left empty, a clean location placeholder is displayed.
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="button button-primary"
          disabled={isSaving}
          style={{ marginTop: 5 }}
        >
          <Save size={16} /> {isSaving ? 'Saving Changes...' : 'Save Contact Information'}
        </button>
      </form>

      {/* 2. Customer Inquiries & Messages Inbox */}
      <div className="admin-card-container">
        <div className="admin-card-header">
          <div>
            <span className="eyebrow">Customer Inquiries</span>
            <h3>Contact Messages Inbox ({counts.all})</h3>
            <p className="small muted" style={{ margin: '4px 0 0' }}>
              Messages submitted by visitors through the public contact form on /contact/.
            </p>
          </div>
        </div>

        <div className="admin-filter-pills">
          <button
            type="button"
            className={`admin-filter-pill ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All <span>({counts.all})</span>
          </button>
          <button
            type="button"
            className={`admin-filter-pill ${filter === 'new' ? 'active' : ''}`}
            onClick={() => setFilter('new')}
          >
            New <span>({counts.new})</span>
          </button>
          <button
            type="button"
            className={`admin-filter-pill ${filter === 'read' ? 'active' : ''}`}
            onClick={() => setFilter('read')}
          >
            Read <span>({counts.read})</span>
          </button>
          <button
            type="button"
            className={`admin-filter-pill ${filter === 'archived' ? 'active' : ''}`}
            onClick={() => setFilter('archived')}
          >
            Archived <span>({counts.archived})</span>
          </button>
        </div>

        <div className="admin-search-wrap">
          <Search size={16} />
          <input
            type="search"
            placeholder="Search messages by name, email, phone, subject, or message content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filteredContacts.length > 0 ? (
          <div className="admin-inbox-grid">
            {filteredContacts.map((msg) => {
              const status = msg.status || 'new';
              const rawPhone = String(msg.phone || '').replace(/\D/g, '');
              const waText = encodeURIComponent(
                `Hello ${msg.name || 'there'}, thank you for contacting A2 Protective Care regarding your inquiry: "${msg.subject || 'Product Inquiry'}". How can we assist you?`
              );
              return (
                <article
                  key={msg.id}
                  className={`admin-inbox-item ${status === 'new' ? 'is-new' : ''}`}
                >
                  <div className="admin-inbox-head">
                    <div>
                      <div className="admin-inbox-sender">
                        <strong>{msg.name || 'Anonymous Sender'}</strong>
                        <span className={`admin-msg-badge ${status}`}>{status}</span>
                      </div>
                      <div className="admin-inbox-meta" style={{ marginTop: 4 }}>
                        {msg.phone && (
                          <a href={`tel:${msg.phone}`}>
                            <Phone size={13} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                            {msg.phone}
                          </a>
                        )}
                        {msg.email && (
                          <a href={`mailto:${msg.email}`}>
                            <Mail size={13} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                            {msg.email}
                          </a>
                        )}
                        <span>
                          <Clock size={13} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                          {msg.createdAt || msg.created_at
                            ? new Date(String(msg.createdAt || msg.created_at)).toLocaleString()
                            : 'Recent'}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        Status:
                        <select
                          className="admin-status-select"
                          value={status}
                          disabled={updatingId === msg.id}
                          onChange={(e) =>
                            handleStatusChange(
                              msg.id,
                              e.target.value as 'new' | 'read' | 'archived'
                            )
                          }
                        >
                          <option value="new">New</option>
                          <option value="read">Read</option>
                          <option value="archived">Archived</option>
                        </select>
                      </label>
                    </div>
                  </div>

                  {msg.subject && <div className="admin-inbox-subject">Subject: {msg.subject}</div>}

                  <div className="admin-inbox-body">{msg.message || '(No message content)'}</div>

                  <div className="admin-inbox-actions">
                    <div className="admin-inbox-btn-group">
                      {rawPhone && (
                        <a
                          href={`https://wa.me/${rawPhone}?text=${waText}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="button button-outline"
                          style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                          title="Reply on WhatsApp"
                        >
                          <MessageSquare size={14} /> Reply on WhatsApp
                        </a>
                      )}
                      {msg.email && (
                        <a
                          href={`mailto:${msg.email}?subject=${encodeURIComponent('Re: ' + (msg.subject || 'Inquiry'))}`}
                          className="button button-outline"
                          style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                          title="Reply by Email"
                        >
                          <Mail size={14} /> Send Email
                        </a>
                      )}
                      {msg.phone && (
                        <a
                          href={`tel:${msg.phone}`}
                          className="button button-outline"
                          style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                          title="Call phone"
                        >
                          <Phone size={14} /> Call
                        </a>
                      )}
                    </div>

                    <button
                      type="button"
                      className="icon-button danger"
                      onClick={() => handleDeleteContact(msg.id)}
                      title="Delete message"
                      aria-label="Delete message"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="admin-empty" style={{ padding: '35px 20px' }}>
            {search.trim()
              ? 'No messages match your search filter.'
              : filter === 'all'
                ? 'No contact messages in your inbox yet. Messages submitted via /contact/ will appear here.'
                : `No messages with status "${filter}".`}
          </div>
        )}
      </div>
    </div>
  );
}

