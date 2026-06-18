import { getTermsSections } from './termsOfServiceData';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { 
  FileText, 
  CheckCircle,
  Calendar,
  Mail,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import './TermsOfServicePage.css';

const TermsOfServicePage = () => {
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

  const sections = getTermsSections(t);

  return (
    <div className="terms-page">
      <div className="terms-container">
        {/* Hero Section */}
        <div className="terms-hero">
          <h1 className="terms-title">{t('Terms of Service')}</h1>
          <p className="terms-subtitle">
            {t('Please read these terms carefully before using our services. By using Galaxy Studio Cinema, you agree to be bound by these terms.')}
          </p>
          <div className="terms-meta">
            <span className="tos-meta-item">
                <Calendar size={16} />
              {t('Last Updated')}: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <span className="tos-meta-item">
                <FileText size={16} />
              {t('Effective Date')}: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Introduction */}
        <div className="terms-intro">
          <p>
            {t('Welcome to Galaxy Studio Cinema. These Terms of Service ("Terms") constitute a legally binding agreement between you and Galaxy Studio Cinema regarding your use of our website, mobile applications, and services.')}
          </p>
          <p>
            {t('By accessing or using our Service, you agree to comply with and be bound by these Terms. If you disagree with any part of these Terms, you may not access or use our Service.')}
          </p>
        </div>

        {/* Terms Sections */}
        <div className="terms-sections">
          {sections.map((section) => {
            const isExpanded = expandedSections.has(section.id);
            return (
              <div key={section.id} className={`terms-section ${isExpanded ? 'expanded' : ''}`}>
                <button
                  className="terms-section-header"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="tos-section-header-content">
                <FileText size={24} className="tos-section-icon" />
                    <h2 className="tos-section-title">{section.title}</h2>
                  </div>
                  {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </button>
                <div className={`terms-section-content ${isExpanded ? 'show' : ''}`}>
                  {section.content}
                </div>
              </div>
            );
          })}
        </div>

        {/* Agreement Section */}
        <div className="terms-agreement">
          <div className="tos-agreement-card">
                <CheckCircle size={32} className="tos-agreement-icon" />
            <h3>{t('Agreement to Terms')}</h3>
            <p>
              {t('By using Galaxy Studio Cinema services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these Terms, please do not use our Service.')}
            </p>
          </div>
        </div>

        {/* Contact Section */}
        <div className="terms-contact">
          <h3>{t('Questions About These Terms?')}</h3>
          <p>{t('If you have any questions or concerns about these Terms of Service, please contact our legal team.')}</p>
          <div className="tos-contact-buttons">
            <a href="mailto:huynhanhkhoa2707@gmail.com" className="tos-contact-btn">
                <Mail size={20} />
              {t('Email Legal Team')}
            </a>
            <a href="/contact" className="tos-contact-btn secondary">
              {t('Contact Us')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;

