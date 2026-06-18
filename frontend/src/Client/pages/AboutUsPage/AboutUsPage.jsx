import React from 'react';
import { useTranslation } from 'react-i18next';
import './AboutUsPage.css';

const AboutUsPage = () => {
  const { t } = useTranslation();

  const values = [
    {
      title: 'Excellence',
      description: 'We strive for excellence in every aspect of the cinema experience'
    },
    {
      title: 'Community',
      description: 'Building a community of movie lovers and entertainment enthusiasts'
    },
    {
      title: 'Innovation',
      description: 'Embracing cutting-edge technology to enhance your viewing experience'
    },
    {
      title: 'Passion',
      description: 'Driven by our passion for cinema and storytelling'
    }
  ];

  const milestones = [
    {
      year: '2020',
      title: 'Founded',
      description: 'HAK Studio Cinema was established with a vision to revolutionize entertainment'
    },
    {
      year: '2021',
      title: 'First Location',
      description: 'Opened our flagship cinema in Ho Chi Minh City'
    },
    {
      year: '2022',
      title: 'Expansion',
      description: 'Expanded to 5 locations across major cities'
    },
    {
      year: '2023',
      title: 'Technology Upgrade',
      description: 'Introduced IMAX and 4DX technology for premium experiences'
    },
    {
      year: '2024',
      title: 'Digital Platform',
      description: 'Launched our online booking and streaming platform'
    }
  ];

  return (
    <div className="au-page">
      <div className="au-container">
        {/* Hero Section */}
        <div className="au-hero">
          <h1 className="au-title">{t('About Galaxy Studio Cinema')}</h1>
          <p className="au-subtitle">
            {t('Leading cinema chain providing premium movie experiences with state-of-the-art technology and comfortable seating.')}
          </p>
        </div>

        {/* Mission Section */}
        <div className="au-mission-section">
          <div className="au-mission-content">
            <h2 className="au-section-title">{t('Our Mission')}</h2>
            <p className="au-mission-text">
              {t('At HAK Studio Cinema, we are dedicated to providing exceptional entertainment experiences that bring people together. Our mission is to create magical moments through the power of cinema, offering state-of-the-art facilities, premium comfort, and unforgettable memories for every guest.')}
            </p>
          </div>
          <div className="au-mission-image">
            <img src="https://www.cgv.vn/media/wysiwyg/about-3.PNG" alt="Our Mission" />
          </div>
        </div>

        {/* Values Section */}
        <div className="au-values-section">
          <h2 className="au-section-title">{t('Our Values')}</h2>
          <div className="au-values-grid">
            {values.map((value, index) => (
              <div key={index} className="au-value-card">
                <h3 className="au-value-title">{value.title}</h3>
                <p className="au-value-description">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Section */}
        <div className="au-timeline-section">
          <h2 className="au-section-title">{t('Our Journey')}</h2>
          <div className="au-timeline">
            {milestones.map((milestone, index) => (
              <div key={index} className="au-timeline-item">
                <div className="au-timeline-marker"></div>
                <div className="au-timeline-content">
                  <div className="au-timeline-year">{milestone.year}</div>
                  <h3 className="au-timeline-title">{milestone.title}</h3>
                  <p className="au-timeline-description">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="au-team-section">
          <h2 className="au-section-title">{t('Leadership Team')}</h2>
          <div className="au-team-grid">
            <div className="au-team-member">
              <div className="au-member-photo">
                <img src="https://scontent.fsgn2-3.fna.fbcdn.net/v/t39.30808-6/491967549_122102121008843770_6668473778548334841_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=k-7Dh1Q3gvgQ7kNvwHa4N-W&_nc_oc=AdnHLlkHdnyLtyYw40kdItwbtW9c5O7vj55KC9GqoWh8v0kQ_MHDBiiUt0YI78IDePbOdQXHYBaXsQbiDXOWtxP7&_nc_zt=23&_nc_ht=scontent.fsgn2-3.fna&_nc_gid=wSxTAvtUznqBHlQY3ygpJw&oh=00_AffSygjlI9E7hoHIIwLFq0hKjv4M_4FS2xPpxQBV73IPIg&oe=68FA38D1" alt="CEO" />
              </div>
              <h3 className="au-member-name">Huynh Anh Khoa</h3>
              <p className="au-member-position">Full stack Developer</p>
              <p className="au-member-bio">{t('Students who love web programming, able to work with both frontend and backend. Always looking to learn and build useful, innovative products.')}</p>
            </div>
            <div className="au-team-member">
              <div className="au-member-photo">
                <img src="https://scontent.fsgn2-6.fna.fbcdn.net/v/t1.30497-1/453178253_471506465671661_2781666950760530985_n.png?stp=dst-png_s200x200&_nc_cat=1&ccb=1-7&_nc_sid=136b72&_nc_ohc=xdXvRFCryAIQ7kNvwG-_eBY&_nc_oc=Admz1ak1nF63mywXLy1yKsGSFu9STCkoYyXgaGbIlaN-RpPh9_7_iBPsvlSwWfBqTAWTeY8edXjY51eMbaKjlKjb&_nc_zt=24&_nc_ht=scontent.fsgn2-6.fna&oh=00_AffbWAAjmVLvCRP63OLLMsoLuETeoXWmDtNoJDJihcRgzg&oe=691BC3BA" alt="CTO" />
              </div>
              <h3 className="au-member-name">Nguyễn Hoàng Long</h3>
              <p className="au-member-position">Frontend Developer</p>
              <p className="au-member-bio">{t('Passionate about user interface and experience design. Love creating websites that are intuitive, modern, and easy to use.')}</p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="au-contact-section">
          <h2 className="au-section-title">{t('Get in Touch')}</h2>
          <div className="au-contact-info">
            <div className="au-contact-item">
              <div className="au-contact-icon">📍</div>
              <div className="au-contact-details">
                <h3>{t('Headquarters')}</h3>
                <p>20 Cong Hoa, Dong Hung Thuan Ward, District Phu Nhuan, Ho Chi Minh City</p>
              </div>
            </div>
            <div className="au-contact-item">
              <div className="au-contact-icon">📞</div>
              <div className="au-contact-details">
                <h3>{t('Phone')}</h3>
                <p>093 208 2976</p>
              </div>
            </div>
            <div className="au-contact-item">
              <div className="au-contact-icon">✉️</div>
              <div className="au-contact-details">
                <h3>{t('Email')}</h3>
                <p>info@galaxystudio.vn</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;
