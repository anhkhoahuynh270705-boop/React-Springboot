import { authFetch, publicFetch } from './apiClient';

// get all notifications by user
export async function getNotificationsByUser(userId) {
  try {
    const response = await publicFetch(`/notifications/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      if (response.status === 0 || response.status >= 500) {
        console.warn('Notification service unavailable, returning empty array');
        return [];
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const notifications = await response.json();

    // Trigger custom event for real-time updates
    window.dispatchEvent(new CustomEvent('notificationUpdated', {
      detail: { userId, notifications }
    }));

    return notifications || [];
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      console.warn('Network error fetching notifications, backend may be offline. Returning empty array.');
      return [];
    }
    console.error('Error fetching notifications:', error);
    return [];
  }
}

// get unread notification count
export async function getUnreadNotificationCount(userId) {
  try {
    const response = await publicFetch(`/notifications/user/${userId}/count`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 0 || response.status >= 500) {
        console.warn('Notification service unavailable, returning 0');
        return 0;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const count = await response.json();
    return count || 0;
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      console.warn('Network error fetching notification count, backend may be offline. Returning 0.');
      return 0;
    }
    console.error('Error fetching unread notification count:', error);
    return 0;
  }
}

// create new notification
export async function createNotification(notificationData) {
  try {
    const response = await authFetch('/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

// mark notification as read
export async function markNotificationAsRead(notificationId) {
  try {
    const response = await authFetch(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

// mark all notifications as read
export async function markAllNotificationsAsRead(userId) {
  try {
    const response = await authFetch(`/notifications/user/${userId}/read-all`, {
      method: 'PUT',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}

// delete notification
export async function deleteNotification(notificationId) {
  try {
    const response = await authFetch(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
}

// delete all notifications by user
export async function deleteAllNotificationsByUser(userId) {
  try {
    const response = await authFetch(`/notifications/user/${userId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    throw error;
  }
}

// helper functions to create notification
export function createBookingSuccessNotification(userId, movieTitle, seatNumbers, showTime) {
  return {
    userId: userId,
    title: 'Booking successful',
    message: `You Booking successfully for movie "${movieTitle}" at seat ${seatNumbers} at ${new Date(showTime).toLocaleString('en-EN')}`,
    type: 'booking_success',
    isRead: false,
    relatedType: 'booking'
  };
}

export function createTicketApprovedNotification(userId, movieTitle, ticketNumber) {
  return {
    userId: userId,
    title: 'Ticket approved',
    message: `Ticket ${ticketNumber} for movie "${movieTitle}"  has been admin approved and ready to use`,
    type: 'ticket_approved',
    isRead: false,
    relatedType: 'ticket'
  };
}

export function createTicketCancelledNotification(userId, movieTitle, ticketNumber) {
  return {
    userId: userId,
    title: 'Ticket cancelled',
    message: `Ticket ${ticketNumber} for movie "${movieTitle}" has been cancelled by admin`,
    type: 'ticket_cancelled',
    isRead: false,
    relatedType: 'ticket'
  };
}

// Trigger notification update event
export function triggerNotificationUpdate(userId) {
  window.dispatchEvent(new CustomEvent('notificationUpdated', {
    detail: { userId }
  }));
}
