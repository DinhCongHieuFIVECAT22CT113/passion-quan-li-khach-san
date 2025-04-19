'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import styles from './page.module.css';
import ImageModal from '@/components/ImageModal';

const RoomsPage = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const rooms = [
    {
      id: 1,
      name: 'Deluxe Room',
      description: 'Spacious room with city view',
      price: 199,
      amenities: ['King Size Bed', 'Free WiFi', 'Mini Bar', 'Room Service'],
      image: '/images/room.jpg'
    },
    {
      id: 2,
      name: 'Suite Room',
      description: 'Luxury suite with separate living area',
      price: 299,
      amenities: ['King Size Bed', 'Living Room', 'Jacuzzi', '24/7 Service'],
      image: '/images/room.jpg'
    },
    {
      id: 3,
      name: 'Family Room',
      description: 'Perfect for family stays',
      price: 399,
      amenities: ['2 Queen Beds', 'Kids Area', 'Kitchen', 'Family Entertainment'],
      image: '/images/room.jpg'
    }
  ];

  return (
    <div className={styles.container}>
      <div className={styles.heroSection}>
        <div className={styles.heroImageWrapper} onClick={() => setSelectedImage('/images/room.jpg')}>
          <Image 
            src="/images/room.jpg" 
            alt="Rooms" 
            width={1200} 
            height={600} 
            className={styles.heroImage}
          />
        </div>
        <h1 className={styles.heroTitle}>Our Rooms</h1>
      </div>

      <div className={styles.content}>
        <div className={styles.description}>
          <h2>Experience Luxury and Comfort</h2>
          <p>Discover our carefully designed rooms that combine modern amenities with elegant comfort. Each room is crafted to provide you with the perfect stay experience.</p>
        </div>

        <div className={styles.roomsList}>
          {rooms.map(room => (
            <div key={room.id} className={styles.roomCard}>
              <div className={styles.roomImageWrapper} onClick={() => setSelectedImage(room.image)}>
                <Image 
                  src={room.image} 
                  alt={room.name} 
                  width={400} 
                  height={300}
                  className={styles.roomImage}
                />
              </div>
              <div className={styles.roomInfo}>
                <h3>{room.name}</h3>
                <p>{room.description}</p>
                <div className={styles.amenities}>
                  {room.amenities.map((amenity, index) => (
                    <span key={index} className={styles.amenity}>{amenity}</span>
                  ))}
                </div>
                <div className={styles.price}>
                  <span>${room.price}</span>
                  <span>/night</span>
                </div>
                <button className={styles.bookButton}>Book Now</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ImageModal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage || ''}
        alt="Room Preview"
      />
    </div>
  );
};

export default RoomsPage; 