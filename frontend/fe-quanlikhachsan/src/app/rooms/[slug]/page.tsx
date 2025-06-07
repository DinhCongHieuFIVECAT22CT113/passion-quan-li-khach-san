'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { getLoaiPhongById } from '../../../lib/api';
import { PhongDTO, LoaiPhongDTO } from '../../../lib/DTOs';
import { useAuth } from '../../../lib/auth';
import { API_BASE_URL } from '../../../lib/config';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import BookingModal from '../../components/booking/BookingModal';
import { FaStar, FaWifi, FaTv, FaSnowflake, FaBath, FaUsers, FaRuler, FaCalendarAlt, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import styles from './styles.module.css';

const RoomDetailPage: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const slug = params?.slug as string;
    const { user, loading: authLoading } = useAuth();


    const [loaiPhongDetails, setLoaiPhongDetails] = useState<LoaiPhongDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [mainImageError, setMainImageError] = useState(false);

    // Extract room type ID from slug (assuming format: room-name-maLoaiPhong)
    const extractRoomTypeIdFromSlug = (slug: string | null | undefined): string => {
        if (!slug) return '';
        const parts = slug.split('-');
        return parts[parts.length - 1]; // Last part should be the maLoaiPhong
    };

    const fetchLoaiPhongDetails = useCallback(async () => {
        if (!slug) return;
        setLoading(true);
        setError(null);
        
        try {
            const maLoaiPhong = extractRoomTypeIdFromSlug(slug);
            console.log('Slug:', slug);
            console.log('Extracted maLoaiPhong:', maLoaiPhong);
            
            if (!maLoaiPhong) {
                throw new Error('Invalid room type ID');
            }
            
            const loaiPhongData = await getLoaiPhongById(maLoaiPhong);
            console.log('Fetched room type data:', loaiPhongData);
            setLoaiPhongDetails(loaiPhongData);
        } catch (err: any) {
            console.error("Error fetching room type detail:", err);
            if (err.message === 'RoomTypeNotFound') {
                setError('Không tìm thấy thông tin loại phòng.');
            } else {
                setError('Có lỗi xảy ra khi tải thông tin phòng.');
            }
            setLoaiPhongDetails(null);
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        fetchLoaiPhongDetails();
    }, [fetchLoaiPhongDetails]);

    const roomImages = loaiPhongDetails?.hinhAnh?.split(',').map((img: string) => img.trim()) || [];

    const getValidImageSrc = (imagePath: string | null | undefined): string => {
        if (!imagePath) return '/images/room-placeholder.jpg';
        
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return imagePath;
        }
        
        if (imagePath.startsWith('/')) {
            return imagePath;
        }
        
        return '/images/room-placeholder.jpg';
    };

    const mainImageSrc = roomImages.length > 0 
        ? getValidImageSrc(roomImages[currentImageIndex])
        : getValidImageSrc(loaiPhongDetails?.thumbnail);

    const handleBookNow = () => {
        setShowBookingModal(true);
    };

    const handleCloseBookingModal = () => {
        setShowBookingModal(false);
    };

    const nextImage = () => {
        if (roomImages.length > 0) {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % roomImages.length);
        }
    };

    const prevImage = () => {
        if (roomImages.length > 0) {
            setCurrentImageIndex((prevIndex) => (prevIndex - 1 + roomImages.length) % roomImages.length);
        }
    };

    if (loading || authLoading) {
        return (
            <div className={styles.pageContainer}>
                <Header />
                <div className={styles.loadingContainer}>
                    <div className={styles.spinner}></div>
                    <p>Đang tải thông tin phòng...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !loaiPhongDetails) {
        return (
            <div className={styles.pageContainer}>
                <Header />
                <div className={styles.errorContainer}>
                    <h2>Không tìm thấy phòng</h2>
                    <p>{error || 'Phòng bạn tìm kiếm không tồn tại hoặc đã bị xóa.'}</p>
                    <button 
                        onClick={() => router.push('/users/rooms')}
                        className={styles.backButton}
                    >
                        Quay lại danh sách phòng
                    </button>
                </div>
                <Footer />
            </div>
        );
    }

    const breadcrumbItems = [
        { label: 'Trang chủ', href: '/users/home' },
        { label: 'Phòng', href: '/users/rooms' },
        { label: loaiPhongDetails?.tenLoaiPhong || 'Chi tiết phòng', href: '#' }
    ];

    // SEO metadata
    const pageTitle = `${loaiPhongDetails?.tenLoaiPhong || 'Phòng khách sạn'} | Passion Horizon`;
    const pageDescription = loaiPhongDetails?.moTa || `Đặt phòng ${loaiPhongDetails?.tenLoaiPhong} tại Passion Horizon. Phòng với đầy đủ tiện nghi hiện đại, giá từ ${loaiPhongDetails?.giaMoiDem?.toLocaleString()}đ/đêm.`;
    const pageImage = getValidImageSrc(loaiPhongDetails?.thumbnail);
    const pageUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/rooms/${slug}`;

    return (
        <div className={styles.pageContainer}>
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <meta name="keywords" content={`khách sạn, đặt phòng, ${loaiPhongDetails?.tenLoaiPhong}, Passion Horizon, nghỉ dưỡng`} />
                
                {/* Open Graph */}
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:image" content={pageImage} />
                <meta property="og:url" content={pageUrl} />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="Passion Horizon" />
                
                {/* Twitter Cards */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
                <meta name="twitter:image" content={pageImage} />
                
                {/* Additional SEO */}
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href={pageUrl} />
                
                {/* Structured Data */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Hotel",
                            "name": "Passion Horizon",
                            "description": pageDescription,
                            "image": pageImage,
                            "url": pageUrl,
                            "priceRange": `${loaiPhongDetails?.giaMoiDem?.toLocaleString()}đ`,
                            "address": {
                                "@type": "PostalAddress",
                                "addressCountry": "VN"
                            },
                            "amenityFeature": [
                                { "@type": "LocationFeatureSpecification", "name": "WiFi miễn phí" },
                                { "@type": "LocationFeatureSpecification", "name": "Smart TV" },
                                { "@type": "LocationFeatureSpecification", "name": "Điều hòa" },
                                { "@type": "LocationFeatureSpecification", "name": "Phòng tắm riêng" }
                            ]
                        })
                    }}
                />
            </Head>
            <Header />
            <Breadcrumb items={breadcrumbItems} />
            
            <main className={styles.mainContent}>
                <div className={styles.container}>
                    {/* Room Header */}
                    <div className={styles.roomHeader}>
                        <div className={styles.roomTitle}>
                            <h1>{loaiPhongDetails?.tenLoaiPhong}</h1>
                            <p className={styles.roomType}>{loaiPhongDetails?.tenLoaiPhong}</p>
                        </div>
                        <div className={styles.roomRating}>
                            <div className={styles.stars}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <FaStar key={star} className={styles.starActive} />
                                ))}
                            </div>
                            <span className={styles.ratingText}>5.0 (128 đánh giá)</span>
                        </div>
                    </div>

                    <div className={styles.roomContent}>
                        {/* Image Gallery */}
                        <div className={styles.imageSection}>
                            <div className={styles.mainImageContainer}>
                                <Image
                                    src={mainImageSrc}
                                    alt={loaiPhongDetails?.tenLoaiPhong || 'Hình ảnh phòng'}
                                    width={800}
                                    height={500}
                                    className={styles.mainImage}
                                    onError={() => setMainImageError(true)}
                                />
                                {roomImages.length > 1 && (
                                    <>
                                        <button 
                                            onClick={prevImage}
                                            className={`${styles.imageNav} ${styles.prevButton}`}
                                        >
                                            &#10094;
                                        </button>
                                        <button 
                                            onClick={nextImage}
                                            className={`${styles.imageNav} ${styles.nextButton}`}
                                        >
                                            &#10095;
                                        </button>
                                    </>
                                )}
                                <div className={styles.imageCounter}>
                                    {currentImageIndex + 1} / {roomImages.length || 1}
                                </div>
                            </div>

                            {roomImages.length > 1 && (
                                <div className={styles.thumbnailContainer}>
                                    {roomImages.map((img: string, index: number) => (
                                        <div 
                                            key={index}
                                            className={`${styles.thumbnail} ${index === currentImageIndex ? styles.activeThumbnail : ''}`}
                                            onClick={() => setCurrentImageIndex(index)}
                                        >
                                            <Image
                                                src={getValidImageSrc(img)}
                                                alt={`Thumbnail ${index + 1}`}
                                                width={100}
                                                height={75}
                                                className={styles.thumbnailImage}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Room Details */}
                        <div className={styles.detailsSection}>
                            <div className={styles.roomInfo}>
                                <h2>Thông tin phòng</h2>
                                <p className={styles.description}>
                                    {loaiPhongDetails?.moTa || `Phòng ${loaiPhongDetails?.tenLoaiPhong} với đầy đủ tiện nghi hiện đại, mang đến trải nghiệm nghỉ dưỡng tuyệt vời.`}
                                </p>

                                <div className={styles.roomSpecs}>
                                    <div className={styles.spec}>
                                        <FaUsers className={styles.specIcon} />
                                        <span>Sức chứa: {loaiPhongDetails?.sucChua || 2} người</span>
                                    </div>
                                    <div className={styles.spec}>
                                        <FaRuler className={styles.specIcon} />
                                        <span>Diện tích: {loaiPhongDetails?.kichThuocPhong || loaiPhongDetails?.dienTich || 25}m²</span>
                                    </div>
                                </div>

                                <div className={styles.amenities}>
                                    <h3>Tiện nghi</h3>
                                    <div className={styles.amenityGrid}>
                                        <div className={styles.amenity}>
                                            <FaWifi className={styles.amenityIcon} />
                                            <span>WiFi miễn phí</span>
                                        </div>
                                        <div className={styles.amenity}>
                                            <FaTv className={styles.amenityIcon} />
                                            <span>Smart TV</span>
                                        </div>
                                        <div className={styles.amenity}>
                                            <FaSnowflake className={styles.amenityIcon} />
                                            <span>Điều hòa</span>
                                        </div>
                                        <div className={styles.amenity}>
                                            <FaBath className={styles.amenityIcon} />
                                            <span>Phòng tắm riêng</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Booking Card */}
                            <div className={styles.bookingCard}>
                                <div className={styles.priceSection}>
                                    <div className={styles.price}>
                                        <span className={styles.priceAmount}>
                                            {loaiPhongDetails?.giaMoiDem?.toLocaleString() || '0'}đ
                                        </span>
                                        <span className={styles.priceUnit}>/đêm</span>
                                    </div>
                                    {loaiPhongDetails?.giaMoiGio && (
                                        <div className={styles.hourlyPrice}>
                                            {loaiPhongDetails.giaMoiGio.toLocaleString()}đ/giờ
                                        </div>
                                    )}
                                </div>

                                <button 
                                    onClick={handleBookNow}
                                    className={styles.bookButton}
                                >
                                    <FaCalendarAlt className={styles.buttonIcon} />
                                    Đặt phòng ngay
                                </button>

                                <div className={styles.contactInfo}>
                                    <div className={styles.contactItem}>
                                        <FaPhone className={styles.contactIcon} />
                                        <span>Hotline: 1900 1234</span>
                                    </div>
                                    <div className={styles.contactItem}>
                                        <FaEnvelope className={styles.contactIcon} />
                                        <span>booking@hotel.com</span>
                                    </div>
                                </div>

                                <div className={styles.policies}>
                                    <h4>Chính sách</h4>
                                    <ul>
                                        <li>Miễn phí hủy trong 24h</li>
                                        <li>Nhận phòng: 14:00</li>
                                        <li>Trả phòng: 12:00</li>
                                        <li>Không hút thuốc</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Location Section */}
                    <div className={styles.locationSection}>
                        <h2>
                            <FaMapMarkerAlt className={styles.sectionIcon} />
                            Vị trí
                        </h2>
                        <div className={styles.mapContainer}>
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.757135614257!2d105.84125361476292!3d21.007025386010126!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ac428c3336e5%3A0x384d11d7f7f3b4a8!2zQ29wYWNhYmFuYSBNYXJrZXQgLSBUaOG7jyBMw6A!5e0!3m2!1svi!2s!4v1647901645957!5m2!1svi!2s"
                                width="100%"
                                height="300"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                            />
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            {/* Booking Modal */}
            {showBookingModal && (
                <BookingModal
                    loaiPhong={loaiPhongDetails}
                    onClose={handleCloseBookingModal}
                />
            )}
        </div>
    );
};

export default RoomDetailPage;