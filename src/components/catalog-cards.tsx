import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { categories } from '@/data/categories';
import { products } from '@/data/products';
import type { Category, Product } from '@/types/catalog';
import { formatPrice } from '@/lib/utils';
import { Media } from './ui/media';
import { AddToOrder } from './order-provider';
export function ProductCard({
  product: p,
  headingLevel = 3,
}: {
  product: Product;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <article className="product-card">
      <Link href={`/products/${p.slug}/`} className="product-image-link">
        <Media
          src={p.images[0]}
          alt={`${p.name} — sample packaging concept`}
          sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 25vw"
        />
        <span className="badge">
          {p.sample
            ? 'Sample'
            : p.salePrice !== undefined
              ? 'Offer'
              : p.newArrival
                ? 'New'
                : p.featured
                  ? 'Featured'
                  : 'Product'}
        </span>
        <span className="image-detail">
          View details <ArrowUpRight size={16} />
        </span>
      </Link>
      <div className="product-meta">
        <span className="small muted">{categories.find((c) => c.id === p.categoryId)?.name}</span>
        <Heading>
          <Link href={`/products/${p.slug}/`}>{p.name}</Link>
        </Heading>
        <div className="product-bottom">
          <span>
            {formatPrice(p.salePrice ?? p.price)}{' '}
            {p.salePrice !== undefined && p.price !== undefined && (
              <del>{formatPrice(p.price)}</del>
            )}
          </span>
          <AddToOrder productId={p.id} compact disabled={p.inStock === false} />
        </div>
      </div>
    </article>
  );
}
export function CategoryCard({
  category: c,
  index = 0,
  headingLevel = 3,
}: {
  category: Category;
  index?: number;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <Link className="category-card" href={`/categories/${c.slug}/`}>
      <Media
        src={c.image}
        alt={`${c.name} sample collection`}
        sizes="(max-width: 600px) 90vw, 25vw"
      />
      <div className="category-card-top">
        <span>0{index + 1}</span>
        <span>{products.filter((p) => p.categoryId === c.id).length} sample items</span>
      </div>
      <div className="category-card-bottom">
        <div>
          <Heading>{c.name}</Heading>
          <p>Placeholder collection</p>
        </div>
        <span className="circle-arrow">
          <ArrowUpRight size={19} />
        </span>
      </div>
    </Link>
  );
}
