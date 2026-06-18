import { publicFetch, adminFetch } from './apiClient';

// MoMo Payment Service

export const createMoMoOrder = async (user, amount, description) => {
  const params = new URLSearchParams({ user, amount, description }).toString();
  const res = await publicFetch(`/momo/create?${params}`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error(`Create MoMo order failed: ${res.status}`);
  return await res.json();
};

export const queryMoMoOrder = async (orderId) => {
  const res = await publicFetch(`/momo/query/${encodeURIComponent(orderId)}`);
  if (!res.ok) throw new Error(`Query MoMo order failed: ${res.status}`);
  return await res.json();
};

export const markMoMoPaid = async (orderId) => {
  const res = await adminFetch(`/momo/mark-paid?orderId=${encodeURIComponent(orderId)}`, { method: 'POST' });
  if (!res.ok) throw new Error(`Mark MoMo paid failed: ${res.status}`);
  const text = await res.text();
  return text ? JSON.parse(text) : {};
};

export const markMoMoExpired = async (orderId) => {
  const res = await adminFetch(`/momo/mark-expired?orderId=${encodeURIComponent(orderId)}`, { method: 'POST' });
  if (!res.ok) throw new Error(`Mark MoMo expired failed: ${res.status}`);
  const text = await res.text();
  return text ? JSON.parse(text) : {};
};

export const getAllMoMoOrders = async () => {
  const res = await adminFetch('/momo/orders');
  if (!res.ok) throw new Error(`Fetch MoMo orders failed: ${res.status}`);
  return await res.json();
};

export const cancelMoMoOrder = async (orderId) => {
  try {
    await publicFetch(`/momo/cancel?orderId=${encodeURIComponent(orderId)}`, { method: 'DELETE' });
  } catch (error) {
    // Silently ignore – best-effort cleanup
    console.warn('cancelMoMoOrder failed:', error?.message);
  }
};
