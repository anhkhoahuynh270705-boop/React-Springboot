import { submitComplaint } from '../../../services/complaintService';
import { useState, useEffect } from 'react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  AlertTriangle, 
  FileText, 
  Send, 
  CheckCircle,
  AlertCircle,
  User,
  Mail,
  Phone,
  ShoppingBag,
  MessageSquare
} from 'lucide-react';
import { useHoneypot, HoneypotField, HoneypotUrlField } from '../../../services/useHoneypot';
import './ComplaintPage.css';

const ComplaintPage = () => {
  const { t } = useTranslation();
  const { 
    honeypotValue, 
    setHoneypotValue, 
    honeypotUrl, 
    setHoneypotUrl, 
    resetTimer, 
    validateSubmission 
  } = useHoneypot();
  const [complaintForm, setComplaintForm] = useState({
    name: '',
    email: '',
    phone: '',
    orderId: '',
    category: '',
    subject: '',
    description: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Reset honeypot timer when component mounts
  useEffect(() => {
    resetTimer();
  }, [resetTimer]);

  const complaintCategories = [
    { value: 'booking', label: t('Booking Issue') },
    { value: 'payment', label: t('Payment Issue') },
    { value: 'service', label: t('Service Quality') },
    { value: 'refund', label: t('Refund Request') },
    { value: 'technical', label: t('Technical Problem') },
    { value: 'other', label: t('Other') }
  ];

  const handleComplaintChange = (e) => {
    setComplaintForm({
      ...complaintForm,
      [e.target.name]: e.target.value
    });
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Honeypot validation
    if (!validateSubmission()) {
      console.warn('Honeypot validation failed - possible bot detected');
      setError('Invalid submission. Please try again.');
      return;
    }
    
    // Validation
    if (!complaintForm.name || !complaintForm.email || !complaintForm.category || !complaintForm.description) {
      setError(t('Please fill in all required fields'));
      return;
    }

    // Submit to API
    try {
      const response = await submitComplaint(complaintForm);
      
      if (response.success) {
        setSubmitted(true);
        setComplaintForm({
          name: '',
          email: '',
          phone: '',
          orderId: '',
          category: '',
          subject: '',
          description: ''
        });
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        setError(response.message || t('Failed to submit complaint. Please try again.'));
      }
    } catch (err) {
      console.error('Error submitting complaint:', err);
      setError(err.message || t('Failed to submit complaint. Please try again.'));
    }
  };

  return (
    <div className="complaint-page">
      <div className="complaint-container">
        {/* Hero Section */}
        <div className="complaint-hero">
          <div className="complaint-hero-icon">
                <AlertTriangle size={48} />
          </div>
          <h1 className="complaint-title">{t('Submit a Complaint')}</h1>
          <p className="complaint-subtitle">
            {t('We take your concerns seriously. Please provide details about your issue and we will investigate promptly.')}
          </p>
        </div>

        {/* Important Notice */}
        <div className="complaint-notice">
                <AlertCircle size={20} />
          <p>{t('Please provide accurate information to help us resolve your complaint quickly. We typically respond within 24-48 hours.')}</p>
        </div>

        {/* Success Message */}
        {submitted && (
          <div className="complaint-success">
                <CheckCircle size={24} />
            <div>
              <h3>{t('Complaint Submitted Successfully')}</h3>
              <p>{t('Thank you for your feedback. We have received your complaint and will review it shortly. You will receive an email confirmation shortly.')}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="complaint-error">
                <AlertCircle size={24} />
            <p>{error}</p>
          </div>
        )}

        {/* Complaint Form */}
        <div className="complaint-form-section">
          <h2 className="complaint-form-title">{t('Complaint Details')}</h2>
          <form className="complaint-form" onSubmit={handleComplaintSubmit}>
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
                    value={complaintForm.name}
                    onChange={handleComplaintChange}
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
                    value={complaintForm.email}
                    onChange={handleComplaintChange}
                    placeholder={t('Enter your email address')}
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
                    value={complaintForm.phone}
                    onChange={handleComplaintChange}
                    placeholder={t('Enter your phone number (optional)')}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="orderId">{t('Order/Ticket ID')}</label>
                <div className="input-wrapper">
                <ShoppingBag size={20} className="input-icon" />
                  <input
                    type="text"
                    id="orderId"
                    name="orderId"
                    value={complaintForm.orderId}
                    onChange={handleComplaintChange}
                    placeholder={t('Enter order or ticket ID (optional)')}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="category">{t('Complaint Category')} <span className="required">*</span></label>
              <div className="input-wrapper">
                <FileText size={20} className="input-icon" />
                <select
                  id="category"
                  name="category"
                  value={complaintForm.category}
                  onChange={handleComplaintChange}
                  required
                >
                  <option value="">{t('Select a category')}</option>
                  {complaintCategories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="subject">{t('Subject')}</label>
              <div className="input-wrapper">
                
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={complaintForm.subject}
                  onChange={handleComplaintChange}
                  placeholder={t('Brief description of your complaint (optional)')}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">{t('Detailed Description')} <span className="required">*</span></label>
              <div className="input-wrapper textarea-wrapper">
                <MessageSquare size={20} className="input-icon textarea-icon" />
                <textarea
                  id="description"
                  name="description"
                  value={complaintForm.description}
                  onChange={handleComplaintChange}
                  placeholder={t('Please provide detailed information about your complaint. Include dates, times, and any relevant details that will help us investigate.')}
                  rows={8}
                  required
                />
              </div>
            </div>

            <button type="submit" className="submit-btn">
               {t('Submit Complaint')}
            </button>
          </form>
        </div>

        {/* Additional Info */}
        <div className="complaint-additional">
          <h3>{t('What happens next?')}</h3>
          <div className="complaint-steps">
            <div className="complaint-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>{t('Review')}</h4>
                <p>{t('We will review your complaint within 24 hours')}</p>
              </div>
            </div>
            <div className="complaint-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>{t('Investigation')}</h4>
                <p>{t('Our team will investigate the issue thoroughly')}</p>
              </div>
            </div>
            <div className="complaint-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>{t('Resolution')}</h4>
                <p>{t('We will provide a resolution within 48-72 hours')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintPage;

