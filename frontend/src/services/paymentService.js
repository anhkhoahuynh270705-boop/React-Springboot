import { publicFetch, adminFetch } from './apiClient';

export async function createPaymentOrder(payload) {
  try {
    const res = await publicFetch('/payment/create-order', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Create order failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Payment backend not available, using local sandbox:', err?.message || err);
    return { orderId: `local-${Date.now()}`, signature: 'sandbox-local', payUrl: null };
  }
}

export async function verifyPayment(query) {
  try {
    const urlParams = new URLSearchParams(query || {}).toString();
    const res = await publicFetch(`/payment/verify?${urlParams}`);
    if (!res.ok) throw new Error(`Verify failed: ${res.status}`);
    return await res.json();
  } catch (err) {
    return { status: 'pending' };
  }
}

export async function getAllOrders() {
  const res = await adminFetch('/payment/orders');
  if (!res.ok) throw new Error('Cannot fetch orders from server');
  return await res.json();
}

export async function markPaid(orderId) {
  const res = await adminFetch(`/payment/mark-paid?orderId=${encodeURIComponent(orderId)}`, { method: 'POST' });
  if (!res.ok) throw new Error('update status Paid failed');
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

export async function markExpired(orderId) {
  const res = await adminFetch(`/payment/mark-expired?orderId=${encodeURIComponent(orderId)}`, { method: 'POST' });
  if (!res.ok) throw new Error('update status Expired failed');
  const text = await res.text();
  return text ? JSON.parse(text) : {};
}

export async function cancelPaymentOrder(orderId) {
  try {
    await publicFetch(`/payment/cancel?orderId=${encodeURIComponent(orderId)}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('cancelPaymentOrder failed:', err?.message);
  }
}
