'use client';

import Image from 'next/image';
import styles from './styles.module.css';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../../app/components/profile/LanguageContext';
import i18n from '../../../app/i18n';
import { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { FaHotel, FaUsers, FaAward, FaHistory } from 'react-icons/fa';

export default function AboutPage() {
  const { t } = useTranslation();
  const { selectedLanguage } = useLanguage();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    i18n.changeLanguage(selectedLanguage);
  }, [selectedLanguage]);

  const teamMembers = [
    {
      id: 1,
      name: 'Công Hiếu',
      role: 'Quản lý',
      image: '/images/members/manager.jpg',
      description: t('about.description'),
    },
    {
      id: 2,
      name: 'Giang Trường',
      role: 'Giám Đốc Điều Hành',
      image: '/images/members/director.jpg',
      description: t('about.description1'),
    },
  ];

  const milestones = [
    {
      year: '2018',
      title: 'Thành lập',
      description: 'Passion Hotel được thành lập với tầm nhìn mang đến trải nghiệm lưu trú đẳng cấp.'
    },
    {
      year: '2010',
      title: 'Mở rộng',
      description: 'Mở rộng quy mô với thêm nhiều phòng và dịch vụ cao cấp.'
    },
    {
      year: '2013',
      title: 'Giải thưởng',
      description: 'Nhận giải thưởng "Khách sạn xuất sắc" từ Hiệp hội Du lịch Việt Nam.'
    },
    {
      year: '2025',
      title: 'Đổi mới',
      description: 'Nâng cấp toàn diện cơ sở vật chất và dịch vụ theo tiêu chuẩn 5 sao quốc tế.'
    }
  ];

  const values = [
    {
      icon: <FaUsers />,
      title: 'Khách hàng là trọng tâm',
      description: 'Mọi dịch vụ của chúng tôi đều hướng đến sự hài lòng tuyệt đối của khách hàng.'
    },
    {
      icon: <FaAward />,
      title: 'Chất lượng vượt trội',
      description: 'Cam kết mang đến dịch vụ chất lượng cao nhất trong mọi khía cạnh.'
    },
    {
      icon: <FaHotel />,
      title: 'Không gian sang trọng',
      description: 'Thiết kế tinh tế, hiện đại kết hợp với nét văn hóa truyền thống.'
    }
  ];

  if (!isClient) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1>{t('about.title', 'Về Chúng Tôi')}</h1>
          <p>{t('about.description', 'Khám phá không gian sang trọng và đẳng cấp của chúng tôi, nơi mỗi chi tiết đều được chăm chút tỉ mỉ để mang đến trải nghiệm hoàn hảo nhất cho quý khách.')}</p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className={styles.storySection}>
        <div className={styles.sectionHeader}>
          <h2>Câu chuyện của chúng tôi</h2>
          <div className={styles.underline}></div>
        </div>
        <div className={styles.storyContent}>
          <div className={styles.storyImage}>
            <img 
              src="/images/h_logo.png" 
              alt="Passion Hotel Story" 
              className={styles.storyImg}
              style={{ width: '100%', height: 'auto', maxWidth: '500px' }}
            />
          </div>
          <div className={styles.storyText}>
            <p>
              Passion Hotel được thành lập với niềm đam mê mang đến trải nghiệm lưu trú đẳng cấp và khác biệt. 
              Chúng tôi không chỉ cung cấp nơi nghỉ ngơi, mà còn kiến tạo không gian sống đầy cảm hứng, 
              nơi mỗi vị khách đều cảm nhận được sự chăm sóc tận tâm và dịch vụ chuyên nghiệp.
            </p>
            <p>
              Với đội ngũ nhân viên giàu kinh nghiệm và tâm huyết, chúng tôi luôn nỗ lực không ngừng 
              để nâng cao chất lượng dịch vụ, đáp ứng mọi nhu cầu của khách hàng từ việc nghỉ dưỡng 
              đến tổ chức sự kiện quan trọng.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className={styles.valuesSection}>
        <div className={styles.sectionHeader}>
          <h2>Giá trị cốt lõi</h2>
          <div className={styles.underline}></div>
        </div>
        <div className={styles.valuesGrid}>
          {values.map((value, index) => (
            <div key={index} className={styles.valueCard}>
              <div className={styles.valueIcon}>{value.icon}</div>
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className={styles.teamSection}>
        <div className={styles.sectionHeader}>
          <h2>Đội ngũ lãnh đạo</h2>
          <div className={styles.underline}></div>
        </div>
        <div className={styles.teamGrid}>
          {teamMembers.map((member) => (
            <div key={member.id} className={styles.teamMember}>
              <div className={styles.memberImage}>
                <Image
                  src={member.image}
                  alt={member.name}
                  width={400}
                  height={400}
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className={styles.memberInfo}>
                <h3>{member.name}</h3>
                <p className={styles.memberRole}>{member.role}</p>
                <div className={styles.memberDescription}>
                  {member.description.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Milestones Section */}
      <section className={styles.milestonesSection}>
        <div className={styles.sectionHeader}>
          <h2>Hành trình phát triển</h2>
          <div className={styles.underline}></div>
        </div>
        <div className={styles.timeline}>
          {milestones.map((milestone, index) => (
            <div key={index} className={`${styles.timelineItem} ${index % 2 === 0 ? styles.left : styles.right}`}>
              <div className={styles.timelineContent}>
                <div className={styles.timelineYear}>{milestone.year}</div>
                <h3>{milestone.title}</h3>
                <p>{milestone.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Partners Section */}
      <section className={styles.partnersSection}>
        <div className={styles.sectionHeader}>
          <h2>{t('about.partners', 'Đối tác của chúng tôi')}</h2>
          <div className={styles.underline}></div>
        </div>
        <div className={styles.partnersGrid}>
          {/* Add partner logos here */}
          <div className={styles.partnerLogo}>
            <Image src="/images/partners/partner1.png" alt="Partner 1" width={150} height={80} />
          </div>
          <div className={styles.partnerLogo}>
            <Image src="/images/partners/partner2.png" alt="Partner 2" width={150} height={80} />
          </div>
          <div className={styles.partnerLogo}>
            <Image src="/images/partners/partner3.png" alt="Partner 3" width={150} height={80} />
          </div>
          <div className={styles.partnerLogo}>
            <Image src="/images/partners/partner4.png" alt="Partner 4" width={150} height={80} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
