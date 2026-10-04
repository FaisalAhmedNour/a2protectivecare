import test from 'node:test';
import assert from 'node:assert/strict';
import { formatPrice } from '../src/lib/utils';
import { normalizePhone, validateCategory, validateContactInfo, validateCustomer, validateGallery, validateProduct, validateTeamMember } from '../src/server/validation';
test('BDT formatting keeps optional price language clear', () => { assert.equal(formatPrice(1200), '৳1,200'); assert.equal(formatPrice(), 'Price on inquiry'); });
test('customer phone numbers normalize to a unique international form', () => { assert.equal(normalizePhone('+880 1700-000000'), '+8801700000000'); assert.throws(() => normalizePhone('123')); });
test('customer validation normalizes phone, validates name and address', () => {
  const customer = validateCustomer({
    name: 'Faisal Ahmed',
    phone: '01712-345678',
    address: 'House 12, Road 4, Dhanmondi, Dhaka',
  });
  assert.equal(customer.name, 'Faisal Ahmed');
  assert.equal(customer.phone, '+01712345678');
  assert.equal(customer.address, 'House 12, Road 4, Dhanmondi, Dhaka');
  assert.throws(() => validateCustomer({ name: '', phone: '01712345678', address: 'Dhaka' }));
});
test('team member validation handles name, designation, photo, bio, order and social links', () => {
  const member = validateTeamMember({
    name: 'Dr. Sarah Rahman',
    designation: 'Head of Quality Assurance',
    photo: '/images/about.webp',
    bio: 'Oversees product safety protocols and medical supplies standards.',
    order: 1,
    social: [
      { label: 'LinkedIn', url: 'https://linkedin.com/in/sarah-rahman' },
      { label: 'Email', url: 'mailto:sarah@a2protectivecare.com' },
      { label: '', url: 'https://invalid.com' }, // Should be filtered out
    ],
  });

  assert.equal(member.name, 'Dr. Sarah Rahman');
  assert.equal(member.designation, 'Head of Quality Assurance');
  assert.equal(member.photo, '/images/about.webp');
  assert.equal(member.bio, 'Oversees product safety protocols and medical supplies standards.');
  assert.equal(member.order, 1);
  assert.equal(member.social?.length, 2);
  assert.equal(member.social?.[0].label, 'LinkedIn');

  // Fallback defaults
  const fallback = validateTeamMember({ name: 'Faisal Ahmed' });
  assert.equal(fallback.name, 'Faisal Ahmed');
  assert.equal(fallback.designation, 'Team Member');
  assert.equal(fallback.order, 0);

  // Rejection of empty name
  assert.throws(() => validateTeamMember({ name: '' }));
});
test('contact info validation preserves customized fields and applies clean defaults', () => {
  const custom = validateContactInfo({
    phone: '+880 1711-223344',
    whatsappNumber: '+880 1711-223344',
    email: 'help@a2protectivecare.com',
    address: 'Plot 4, Block C, Gulshan-1, Dhaka',
    hours: 'Saturday – Thursday: 10:00 AM – 7:00 PM',
    title: 'Reach out to our specialists.',
    description: 'We are ready to assist with medicine catalogs and orders.',
    introduction: 'Direct consultation line for clinics and patients.',
    mapUrl: 'https://www.google.com/maps/embed?pb=test',
  });
  assert.equal(custom.phone, '+880 1711-223344');
  assert.equal(custom.whatsappNumber, '+880 1711-223344');
  assert.equal(custom.email, 'help@a2protectivecare.com');
  assert.equal(custom.address, 'Plot 4, Block C, Gulshan-1, Dhaka');
  assert.equal(custom.hours, 'Saturday – Thursday: 10:00 AM – 7:00 PM');
  assert.equal(custom.title, 'Reach out to our specialists.');
  assert.equal(custom.mapUrl, 'https://www.google.com/maps/embed?pb=test');

  const fallback = validateContactInfo({});
  assert.ok(fallback.phone.length > 0);
  assert.ok(fallback.email.includes('@'));
  assert.ok(fallback.address.length > 0);
});
test('product validation derives a safe slug and rejects invalid sale prices', () => { assert.equal(validateProduct({ name: 'Care Box', categoryId: 'category-one', salePrice: 100, price: 120 }).slug, 'care-box'); assert.throws(() => validateProduct({ name: 'Care Box', categoryId: 'category-one', salePrice: 140, price: 120 })); });
test('product validation preserves images, features, specifications, and flags', () => {
  const validated = validateProduct({
    name: 'First Aid Kit Pro',
    categoryId: 'category-one',
    price: 500,
    salePrice: 450,
    images: ['/images/first-aid.webp', 'data:image/png;base64,iVBORw0KGgo='],
    features: ['Waterproof case', 'Sterilized bandages'],
    specifications: [
      { label: 'Pack size', value: '45 items' },
      { label: 'Manufacturer', value: 'A2 Care' },
    ],
    inStock: true,
    featured: true,
    newArrival: true,
    sample: false,
  });

  assert.equal(validated.name, 'First Aid Kit Pro');
  assert.equal(validated.slug, 'first-aid-kit-pro');
  assert.equal(validated.images.length, 2);
  assert.equal(validated.features?.length, 2);
  assert.equal(validated.specifications?.length, 2);
  assert.equal(validated.specifications?.[0].label, 'Pack size');
  assert.equal(validated.specifications?.[0].value, '45 items');
  assert.equal(validated.featured, true);
  assert.equal(validated.inStock, true);
});
test('category validation derives slug, cleans description, and preserves order & flags', () => {
  const cat = validateCategory({
    name: 'Protective Equipment & Masks',
    description: 'N95 masks, surgical gloves, and personal care equipment.',
    image: '/images/first-aid.webp',
    featured: true,
    order: 2,
  });
  assert.equal(cat.name, 'Protective Equipment & Masks');
  assert.equal(cat.slug, 'protective-equipment-masks');
  assert.equal(cat.image, '/images/first-aid.webp');
  assert.equal(cat.featured, true);
  assert.equal(cat.order, 2);
  assert.throws(() => validateCategory({ name: '' }));
});
test('gallery validation accepts external video URLs, relative image paths, categories, orders and flags', () => {
  const videoItem = validateGallery({
    title: 'Intro Showcase',
    category: 'Space concept',
    description: 'Video tour of modern pharmacy interior.',
    mediaType: 'video',
    sourceType: 'url',
    mediaUrl: 'https://example.com/intro.mp4',
    order: 1,
    visible: true,
  });
  assert.equal(videoItem.title, 'Intro Showcase');
  assert.equal(videoItem.category, 'Space concept');
  assert.equal(videoItem.mediaType, 'video');
  assert.equal(videoItem.order, 1);
  assert.equal(videoItem.visible, true);

  const localImage = validateGallery({
    title: 'Considered Collection',
    category: 'Collection concept',
    image: '/images/hero.webp',
    mediaType: 'image',
    sourceType: 'url',
    mediaUrl: '/images/hero.webp',
  });
  assert.equal(localImage.title, 'Considered Collection');
  assert.equal(localImage.image, '/images/hero.webp');
  assert.equal(localImage.order, 0);
  assert.equal(localImage.visible, true);

  assert.throws(() =>
    validateGallery({
      title: 'Bad URL',
      mediaType: 'video',
      sourceType: 'url',
      mediaUrl: 'javascript:alert(1)',
    }),
  );

  assert.throws(() =>
    validateGallery({
      title: '',
      mediaType: 'image',
      sourceType: 'url',
      mediaUrl: '/images/hero.webp',
    }),
  );
});

