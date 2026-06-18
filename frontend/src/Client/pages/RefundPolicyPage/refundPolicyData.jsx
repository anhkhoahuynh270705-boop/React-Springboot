import { 
  DollarSign, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  CreditCard,
  Calendar,
  Mail,
  FileText,
  Shield
} from 'lucide-react';

export const getRefundSections = (t) => [
  {
    id: 'overview',
    title: t('1. Overview'),
    content: (
      <div>
        <p>{t('At Galaxy Studio Cinema, we strive to provide the best movie-going experience. This Refund Policy outlines the circumstances under which refunds may be issued for tickets, services, and related purchases.')}</p>
        <p>{t('By purchasing tickets or services through our platform, you agree to the terms outlined in this policy. We reserve the right to modify this policy at any time, and changes will be effective immediately upon posting.')}</p>
      </div>
    )
  },
  {
    id: 'eligibility',
    title: t('2. Refund Eligibility'),
    content: (
      <div>
        <p><strong>{t('You are eligible for a refund in the following circumstances:')}</strong></p>
        <ul>
          <li>{t('Movie cancellation by the cinema or studio')}</li>
          <li>{t('Technical issues preventing you from viewing the movie')}</li>
          <li>{t('Duplicate bookings (subject to verification)')}</li>
          <li>{t('Cancellation made at least 2 hours before showtime')}</li>
          <li>{t('Force majeure events (natural disasters, pandemics, etc.)')}</li>
          <li>{t('Error in booking (wrong movie, date, or time) - within 1 hour of booking')}</li>
        </ul>
        <p><strong>{t('Refunds are NOT available for:')}</strong></p>
        <ul>
          <li>{t('Change of mind after booking')}</li>
          <li>{t('Late arrival to the movie')}</li>
          <li>{t('Personal reasons preventing attendance')}</li>
          <li>{t('Cancellation made less than 2 hours before showtime')}</li>
          <li>{t('Used or partially used tickets')}</li>
          <li>{t('Concession items (food, drinks) unless defective')}</li>
        </ul>
      </div>
    )
  },
  {
    id: 'cancellation',
    title: t('3. Cancellation Policy'),
    content: (
      <div>
        <p><strong>{t('Cancellation Timeframes:')}</strong></p>
        <ul>
          <li><strong>{t('More than 2 hours before showtime:')}</strong> {t('Full refund available (minus processing fees)')}</li>
          <li><strong>{t('1-2 hours before showtime:')}</strong> {t('50% refund available (minus processing fees)')}</li>
          <li><strong>{t('Less than 1 hour before showtime:')}</strong> {t('No refund available')}</li>
        </ul>
        <p><strong>{t('How to Cancel:')}</strong></p>
        <ul>
          <li>{t('Log into your account and go to "My Tickets"')}</li>
          <li>{t('Select the booking you wish to cancel')}</li>
          <li>{t('Click "Cancel Booking" and confirm')}</li>
          <li>{t('Refund will be processed automatically to your original payment method')}</li>
        </ul>
      </div>
    )
  },
  {
    id: 'processing',
    title: t('4. Refund Processing'),
    content: (
      <div>
        <p><strong>{t('Processing Time:')}</strong></p>
        <ul>
          <li>{t('Credit/Debit Cards: 5-10 business days')}</li>
          <li>{t('Bank Transfers: 3-5 business days')}</li>
          <li>{t('E-wallets (MoMo, ZaloPay): 1-3 business days')}</li>
          <li>{t('Gift Cards: Immediate credit to account')}</li>
        </ul>
        <p><strong>{t('Refund Amount:')}</strong></p>
        <ul>
          <li>{t('Ticket price: Full amount (subject to cancellation policy)')}</li>
          <li>{t('Processing fees: May not be refundable')}</li>
          <li>{t('Service charges: May not be refundable')}</li>
          <li>{t('Concession items: Only if defective or not received')}</li>
        </ul>
        <p>{t('Refunds will be credited to the original payment method used for the purchase. If the original payment method is no longer available, please contact our customer service team.')}</p>
      </div>
    )
  },
  {
    id: 'partial',
    title: t('5. Partial Refunds'),
    content: (
      <div>
        <p>{t('In certain circumstances, partial refunds may be issued:')}</p>
        <ul>
          <li>{t('If you cancel within 1-2 hours of showtime, you may receive 50% of the ticket price')}</li>
          <li>{t('If only some tickets in a group booking are cancelled, only those tickets will be refunded')}</li>
          <li>{t('If a combo package is partially used, only the unused portion may be refunded')}</li>
          <li>{t('Processing fees are deducted from all refunds')}</li>
        </ul>
        <p>{t('Partial refunds are calculated automatically based on our refund policy and will be processed using the same method as full refunds.')}</p>
      </div>
    )
  },
  {
    id: 'exceptions',
    title: t('6. Special Exceptions'),
    content: (
      <div>
        <p><strong>{t('Force Majeure Events:')}</strong></p>
        <ul>
          <li>{t('In case of natural disasters, pandemics, or government-mandated closures, full refunds will be issued regardless of cancellation time')}</li>
          <li>{t('No processing fees will be charged in these circumstances')}</li>
          <li>{t('Refunds will be processed within 7-14 business days')}</li>
        </ul>
        <p><strong>{t('Technical Issues:')}</strong></p>
        <ul>
          <li>{t('If the movie cannot be shown due to technical problems, full refunds will be issued')}</li>
          <li>{t('Alternative showtimes may be offered as an option')}</li>
          <li>{t('Refunds must be requested within 48 hours of the scheduled showtime')}</li>
        </ul>
        <p><strong>{t('Medical Emergencies:')}</strong></p>
        <ul>
          <li>{t('Refunds may be considered on a case-by-case basis with proper documentation')}</li>
          <li>{t('Contact customer service with medical documentation within 24 hours')}</li>
        </ul>
      </div>
    )
  },
  {
    id: 'non-refundable',
    title: t('7. Non-Refundable Items'),
    content: (
      <div>
        <p>{t('The following items are generally non-refundable:')}</p>
        <ul>
          <li>{t('Concession items (popcorn, drinks, snacks) once purchased')}</li>
          <li>{t('Gift cards (unless defective or fraudulent)')}</li>
          <li>{t('Membership fees and subscription charges')}</li>
          <li>{t('Processing fees and service charges')}</li>
          <li>{t('Special event tickets (unless event is cancelled)')}</li>
          <li>{t('Premium seating upgrades (unless movie is cancelled)')}</li>
        </ul>
        <p>{t('Exceptions may be made for defective items or items not received. Please contact customer service for assistance.')}</p>
      </div>
    )
  },
  {
    id: 'disputes',
    title: t('8. Dispute Resolution'),
    content: (
      <div>
        <p>{t('If you believe you are entitled to a refund that has been denied, you may:')}</p>
        <ul>
          <li>{t('Contact our customer service team with your booking reference number')}</li>
          <li>{t('Provide documentation supporting your refund request')}</li>
          <li>{t('Allow 3-5 business days for review')}</li>
          <li>{t('Appeal the decision if your initial request is denied')}</li>
        </ul>
        <p>{t('All disputes will be reviewed by our customer service team, and decisions will be communicated via email within 5 business days.')}</p>
        <p>{t('If you are still unsatisfied, you may escalate your complaint to our management team or seek resolution through consumer protection agencies.')}</p>
      </div>
    )
  },
  {
    id: 'contact',
    title: t('9. Contact for Refunds'),
    content: (
      <div>
        <p>{t('To request a refund or inquire about refund eligibility, please contact us:')}</p>
        <ul>
          <li><strong>{t('Email:')}</strong> support@galaxystudio.com</li>
          <li><strong>{t('Phone:')}</strong> +84 932 082 976</li>
          <li><strong>{t('Online:')}</strong> {t('Log into your account and use the "Request Refund" feature')}</li>
          <li><strong>{t('Address:')}</strong> 20 Cong Hoa, Dong Hung Thuan Ward, District Phu Nhuan, Ho Chi Minh City</li>
        </ul>
        <p><strong>{t('Required Information:')}</strong></p>
        <ul>
          <li>{t('Booking reference number')}</li>
          <li>{t('Date and time of show')}</li>
          <li>{t('Reason for refund request')}</li>
          <li>{t('Supporting documentation (if applicable)')}</li>
        </ul>
        <p><strong>{t('Last Updated:')}</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
    )
  }
];

