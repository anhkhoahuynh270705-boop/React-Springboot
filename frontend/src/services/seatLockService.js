const API_BASE_URL = 'http://localhost:8080/api/seat-locks';

export async function lockSeats(showtimeId, seatIds, userId) {
  const res = await fetch(`${API_BASE_URL}/lock`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      showtimeId,
      seatIds,
      userId
    })
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || 'Cannot lock seats');
  }

  return data;
}

export async function releaseSeatLocks(showtimeId, seatIds, userId) {
  const res = await fetch(`${API_BASE_URL}/release`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      showtimeId,
      seatIds,
      userId
    })
  });

  return await res.json();
}