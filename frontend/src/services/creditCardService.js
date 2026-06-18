import { publicFetch } from './apiClient';

export async function createCreditCardCheckoutSession(payload) {
  const res = await publicFetch('/stripe/create-checkout-session', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error('Cannot create credit card checkout session');
  }

  return await res.json();
}

/** Idempotent: one ticket per Stripe checkout session (server-side). */
export async function confirmCreditCardBooking(sessionId, ticketData) {
  const res = await publicFetch('/stripe/confirm-booking', {
    method: 'POST',
    body: JSON.stringify({ sessionId, ticket: ticketData })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Cannot confirm credit card booking');
  }

  return await res.json();
}
