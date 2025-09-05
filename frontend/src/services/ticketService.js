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

// Xác nhận vé đã sử dụng
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

// Lấy vé theo showtime
export const getTicketsByShowtime = async (showtimeId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tickets/showtime/${showtimeId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching tickets by showtime:', error);
    throw error;
  }
};

// Lấy vé theo trạng thái
export const getTicketsByStatus = async (status) => {
  try {
    const response = await fetch(`${API_BASE_URL}/tickets/status/${status}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching tickets by status:', error);
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
