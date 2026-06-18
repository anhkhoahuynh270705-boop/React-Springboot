/* eslint-disable no-useless-catch */
import { adminFetch, API_BASE_URL } from './apiClient';



// get all seats by showtimeId
export async function getSeatsByShowtime(showtimeId) {
  try {
    const response = await fetch(`${API_BASE_URL}/seats/showtime/${showtimeId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}



// create new seat
export async function createSeat(seatData) {
  try {
    const response = await adminFetch(`/seats`, {
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
export const applyLayoutToShowtime = async (showtimeId, layoutId) => {
  const res = await adminFetch(`/seats/showtime/${showtimeId}/apply-layout/${layoutId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  }
  );

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "Failed to apply layout");
  }

  return res.json();
};



// update seat
export async function updateSeat(seatId, seatData) {
  try {
    const response = await adminFetch(`/seats/${seatId}`, {
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

// delete seat
export async function deleteSeat(seatId) {
  try {
    const response = await adminFetch(`/seats/${seatId}`, {
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

export async function deleteSeatsByShowtime(showtimeId) {
  try {
    const response = await adminFetch(`/seats/showtime/${showtimeId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    console.log(`Deleted all seats for showtime ${showtimeId}`);
    return true;
  } catch (error) {
    console.error('Error deleting seats by showtime:', error);
    throw error;
  }
}