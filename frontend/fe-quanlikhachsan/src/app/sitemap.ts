import { MetadataRoute } from 'next';
import { getRoomTypes } from '../lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://passion-horizon.com';

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/users/home`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/users/rooms`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/users/services`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/users/promotions`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/users/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ];

  // Dynamic room pages
  let roomPages: MetadataRoute.Sitemap = [];
  
  try {
    const roomTypes = await getRoomTypes();
    
    roomPages = roomTypes.map((roomType: any) => {
      const slug = createRoomSlug(roomType.tenLoaiPhong, roomType.maLoaiPhong);
      
      return {
        url: `${baseUrl}/rooms/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      };
    });
  } catch (error) {
    console.error('Error generating room sitemap:', error);
  }

  return [...staticPages, ...roomPages];
}

// Helper function to create room slug
function createRoomSlug(roomName: string, roomId: string): string {
  const slug = roomName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
  return `${slug}-${roomId}`;
}