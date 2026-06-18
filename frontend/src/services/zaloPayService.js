import { publicFetch, adminFetch } from './apiClient';

export const createZaloPayOrder = async (user, amount, description) => {
  const params = new URLSearchParams({ user, amount, description }).toString();
  const res = await publicFetch(`/zalopay/create?${params}`, { method: 'POST' });
  if (!res.ok) throw new Error(`Create ZaloPay order failed: ${res.status}`);
  return await res.json();
};

export const queryZaloPayOrder = async (appTransId) => {
  const res = await publicFetch(`/zalopay/query/${encodeURIComponent(appTransId)}`);
  if (!res.ok) throw new Error(`Query ZaloPay order failed: ${res.status}`);
  return await res.json();
};

export const getAllZaloPayOrders = async () => {
  const res = await adminFetch('/zalopay/orders');
  if (!res.ok) throw new Error(`Fetch ZaloPay orders failed: ${res.status}`);
  return await res.json();
};

export const markZaloPayPaid = async (appTransId) => {
  const res = await adminFetch(`/zalopay/mark-paid?appTransId=${encodeURIComponent(appTransId)}`, { method: 'POST' });
  if (!res.ok) throw new Error(`Mark ZaloPay paid failed: ${res.status}`);
  const text = await res.text();
  return text ? JSON.parse(text) : {};
};

export const markZaloPayExpired = async (appTransId) => {
  const res = await adminFetch(`/zalopay/mark-expired?appTransId=${encodeURIComponent(appTransId)}`, { method: 'POST' });
  if (!res.ok) throw new Error(`Mark ZaloPay expired failed: ${res.status}`);
  const text = await res.text();
  return text ? JSON.parse(text) : {};
};

export const cancelZaloPayOrder = async (appTransId) => {
  try {
    await publicFetch(`/zalopay/cancel?appTransId=${encodeURIComponent(appTransId)}`, { method: 'DELETE' });
  } catch (error) {
    // Silently ignore – best-effort cleanup
    console.warn('cancelZaloPayOrder failed:', error?.message);
  }
};