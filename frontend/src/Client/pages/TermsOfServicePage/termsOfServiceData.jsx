import { 
  FileText, 
  CheckCircle,
  AlertTriangle,
  Calendar,
  User,
  Shield,
  Ban,
  Mail
} from 'lucide-react';

export const getTermsSections = (t) => [
  {
    id: 'acceptance',
    title: t('1. Acceptance of Terms'),
    content: (
      <div>
        <p>{t('By accessing and using the Galaxy Studio Cinema website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.')}</p>
        <p>{t('These Terms of Service ("Terms") govern your access to and use of our website, mobile applications, and services (collectively, the "Service") provided by Galaxy Studio Cinema.')}</p>
      </div>
    )
  },
  {
    id: 'use-of-service',
    title: t('2. Use of Service'),
    content: (
      <div>
        <p>{t('You may use our Service to:')}</p>
        <ul>
          <li>{t('Browse movie listings, showtimes, and cinema information')}</li>
          <li>{t('Purchase movie tickets and related services')}</li>
          <li>{t('Create and manage your account')}</li>
          <li>{t('Participate in loyalty programs and promotions')}</li>
        </ul>
        <p>{t('You agree to use the Service only for lawful purposes and in accordance with these Terms.')}</p>
      </div>
    )
  },
  {
    id: 'account',
    title: t('3. Account Registration'),
    content: (
      <div>
        <p>{t('To access certain features of the Service, you may be required to create an account. When you create an account, you agree to:')}</p>
        <ul>
          <li>{t('Provide accurate, current, and complete information')}</li>
          <li>{t('Maintain and update your information to keep it accurate')}</li>
          <li>{t('Maintain the security of your password and identification')}</li>
          <li>{t('Accept responsibility for all activities that occur under your account')}</li>
          <li>{t('Notify us immediately of any unauthorized use of your account')}</li>
        </ul>
        <p>{t('You are responsible for maintaining the confidentiality of your account credentials. Galaxy Studio Cinema is not liable for any loss or damage arising from your failure to comply with this section.')}</p>
      </div>
    )
  },
  {
    id: 'booking',
    title: t('4. Booking and Payment'),
    content: (
      <div>
        <p><strong>{t('Ticket Booking:')}</strong></p>
        <ul>
          <li>{t('All ticket bookings are subject to availability')}</li>
          <li>{t('Prices are displayed in Vietnamese Dong (VND) and are subject to change without notice')}</li>
          <li>{t('You must be at least 18 years old or have parental consent to make a booking')}</li>
          <li>{t('Tickets are non-transferable unless otherwise stated')}</li>
        </ul>
        <p><strong>{t('Payment:')}</strong></p>
        <ul>
          <li>{t('We accept various payment methods including credit/debit cards, bank transfers, and e-wallets')}</li>
          <li>{t('Payment must be completed at the time of booking')}</li>
          <li>{t('All transactions are processed securely through our payment partners')}</li>
          <li>{t('You agree to provide valid payment information and authorize us to charge your payment method')}</li>
        </ul>
      </div>
    )
  },
  {
    id: 'cancellation',
    title: t('5. Cancellation and Refunds'),
    content: (
      <div>
        <p><strong>{t('Cancellation Policy:')}</strong></p>
        <ul>
          <li>{t('Cancellations must be made at least 2 hours before the scheduled showtime')}</li>
          <li>{t('Cancellations made less than 2 hours before showtime are not eligible for refund')}</li>
          <li>{t('Refunds will be processed to the original payment method within 3-5 business days')}</li>
          <li>{t('Service fees and processing charges may not be refundable')}</li>
        </ul>
        <p><strong>{t('Refund Eligibility:')}</strong></p>
        <ul>
          <li>{t('Technical issues preventing ticket use')}</li>
          <li>{t('Movie cancellations by the cinema')}</li>
          <li>{t('Duplicate bookings (subject to verification)')}</li>
        </ul>
        <p>{t('For refund requests, please contact our customer service team with your booking reference number.')}</p>
      </div>
    )
  },
  {
    id: 'intellectual-property',
    title: t('6. Intellectual Property'),
    content: (
      <div>
        <p>{t('All content on the Service, including but not limited to text, graphics, logos, images, audio clips, digital downloads, and software, is the property of Galaxy Studio Cinema or its content suppliers and is protected by Vietnamese and international copyright laws.')}</p>
        <p>{t('You may not:')}</p>
        <ul>
          <li>{t('Reproduce, distribute, or create derivative works from our content without permission')}</li>
          <li>{t('Use our trademarks, logos, or brand names without written consent')}</li>
          <li>{t('Remove any copyright or proprietary notices from materials')}</li>
        </ul>
      </div>
    )
  },
  {
    id: 'prohibited',
    title: t('7. Prohibited Activities'),
    content: (
      <div>
        <p>{t('You agree not to engage in any of the following prohibited activities:')}</p>
        <ul>
          <li>{t('Violating any applicable laws or regulations')}</li>
          <li>{t('Infringing on intellectual property rights')}</li>
          <li>{t('Transmitting viruses, malware, or harmful code')}</li>
          <li>{t('Attempting to gain unauthorized access to our systems')}</li>
          <li>{t('Using automated systems to scrape or collect data')}</li>
          <li>{t('Impersonating others or providing false information')}</li>
          <li>{t('Interfering with or disrupting the Service')}</li>
          <li>{t('Reselling tickets for commercial purposes without authorization')}</li>
        </ul>
        <p>{t('Violation of these terms may result in immediate termination of your account and legal action.')}</p>
      </div>
    )
  },
  {
    id: 'liability',
    title: t('8. Limitation of Liability'),
    content: (
      <div>
        <p>{t('To the maximum extent permitted by law, Galaxy Studio Cinema shall not be liable for:')}</p>
        <ul>
          <li>{t('Any indirect, incidental, special, or consequential damages')}</li>
          <li>{t('Loss of profits, revenue, data, or business opportunities')}</li>
          <li>{t('Service interruptions or technical failures beyond our control')}</li>
          <li>{t('Third-party actions or content')}</li>
          <li>{t('Changes to movie schedules or cancellations by studios')}</li>
        </ul>
        <p>{t('Our total liability for any claims arising from your use of the Service shall not exceed the amount you paid to us in the 12 months preceding the claim.')}</p>
      </div>
    )
  },
  {
    id: 'modifications',
    title: t('9. Modifications to Terms'),
    content: (
      <div>
        <p>{t('Galaxy Studio Cinema reserves the right to modify these Terms at any time. We will notify users of any material changes by:')}</p>
        <ul>
          <li>{t('Posting the updated Terms on our website')}</li>
          <li>{t('Sending email notifications to registered users')}</li>
          <li>{t('Displaying a notice on the Service')}</li>
        </ul>
        <p>{t('Your continued use of the Service after changes become effective constitutes acceptance of the modified Terms. If you do not agree to the changes, you must stop using the Service.')}</p>
      </div>
    )
  },
  {
    id: 'termination',
    title: t('10. Termination'),
    content: (
      <div>
        <p>{t('We may terminate or suspend your account and access to the Service immediately, without prior notice, for any reason, including:')}</p>
        <ul>
          <li>{t('Breach of these Terms')}</li>
          <li>{t('Fraudulent or illegal activity')}</li>
          <li>{t('Violation of applicable laws')}</li>
          <li>{t('Extended periods of inactivity')}</li>
        </ul>
        <p>{t('Upon termination, your right to use the Service will immediately cease. All provisions of these Terms that by their nature should survive termination shall survive.')}</p>
      </div>
    )
  },
  {
    id: 'governing-law',
    title: t('11. Governing Law'),
    content: (
      <div>
        <p>{t('These Terms shall be governed by and construed in accordance with the laws of Vietnam, without regard to its conflict of law provisions.')}</p>
        <p>{t('Any disputes arising from these Terms or your use of the Service shall be subject to the exclusive jurisdiction of the courts of Ho Chi Minh City, Vietnam.')}</p>
      </div>
    )
  },
  {
    id: 'contact',
    title: t('12. Contact Information'),
    content: (
      <div>
        <p>{t('If you have any questions about these Terms of Service, please contact us:')}</p>
        <ul>
          <li><strong>{t('Email:')}</strong> hk4744t@gre.ac.uk</li>
          <li><strong>{t('Phone:')}</strong> +84 93 208 2976</li>
          <li><strong>{t('Address:')}</strong> 20 Cong Hoa, Dong Hung Thuan Ward, District Phu Nhuan, Ho Chi Minh City</li>
        </ul>
        <p><strong>{t('Last Updated:')}</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
    )
  }
];

