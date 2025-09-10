const API_BASE_URL = 'http://localhost:8080/api';

// Lấy tất cả vé của user
export const getTicketsByUser = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tickets/user/${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user tickets:', error);
    throw error;
  }
};

// Lấy vé theo ID
export const getTicketById = async (ticketId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching ticket:', error);
    throw error;
  }
};

// Đặt vé mới
export const bookTicket = async (ticketData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ticketData)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error booking ticket:', error);
    throw error;
  }
};

// Cập nhật vé
export const updateTicket = async (ticketId, ticketData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ticketData)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating ticket:', error);
    throw error;
  }
};

// Hủy vé
export const cancelTicket = async (ticketId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/cancel`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error cancelling ticket:', error);
    throw error;
  }
};


// Tải vé dưới dạng PDF
export const downloadTicket = async (ticketId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/download`, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.blob();
  } catch (error) {
    console.error('Error downloading ticket:', error);
    throw error;
  }
};

// Xuất danh sách vé của user
export const exportUserTickets = async (userId, format = 'pdf') => {
  try {
    const response = await fetch(`${API_BASE_URL}/tickets/user/${userId}/export?format=${format}`, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.blob();
  } catch (error) {
    console.error('Error exporting user tickets:', error);
    throw error;
  }
};

// Lấy thống kê vé của user
export const getUserTicketStats = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tickets/user/${userId}/stats`, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user ticket stats:', error);
    throw error;
  }
};

// Lấy vé theo trạng thái
export const getTicketsByStatus = async (status) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tickets/status/${status}`, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching tickets by status:', error);
    throw error;
  }
};

// Lấy vé theo showtime
export const getTicketsByShowtime = async (showtimeId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tickets/showtime/${showtimeId}`, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching tickets by showtime:', error);
    throw error;
  }
};

// Hủy vé với lý do
export const cancelTicketWithReason = async (ticketId, reason) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/cancel?reason=${encodeURIComponent(reason)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error cancelling ticket with reason:', error);
    throw error;
  }
};

// Đánh dấu vé đã sử dụng
export const markTicketAsUsed = async (ticketId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/use`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error marking ticket as used:', error);
    throw error;
  }
};

export const getTicketDetails = async (ticketId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/details`, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching ticket details:', error);
    throw error;
  }
};


// Lấy thông tin thanh toán của vé
export const getTicketPaymentInfo = async (ticketId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/payment-info`, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching ticket payment info:', error);
    throw error;
  }
};

// Hoàn tiền vé
export const refundTicket = async (ticketId, refundAmount, refundReason) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/refund?refundAmount=${refundAmount}&refundReason=${encodeURIComponent(refundReason)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error refunding ticket:', error);
    throw error;
  }
};

// Lấy danh sách vé đã hoàn tiền
export const getRefundedTickets = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/tickets/refunded`, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching refunded tickets:', error);
    throw error;
  }
};

// Lấy thống kê hoàn tiền của user
export const getUserRefundStats = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tickets/user/${userId}/refund-stats`, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user refund stats:', error);
    throw error;
  }
};

// Cập nhật phương thức thanh toán
export const updatePaymentMethod = async (ticketId, paymentMethod) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/payment-method?paymentMethod=${encodeURIComponent(paymentMethod)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating payment method:', error);
    throw error;
  }
};

// Lấy vé theo phương thức thanh toán
export const getTicketsByPaymentMethod = async (paymentMethod) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tickets/payment-method/${encodeURIComponent(paymentMethod)}`, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching tickets by payment method:', error);
    throw error;
  }
};

// Lấy vé theo địa chỉ rạp
export const getTicketsByCinemaAddress = async (address) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tickets/cinema-address/${encodeURIComponent(address)}`, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching tickets by cinema address:', error);
    throw error;
  }
};

// Utility function để tải file
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
