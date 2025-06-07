import { Metadata } from 'next';
import { getPhongById, getLoaiPhongById } from '../../../lib/api';

interface GenerateMetadataProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: GenerateMetadataProps): Promise<Metadata> {
  try {
    // Extract room ID from slug
    const roomId = params.slug.split('-').pop() || '';
    
    // Fetch room data
    const room = await getPhongById(roomId);
    const loaiPhong = room?.maLoaiPhong ? await getLoaiPhongById(room.maLoaiPhong) : null;

    const title = `${room?.soPhong || 'Phòng'} - ${loaiPhong?.tenLoaiPhong || 'Khách sạn'} | Passion Horizon`;
    const description = loaiPhong?.moTa || `Đặt phòng ${room?.soPhong} tại Passion Horizon. Phòng ${loaiPhong?.tenLoaiPhong} với đầy đủ tiện nghi hiện đại, giá từ ${loaiPhong?.giaMoiDem?.toLocaleString()}đ/đêm.`;
    const images = room?.thumbnail ? [room.thumbnail] : ['/images/room-placeholder.jpg'];

    return {
      title,
      description,
      keywords: `khách sạn, đặt phòng, ${loaiPhong?.tenLoaiPhong}, Passion Horizon, nghỉ dưỡng`,
      openGraph: {
        title,
        description,
        images,
        type: 'website',
        siteName: 'Passion Horizon',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images,
      },
      robots: {
        index: true,
        follow: true,
      },
      alternates: {
        canonical: `/rooms/${params.slug}`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    
    return {
      title: 'Phòng khách sạn | Passion Horizon',
      description: 'Khám phá các phòng nghỉ tuyệt vời tại Passion Horizon với đầy đủ tiện nghi hiện đại.',
    };
  }
}