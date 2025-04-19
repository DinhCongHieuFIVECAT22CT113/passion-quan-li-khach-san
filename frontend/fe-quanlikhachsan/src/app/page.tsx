'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { format } from 'date-fns';
import styles from './page.module.css';

const HomePage = () => {
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    isExpanded: boolean;
    index: number;
  } | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);

  // Add escape key listener
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedImage) {
          setSelectedImage(null);
        }
        if (showDatePicker) {
          setShowDatePicker(false);
        }
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [selectedImage, showDatePicker]);

  const services = [
    { src: '/images/room.jpg', title: 'Rooms' },
    { src: '/images/dining.jpg', title: 'Dining' },
    { src: '/images/conference.jpg', title: 'Conferences & Meetings' },
    { src: '/images/facilities.jpg', title: 'Service & Facilities' },
    { src: '/images/wedding.jpg', title: 'Wedding Package' }
  ];

  const handleImageClick = (src: string, index: number) => {
    if (selectedImage?.src === src && selectedImage.isExpanded) {
      setSelectedImage(null);
    } else {
      setSelectedImage({ src, isExpanded: true, index });
    }
  };

  const handleClickOutside = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains(styles.servicesGrid) || target.classList.contains(styles.serviceCard)) {
      setSelectedImage(null);
    }
  };

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1>Discover Extraordinary<br />Comfort in Hotels</h1>
        <div className={styles.dots}>
          <span className={styles.dot} />
          <span className={styles.dot} />
          <span className={styles.dot} />
        </div>
      </section>

      {/* Booking Form */}
      <section className={styles.bookingSection}>
        <div className={styles.bookingForm}>
          <h2>Book a Room</h2>
          <p>Discover the perfect space for you!</p>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Full Name</label>
              <input type="text" placeholder="Enter your full name" />
            </div>
            <div className={styles.formGroup}>
              <label>Email</label>
              <input type="email" placeholder="Enter your email" />
            </div>
            <div className={styles.formGroup}>
              <label>Phone Number</label>
              <input type="tel" placeholder="Enter your phone number" />
            </div>
            <div className={`${styles.formGroup} ${styles.dateRangeWrapper}`}>
              <label>Check-in - Check-out</label>
              <input
                type="text"
                placeholder="Select dates"
                value={`${format(dateRange[0].startDate, 'dd/MM/yyyy')} - ${format(dateRange[0].endDate, 'dd/MM/yyyy')}`}
                onClick={() => setShowDatePicker(!showDatePicker)}
                readOnly
              />
              {showDatePicker && (
                <div className={styles.datePickerContainer}>
                  <DateRange
                    ranges={dateRange}
                    onChange={item => setDateRange([item.selection])}
                    months={2}
                    direction="horizontal"
                    minDate={new Date()}
                    rangeColors={['#4A90E2']}
                  />
                </div>
              )}
            </div>
            <div className={styles.formGroup}>
              <label>Adults</label>
              <select defaultValue="2">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Children</label>
              <select defaultValue="0">
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Special Requests</label>
              <textarea placeholder="Any special requests?" rows={3}></textarea>
            </div>
            <button className={styles.bookNowBtn}>BOOK NOW</button>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className={styles.servicesGrid}>
        {services.map((service, index) => (
          <div 
            key={service.title}
            className={`${styles.serviceCard} ${
              selectedImage?.src === service.src ? styles.expanded : ''
            }`}
            style={{
              zIndex: selectedImage?.src === service.src ? 10 : 1
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleImageClick(service.src, index);
            }}
          >
            <Image 
              src={service.src} 
              alt={service.title} 
              width={400} 
              height={300}
              className={styles.serviceImage}
            />
            <h3>{service.title}</h3>
            {selectedImage?.src === service.src && (
              <button 
                className={styles.closeButton}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(null);
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </section>

      {/* Special Offers */}
      <section className={styles.specialOffers}>
        <div className={styles.sectionHeader}>
          <h2>Special Offers</h2>
          <h3>Best offer of the month</h3>
          <p>Experience Fantastic Benefits and Obtain Better Rates When You Make a Direct Booking on Our Official Website</p>
          <a href="#" className={styles.viewAll}>View all</a>
        </div>

        <div className={styles.offersGrid}>
          <div className={styles.offerCard}>
            <Image src="/images/honeymoon.jpg" alt="Honeymoon" width={300} height={200} />
            <div className={styles.offerContent}>
              <span className={styles.category}>Room</span>
              <h4>Honeymoon</h4>
              <div className={styles.price}>
                <span>$699</span>
                <span>/night</span>
              </div>
            </div>
          </div>

          <div className={styles.offerCard}>
            <Image src="/images/meetings.jpg" alt="Meetings" width={300} height={200} />
            <div className={styles.offerContent}>
              <span className={styles.category}>Room</span>
              <h4>Meetings</h4>
              <div className={styles.price}>
                <span>$999</span>
                <span>/night</span>
              </div>
            </div>
          </div>

          <div className={styles.offerCard}>
            <Image src="/images/dining-special.jpg" alt="Romantic Dining" width={300} height={200} />
            <div className={styles.offerContent}>
              <span className={styles.category}>Dining</span>
              <h4>Romantic Dining</h4>
              <div className={styles.price}>
                <span>$499</span>
                <span>/table</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLeft}>
            <h2>Newsletter & Special Promo</h2>
            <div className={styles.newsletter}>
              <input type="email" placeholder="Enter your email here" />
              <button>Subscribe</button>
            </div>
          </div>

          <div className={styles.footerRight}>
            <div className={styles.footerLogo}>
              <Image src="/images/hotel-logo.png" alt="Hotel Logo" width={150} height={80} />
            </div>
            
            <div className={styles.footerLinks}>
              <div className={styles.linkColumn}>
                <Link href="/about">About us</Link>
                <Link href="/contact">Contact</Link>
                <Link href="/location">Location</Link>
              </div>
              
              <div className={styles.linkColumn}>
                <Link href="/faq">FAQ</Link>
                <Link href="/terms">Term of Use</Link>
                <Link href="/privacy">Privacy Police</Link>
              </div>
              
              <div className={styles.linkColumn}>
                <Link href="/services">Services & Facilities</Link>
                <Link href="/careers">Careers</Link>
                <Link href="/how-to-book">How to book</Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.footerBottom}>
          <p>© Copyright Booking Hotels. All right reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 