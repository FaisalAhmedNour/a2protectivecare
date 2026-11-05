import type { Category } from '@/types/catalog';

export const categories: Category[] = [
  {
    id: 'growth-regulators',
    slug: 'growth-regulators',
    name: 'Plant Growth Regulators (উদ্ভিদ বৃদ্ধি নিয়ন্ত্রক ও হরমোন)',
    description:
      'উচ্চমানের জৈব উদ্দীপক ও বৃদ্ধি সহায়ক হরমোন যা ফসলের সুষম বৃদ্ধি, ফুল-ফল ধারণ ও অধিক ফলন নিশ্চিত করে।',
    image: '/images/products/profarty-grow-front.webp',
    featured: true,
    order: 1,
  },
  {
    id: 'soil-conditioners',
    slug: 'soil-conditioners',
    name: 'Soil Conditioners (মাটির কন্ডিশনার ও জৈব উদ্দীপক)',
    description:
      'মাটির গঠন, উর্বরতা ও জৈব উপাদান বৃদ্ধিকারী আধুনিক কন্ডিশনার ও হিউমিক উপাদান।',
    image: '/images/products/pro-humax-front.webp',
    featured: true,
    order: 2,
  },
  {
    id: 'micronutrients',
    slug: 'micronutrients',
    name: 'Micronutrient Fertilizers (অণুখাদ্য সার)',
    description:
      'বোরন ও জিংকের ঘাটতি পূরণকারী উচ্চ ক্ষমতাসম্পন্ন পানিতে দ্রবণীয় অণুখাদ্য সার।',
    image: '/images/products/pro-solumax-front.webp',
    featured: true,
    order: 3,
  },
  {
    id: 'mineral-nutrients',
    slug: 'mineral-nutrients',
    name: 'Secondary & Mineral Fertilizers (খনিজ ও গৌণ পুষ্টি সার)',
    description:
      'ক্যালসিয়াম, সালফার ও পটাশিয়ামের পুষ্টি সরবরাহকারী বিশেষায়িত সার।',
    image: '/images/products/pro-sulpomax-front.webp',
    featured: true,
    order: 4,
  },
];
