export interface Product {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  categoryId: string;
  shortDescription: string;
  description: string;
  price?: number;
  salePrice?: number;
  featured?: boolean;
  newArrival?: boolean;
  inStock?: boolean;
  images: string[];
  features?: string[];
  specifications?: { label: string; value: string }[];
  sample: boolean;
}
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  featured: boolean;
}
export interface TeamMember {
  id: string;
  name: string;
  designation: string;
  photo?: string;
  bio: string;
  social?: { label: string; url: string }[];
}
export interface GalleryItem {
  id: string;
  image: string;
  title: string;
  description: string;
  category: string;
  order: number;
}
export interface OrderLine {
  productId: string;
  quantity: number;
}
