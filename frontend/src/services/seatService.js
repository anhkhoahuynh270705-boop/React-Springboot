const API_BASE_URL = 'http://localhost:8080/api';

// Kiểm tra kết nối API
export async function checkApiConnection() {
  try {
    const response = await fetch(`${API_BASE_URL}/seats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.error('API connection check failed:', error);
    return false;
  }
}

// Lấy tất cả ghế theo showtimeId
export async function getSeatsByShowtime(showtimeId) {
  try {
    const response = await fetch(`${API_BASE_URL}/seats?showtimeId=${showtimeId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching seats by showtime:', error);
    throw error;
  }
}

// Lấy tất cả ghế
export async function getAllSeats() {
  try {
    const response = await fetch(`${API_BASE_URL}/seats`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching all seats:', error);
    throw error;
  }
}

// Tạo ghế mới
export async function createSeat(seatData) {
  try {
    const response = await fetch(`${API_BASE_URL}/seats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(seatData)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating seat:', error);
    throw error;
  }
}

// Tạo nhiều ghế cùng lúc
export async function createMultipleSeats(seatsData) {
  try {
    const response = await fetch(`${API_BASE_URL}/seats/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(seatsData)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error creating multiple seats:', error);
    throw error;
  }
}

// Cập nhật ghế
export async function updateSeat(seatId, seatData) {
  try {
    const response = await fetch(`${API_BASE_URL}/seats/${seatId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(seatData)
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating seat:', error);
    throw error;
  }
}

// Xóa ghế
export async function deleteSeat(seatId) {
  try {
    const response = await fetch(`${API_BASE_URL}/seats/${seatId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return true;
  } catch (error) {
    console.error('Error deleting seat:', error);
    throw error;
  }
}

// Đặt ghế (book seat)
export async function bookSeat(seatId, userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/seats/${seatId}/book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId })
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error booking seat:', error);
    throw error;
  }
}

// Hủy đặt ghế
export async function unbookSeat(seatId) {
  try {
    const response = await fetch(`${API_BASE_URL}/seats/${seatId}/unbook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error unbooking seat:', error);
    throw error;
  }
}

export async function deleteSeatsByShowtime(showtimeId) {
  try {
    const seats = await getSeatsByShowtime(showtimeId);
    if (seats && seats.length > 0) {
      const deletePromises = seats.map(seat => deleteSeat(seat.id));
      await Promise.all(deletePromises);
      console.log(`Deleted ${seats.length} seats for showtime ${showtimeId}`);
    }
    return true;
  } catch (error) {
    console.error('Error deleting seats by showtime:', error);
    throw error;
  }
}