import type { Category, GalleryItem, Product, TeamMember } from '@/types/catalog';

export type AdminUser = { id: string; email: string; role: 'admin'; createdAt: string };
export type Customer = {
  id: string;
  name: string;
  phone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
  inquiryCount?: number;
};
export type ContactMessage = {
  id: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'archived';
  createdAt: string;
};
export type InquiryItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice?: number;
  subtotal?: number;
};
export type Inquiry = {
  id: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  items: InquiryItem[];
  total?: number;
  whatsappMessage: string;
  createdAt: string;
  created_at?: string;
};
export type GalleryRecord = GalleryItem & {
  mediaType: 'image' | 'video';
  sourceType: 'url' | 'blob';
  mediaUrl?: string;
  mimeType?: string;
  mediaBlob?: string;
  visible: boolean;
};
export type ContactInfo = {
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
export type AdminSnapshot = {
  products: Product[];
  categories: Category[];
  team: TeamMember[];
  gallery: GalleryRecord[];
  customers: Customer[];
  contacts: ContactMessage[];
  inquiries: Inquiry[];
  contactInfo: ContactInfo;
};
