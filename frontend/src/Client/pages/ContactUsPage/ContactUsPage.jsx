import { submitContact } from '../../../services/contactService';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import React from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Clock,
  User
} from 'lucide-react';
import { useHoneypot, HoneypotField, HoneypotUrlField, HoneypotLink } from '../../../services/useHoneypot';
import './ContactUsPage.css';

const ContactUsPage = () => {
  const { t } = useTranslation();
  const { 
    honeypotValue, 
    setHoneypotValue, 
    honeypotUrl, 
    setHoneypotUrl, 
    resetTimer, 
    validateSubmission 
  } = useHoneypot();
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Reset honeypot timer when component mounts
  useEffect(() => {
    resetTimer();
  }, [resetTimer]);

  const contactInfo = [
    {
      title: t('Phone Support'),
      detail: '+84 93 208 2976',
      subtitle: t('24/7 Available'),
      color: '#10b981'
    },
    {
      title: t('Email Support'),
      detail: 'hk4744t@gre.ac.uk',
      subtitle: t('Response within 24 hours'),
      color: '#3b82f6'
    },
    {
      title: t('Office Address'),
      detail: '20 Cong Hoa, Dong Hung Thuan Ward, District Phu Nhuan, Ho Chi Minh City',
      subtitle: t('Visit us anytime'),
      color: '#8b5cf6'
    }
  ];

  const handleContactChange = (e) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value
    });
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Honeypot validation
    if (!validateSubmission()) {
      console.warn('Honeypot validation failed - possible bot detected');
      setError('Invalid submission. Please try again.');
      return;
    }
    
    // Validation
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      setError(t('Please fill in all required fields'));
      return;
    }

    // Submit to API
    try {
      const response = await submitContact(contactForm);
      
      if (response.success) {
        setSubmitted(true);
        setContactForm({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        setError(response.message || t('Failed to send message. Please try again.'));
      }
    } catch (err) {
      console.error('Error submitting contact form:', err);
      setError(err.message || t('Failed to send message. Please try again.'));
    }
  };


  return (
    <div className="contact-page">
      {/* Honeypot links - hidden URLs for bot detection */}
      <HoneypotLink href="/contact-spam" text="Submit Spam" />
      <HoneypotLink href="/api/contact/bulk-submit" text="Bulk Submit" />
      
      <div className="contact-container">
        {/* Hero Section */}
        <div className="contact-hero">
          <h1 className="contact-title">{t('Contact Us')}</h1>
          <p className="contact-subtitle">
            {t('We\'d love to hear from you. Get in touch with us and we\'ll respond as soon as possible.')}
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="contact-info-section">
          {contactInfo.map((info, index) => (
            <div key={index} className="contact-info-card">
              <div className="contact-info-icon" style={{ backgroundColor: `${info.color}20`, color: info.color }}>
                </div>
              <div className="contact-info-content">
                <h3 className="contact-info-title">{info.title}</h3>
                <p className="contact-info-detail">{info.detail}</p>
                <p className="contact-info-subtitle">{info.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Success Message */}
        {submitted && (
          <div className="contact-success">
                <CheckCircle size={24} />
            <p>{t('Thank you! Your message has been sent successfully.')}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="contact-error">
                <AlertCircle size={24} />
            <p>{error}</p>
          </div>
        )}

        {/* Contact Form */}
        <div className="contact-form-section">
          <form className="contact-form" onSubmit={handleContactSubmit}>
              {/* Honeypot fields */}
              <HoneypotField 
                value={honeypotValue} 
                onChange={(e) => setHoneypotValue(e.target.value)} 
                name="website"
              />
              <HoneypotUrlField 
                value={honeypotUrl} 
                onChange={(e) => setHoneypotUrl(e.target.value)} 
                name="url"
              />
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">{t('Full Name')} <span className="required">*</span></label>
                  <div className="input-wrapper">
                <User size={20} className="input-icon" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={contactForm.name}
                      onChange={handleContactChange}
                      placeholder={t('Enter your full name')}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="email">{t('Email Address')} <span className="required">*</span></label>
                  <div className="input-wrapper">
                <Mail size={20} className="input-icon" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={contactForm.email}
                      onChange={handleContactChange}
                      placeholder={t('Enter your email')}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">{t('Phone Number')}</label>
                  <div className="input-wrapper">
                <Phone size={20} className="input-icon" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={contactForm.phone}
                      onChange={handleContactChange}
                      placeholder={t('Enter your phone number')}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="subject">{t('Subject')}</label>
                  <div className="input-wrapper">
                <MessageSquare size={20} className="input-icon" />
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={contactForm.subject}
                      onChange={handleContactChange}
                      placeholder={t('What is this regarding?')}
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message">{t('Message')} <span className="required">*</span></label>
                <textarea
                  id="message"
                  name="message"
                  value={contactForm.message}
                  onChange={handleContactChange}
                  placeholder={t('Tell us how we can help you...')}
                  rows="6"
                  required
                />
              </div>

              <button type="submit" className="submit-btn">
                <Send size={20} />
                {t('Send Message')}
              </button>
            </form>
          </div>

        {/* Additional Info */}
        <div className="contact-additional">
          <div className="additional-card">
                <Clock size={24} />
            <h3>{t('Response Time')}</h3>
            <p>{t('We typically respond within 24 hours during business days')}</p>
          </div>
          <div className="additional-card">
                <MessageSquare size={24} />
            <h3>{t('We\'re Here to Help')}</h3>
            <p>{t('Our customer service team is ready to assist you with any questions or concerns')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;

