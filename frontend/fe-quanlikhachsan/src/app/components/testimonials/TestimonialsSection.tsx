'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FaStar, FaChevronLeft, FaChevronRight, FaThumbsUp } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { SkeletonTestimonialGrid } from '../ui/SkeletonLoader';
import styles from './TestimonialsSection.module.css';

interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  location: string;
  rating: number;
  review: string;
  date: string;
  roomType: string;
  verified: boolean;
  helpful: number;
}

interface TestimonialsSectionProps {
  limit?: number;
  showNavigation?: boolean;
  autoPlay?: boolean;
}

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  limit = 6,
  showNavigation = true,
  autoPlay = true
}) => {
  const { t } = useTranslation();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Mock testimonials data - In real app, this would come from API
  const mockTestimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Nguyễn Minh Anh',
      avatar: '/images/avatars/user1.jpg',
      location: 'Hà Nội, Việt Nam',
      rating: 5,
      review: 'Khách sạn tuyệt vời với dịch vụ chuyên nghiệp. Phòng sạch sẽ, view đẹp và nhân viên rất thân thiện. Tôi sẽ quay lại lần sau!',
      date: '2024-01-15',
      roomType: 'Deluxe Ocean View',
      verified: true,
      helpful: 24
    },
    {
      id: '2',
      name: 'Trần Văn Hùng',
      avatar: '/images/avatars/user2.jpg',
      location: 'TP.HCM, Việt Nam',
      rating: 5,
      review: 'Kỳ nghỉ hoàn hảo cùng gia đình. Hồ bơi rộng rãi, bữa sáng phong phú và đặc biệt là dịch vụ spa rất tuyệt vời.',
      date: '2024-01-10',
      roomType: 'Family Suite',
      verified: true,
      helpful: 18
    },
    {
      id: '3',
      name: 'Lê Thị Mai',
      avatar: '/images/avatars/user3.jpg',
      location: 'Đà Nẵng, Việt Nam',
      rating: 4,
      review: 'Vị trí thuận tiện, gần biển và trung tâm thành phố. Phòng thoáng mát, sạch sẽ. Giá cả hợp lý cho chất lượng dịch vụ.',
      date: '2024-01-08',
      roomType: 'Standard Room',
      verified: true,
      helpful: 15
    },
    {
      id: '4',
      name: 'Phạm Đức Thành',
      avatar: '/images/avatars/user4.jpg',
      location: 'Hải Phòng, Việt Nam',
      rating: 5,
      review: 'Chuyến công tác tuyệt vời. WiFi nhanh, không gian làm việc thoải mái. Nhân viên hỗ trợ rất nhiệt tình.',
      date: '2024-01-05',
      roomType: 'Business Room',
      verified: true,
      helpful: 12
    },
    {
      id: '5',
      name: 'Hoàng Thị Lan',
      avatar: '/images/avatars/user5.jpg',
      location: 'Cần Thơ, Việt Nam',
      rating: 5,
      review: 'Honeymoon tuyệt vời! Phòng được trang trí lãng mạn, dịch vụ chu đáo. Bữa tối tại nhà hàng rất ngon.',
      date: '2024-01-03',
      roomType: 'Honeymoon Suite',
      verified: true,
      helpful: 31
    },
    {
      id: '6',
      name: 'Vũ Minh Tuấn',
      avatar: '/images/avatars/user6.jpg',
      location: 'Nha Trang, Việt Nam',
      rating: 4,
      review: 'Khách sạn đẹp, view biển tuyệt vời. Dịch vụ tốt nhưng có thể cải thiện thêm về tốc độ phục vụ.',
      date: '2024-01-01',
      roomType: 'Ocean View Suite',
      verified: true,
      helpful: 9
    }
  ];

  useEffect(() => {
    // Simulate API call
    const fetchTestimonials = async () => {
      setLoading(true);
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        setTestimonials(mockTestimonials.slice(0, limit));
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, [limit]);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || testimonials.length <= 3) return;

    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  const handlePrevious = () => {
    if (sliderRef.current) {
      const cardWidth = 400; // Approximate width of a card + gap
      sliderRef.current.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    }
    setIsAutoPlaying(false);
  };

  const handleNext = () => {
    if (sliderRef.current) {
      const cardWidth = 400; // Approximate width of a card + gap
      sliderRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
    }
    setIsAutoPlaying(false);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index}
        className={index < rating ? styles.star : styles.emptyStar}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getValidAvatarSrc = (avatar: string) => {
    // In real app, check if avatar exists, otherwise return placeholder
    return avatar.startsWith('/images/avatars/') 
      ? '/images/placeholder-avatar.jpg' 
      : avatar;
  };

  if (loading) {
    return (
      <section className={styles.testimonialsSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>{t('testimonials.title', 'Khách hàng nói gì về chúng tôi')}</h2>
            <p>{t('testimonials.subtitle', 'Những đánh giá chân thực từ khách hàng đã trải nghiệm dịch vụ của chúng tôi')}</p>
          </div>
          <SkeletonTestimonialGrid />
        </div>
      </section>
    );
  }

  return (
    <section className={styles.testimonialsSection}>
      <div className={styles.container}>
        <div className={styles.sectionHeader}>
          <h2>{t('testimonials.title', 'Khách hàng nói gì về chúng tôi')}</h2>
          <p>{t('testimonials.subtitle', 'Những đánh giá chân thực từ khách hàng đã trải nghiệm dịch vụ của chúng tôi')}</p>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>4.8</span>
              <div className={styles.statStars}>
                {renderStars(5)}
              </div>
              <span className={styles.statText}>Đánh giá trung bình</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>2,847</span>
              <span className={styles.statText}>Đánh giá</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>98%</span>
              <span className={styles.statText}>Khách hài lòng</span>
            </div>
          </div>
        </div>

        <div className={styles.testimonialSlider} ref={sliderRef}>
          {testimonials.map((testimonial, index) => (
            <div key={testimonial.id} className={styles.testimonialCard}>
              <div className={styles.userInfo}>
                <div className={styles.avatar}>
                  <img 
                    src={getValidAvatarSrc(testimonial.avatar)} 
                    alt={testimonial.name}
                  />
                </div>
                <div className={styles.userDetails}>
                  <h4 className={styles.userName}>{testimonial.name}</h4>
                  <p className={styles.userLocation}>{testimonial.location}</p>
                  <div className={styles.rating}>
                    {renderStars(testimonial.rating)}
                  </div>
                </div>
              </div>
              
              <div className={styles.content}>
                <p>{testimonial.review}</p>
              </div>
              
              <div className={styles.footer}>
                <span className={styles.date}>{formatDate(testimonial.date)}</span>
                <span className={styles.helpful}>
                  <FaThumbsUp className={styles.helpfulIcon} />
                  {testimonial.helpful} người thấy hữu ích
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {showNavigation && (
          <div className={styles.navigation}>
            <button 
              onClick={handlePrevious} 
              className={styles.navButton}
              aria-label="Previous"
            >
              <FaChevronLeft />
            </button>
            <button 
              onClick={handleNext} 
              className={styles.navButton}
              aria-label="Next"
            >
              <FaChevronRight />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;
