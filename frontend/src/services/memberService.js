import { getCurrentUserSync } from './userService';
import { getTicketsByUser } from './ticketService';

const API_BASE_URL = 'http://localhost:8080/api';

export async function getMemberOverview() {
  const user = getCurrentUserSync();
  if (!user) throw new Error('Chưa đăng nhập');

  // Thử gọi API nếu có
  try {
    const res = await fetch(`${API_BASE_URL}/members/${user.id}/overview`);
    if (res.ok) return await res.json();
  } catch {}

  // Fallback từ localStorage + vé
  let points = Number(user.rewardPoints || 0);
  try {
    const tickets = await getTicketsByUser(user.id);
    const totalSpent = (tickets || []).reduce((s, t) => s + (t.price || 0), 0);
    points = Math.max(points, Math.floor(totalSpent * 0.05));
  } catch {}

  return {
    name: user.fullName || user.username,
    tier: user.tier || 'Member',
    points,
    promotions: [`Ưu đãi theo hạng ${user.tier || 'Member'}`]
  };
}

export async function getMemberTransactions() {
  const user = getCurrentUserSync();
  if (!user) throw new Error('Chưa đăng nhập');
  // Thử API
  try {
    const res = await fetch(`${API_BASE_URL}/members/${user.id}/transactions`);
    if (res.ok) return await res.json();
  } catch {}
  // Fallback từ vé local
  try {
    const tickets = await getTicketsByUser(user.id);
    return (tickets || []).map(t => ({ type: 'Mua vé', amount: t.price || 0, time: t.bookingTime || t.createdAt }));
  } catch {
    return [];
  }
}

export async function getMemberNews() {
  try {
    const res = await fetch(`${API_BASE_URL}/members/news`);
    if (res.ok) return await res.json();
  } catch {}
  return [];
}


