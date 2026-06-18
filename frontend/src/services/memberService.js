/* eslint-disable no-empty */
import { getCurrentUserSync } from './userService';
import { getTicketsByUser } from './ticketService';

const API_BASE_URL = 'http://localhost:8080/api';

export async function getMemberOverview() {
  const user = getCurrentUserSync();
  if (!user) throw new Error('Not logged in');

  try {
    const res = await fetch(`${API_BASE_URL}/members/${user.id}/overview`);
    if (res.ok) return await res.json();
  } catch {}

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
    promotions: [`Promotion for ${user.tier || 'Member'}`]
  };
}

export async function getMemberTransactions() {
  const user = getCurrentUserSync();
  if (!user) throw new Error('Not logged in');
  try {
    const res = await fetch(`${API_BASE_URL}/members/${user.id}/transactions`);
    if (res.ok) return await res.json();
  } catch {}
  try {
    const tickets = await getTicketsByUser(user.id);
    return (tickets || []).map(t => ({ type: 'Buy ticket', amount: t.price || 0, time: t.bookingTime || t.createdAt }));
  } catch {
    return [];
  }
}

export async function getMemberNews() {
  try {
    const res = await fetch(`${API_BASE_URL}/news?featured=true&size=5`);
    if (res.ok) {
      const data = await res.json();
      return data.news || data || [];
    }
  } catch (err) {
    console.warn('Failed to fetch member news:', err);
  }
  return [];
}


