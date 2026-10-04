export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '[WHATSAPP NUMBER]';
export const site = {
  name: 'A2 Protective Care',
  shortName: 'A2',
  description:
    'Explore the A2 Protective Care medicine catalog and prepare an availability inquiry on WhatsApp.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://a2-protective-care.well-oak-7339.chatgpt.site',
  whatsappNumber: WHATSAPP_NUMBER,
  contactEndpoint: process.env.NEXT_PUBLIC_CONTACT_ENDPOINT || '/api/contact',
  sampleMode: true,
  phone: '[PHONE NUMBER]',
  email: '[EMAIL]',
  address: '[ADDRESS]',
  hours: '[BUSINESS HOURS]',
  socials: [] as { label: string; url: string }[],
  footerDescription:
    'Explore. Inquire. Stay connected. Your A2 medicine catalog, all in one place.',
  contactGreeting:
    'Hello, I am interested in ordering from A2 Protective Care. Please help me with product availability.',
  orderGreeting: 'Hello, I would like to place an order:',
  orderClosing: 'Please confirm availability and total price.\n\nThank you.',
  singleOrderGreeting: 'Hello, I am interested in ordering:',
  singleOrderClosing: 'Please confirm availability and delivery details.\n\nThank you.',
};
export const navigation = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about/' },
  { label: 'Categories', href: '/categories/' },
  { label: 'Products', href: '/products/' },
  { label: 'Team', href: '/team/' },
  { label: 'Gallery', href: '/gallery/' },
  { label: 'Contact', href: '/contact/' },
];
