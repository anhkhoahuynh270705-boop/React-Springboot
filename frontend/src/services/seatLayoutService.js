const API_BASE_URL = `http://localhost:8080/api/seat-layouts`;

export const getSeatLayouts = async () => {
  const res = await fetch(API_BASE_URL);
  if (!res.ok) {
    throw new Error("Failed to fetch seat layouts");
  }
  return res.json();
};

export const createSeatLayout = async (layout) => {
  const res = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(layout),
  });

  if (!res.ok) {
    throw new Error("Failed to create seat layout");
  }
  return res.json();
};
