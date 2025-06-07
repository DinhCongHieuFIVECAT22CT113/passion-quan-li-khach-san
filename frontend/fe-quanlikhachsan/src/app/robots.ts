import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://passion-horizon.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/users/home',
          '/users/rooms',
          '/users/services',
          '/users/promotions',
          '/users/about',
          '/rooms/',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/users/profile',
          '/users/booking-form',
          '/users/guest-booking',
          '/_next/',
          '/static/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: [
          '/',
          '/users/home',
          '/users/rooms',
          '/users/services',
          '/users/promotions',
          '/users/about',
          '/rooms/',
        ],
        disallow: [
          '/admin/',
          '/api/',
          '/users/profile',
          '/users/booking-form',
          '/users/guest-booking',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}