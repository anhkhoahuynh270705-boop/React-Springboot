const API_BASE_URL = 'http://localhost:8080/api';

// Lấy tất cả thông báo của user
export async function getNotificationsByUser(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/user/${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
}

// Lấy thông báo chưa đọc của user
export async function getUnreadNotificationsByUser(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/user/${userId}/unread`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    throw error;
  }
}

// Lấy số lượng thông báo chưa đọc
export async function getUnreadNotificationCount(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/user/${userId}/count`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching unread notification count:', error);
    throw error;
  }
}

// Tạo thông báo mới
export async function createNotification(notificationData) {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications`, {
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

// Đánh dấu thông báo là đã đọc
export async function markNotificationAsRead(notificationId) {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
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

// Đánh dấu tất cả thông báo là đã đọc
export async function markAllNotificationsAsRead(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/user/${userId}/read-all`, {
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

// Xóa thông báo
export async function deleteNotification(notificationId) {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
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

// Xóa tất cả thông báo của user
export async function deleteAllNotificationsByUser(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/notifications/user/${userId}`, {
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

// Helper functions để tạo thông báo
export function createBookingSuccessNotification(userId, movieTitle, seatNumbers, showTime) {
  return {
    userId: userId,
    title: 'Đặt vé thành công',
    message: `Bạn đã đặt vé thành công cho phim "${movieTitle}" tại ghế ${seatNumbers} vào ${new Date(showTime).toLocaleString('vi-VN')}`,
    type: 'booking_success',
    isRead: false,
    relatedType: 'booking'
  };
}

export function createTicketApprovedNotification(userId, movieTitle, ticketNumber) {
  return {
    userId: userId,
    title: 'Vé đã được duyệt',
    message: `Vé ${ticketNumber} cho phim "${movieTitle}" đã được admin duyệt và sẵn sàng sử dụng`,
    type: 'ticket_approved',
    isRead: false,
    relatedType: 'ticket'
  };
}

export function createTicketCancelledNotification(userId, movieTitle, ticketNumber) {
  return {
    userId: userId,
    title: 'Vé đã bị hủy',
    message: `Vé ${ticketNumber} cho phim "${movieTitle}" đã bị hủy bởi admin`,
    type: 'ticket_cancelled',
    isRead: false,
    relatedType: 'ticket'
  };
}
