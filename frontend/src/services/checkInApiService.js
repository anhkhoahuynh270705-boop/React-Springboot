import { authFetch } from './apiClient';

export async function hasCheckedInTodayAPI() {
  try {
    const res = await authFetch('/checkin/status');
    if (!res.ok) return false;
    const data = await res.json();
    return data.checkedIn === true;
  } catch {
    return false;
  }
}

export async function checkInTodayAPI() {
  try {
    const res = await authFetch('/checkin', { method: 'POST' });

    if (res.status === 409) {
      // 409 Conflict
      return { success: false, coinsEarned: 0, error: 'already_checked_in' };
    }

    if (!res.ok) {
      return { success: false, coinsEarned: 0, error: 'server_error' };
    }

    const data = await res.json();
    return {
      success: true,
      coinsEarned: data.coinsEarned ?? 10,
      checkInDate: data.checkInDate
    };
  } catch {
    return { success: false, coinsEarned: 0, error: 'network_error' };
  }
}

export async function getCheckInHistoryAPI() {
  try {
    const res = await authFetch('/checkin/history');
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
