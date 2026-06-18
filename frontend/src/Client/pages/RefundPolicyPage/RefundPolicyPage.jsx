import { getRefundSections } from './refundPolicyData';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  FileText, 
  CheckCircle,
  Calendar,
  Mail,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import './RefundPolicyPage.css';

const RefundPolicyPage = () => {
  const { t } = useTranslation();
  const [expandedSections, setExpandedSections] = useState(new Set());

  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const sections = getRefundSections(t);

  return (
    <div className="refund-page">
      <div className="refund-container">
        {/* Hero Section */}
        <div className="refund-hero">
          <h1 className="refund-title">{t('Refund Policy')}</h1>
          <p className="refund-subtitle">
            {t('Learn about our refund policy, eligibility criteria, and how to request a refund for your bookings.')}
          </p>
          <div className="refund-meta">
            <span className="rfd-meta-item">
                <Calendar size={16} />
              {t('Last Updated')}: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <span className="rfd-meta-item">
                <FileText size={16} />
              {t('Effective Date')}: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Introduction */}
        <div className="refund-intro">
          <p>
            {t('At Galaxy Studio Cinema, we understand that sometimes plans change. This Refund Policy explains when and how refunds are processed for tickets and services purchased through our platform.')}
          </p>
          <p>
            {t('Please read this policy carefully before making a booking. By purchasing tickets or services, you agree to the terms outlined in this policy.')}
          </p>
        </div>

        {/* Refund Sections */}
        <div className="refund-sections">
          {sections.map((section) => {
            const isExpanded = expandedSections.has(section.id);
            return (
              <div key={section.id} className={`refund-section ${isExpanded ? 'expanded' : ''}`}>
                <button
                  className="refund-section-header"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="rfd-section-header-content">
                <FileText size={24} className="rfd-section-icon" />
                    <h2 className="rfd-section-title">{section.title}</h2>
                  </div>
                  {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </button>
                <div className={`refund-section-content ${isExpanded ? 'show' : ''}`}>
                  {section.content}
                </div>
              </div>
            );
          })}
        </div>

        {/* Important Notice Section */}
        <div className="refund-notice">
          <div className="rfd-notice-card">
                <CheckCircle size={32} className="rfd-notice-icon" />
            <h3>{t('Important Notice')}</h3>
            <p>
              {t('Refund requests must be submitted within the specified timeframes. Late requests may not be eligible for refund. Processing times may vary depending on your payment method. For urgent matters, please contact our customer service team directly.')}
            </p>
          </div>
        </div>

        {/* Contact Section */}
        <div className="refund-contact">
          <h3>{t('Need Help with a Refund?')}</h3>
          <p>{t('If you have questions about refunds or need assistance with a refund request, please contact our customer service team.')}</p>
          <div className="rfd-contact-buttons">
            <a href="mailto:support@CINEVERSEstudio.com" className="rfd-contact-btn">
                <Mail size={20} />
              {t('Email Refund Team')}
            </a>
            <a href="/contact" className="rfd-contact-btn secondary">
              {t('Contact Us')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicyPage;

