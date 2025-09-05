const API_BASE_URL = 'http://localhost:8080/api';

export const getCinemaLogo = (cinemaName) => {
  if (!cinemaName) return null;
  
  const name = cinemaName.toLowerCase();
  
  // Beta Cinemas
  if (name.includes('beta')) {
    return {
      type: 'beta',
      color: '#0066cc',
      text: 'BETA',
      bgColor: '#0066cc'
    };
  }
  
  // Cinestar
  if (name.includes('cinestar')) {
    return {
      type: 'cinestar',
      color: '#8b5cf6',
      text: 'CINESTAR',
      bgColor: '#8b5cf6'
    };
  }
  
  // DCINE
  if (name.includes('dcine')) {
    return {
      type: 'dcine',
      color: '#dc2626',
      text: 'DCINE',
      bgColor: '#dc2626'
    };
  }
  
  // Đống Đa
  if (name.includes('đống đa') || name.includes('dong da')) {
    return {
      type: 'dongda',
      color: '#ea580c',
      text: 'DDC',
      bgColor: '#ea580c'
    };
  }
  
  // Mega GS
  if (name.includes('mega gs') || name.includes('mega')) {
    return {
      type: 'megags',
      color: '#eab308',
      text: 'MEGA',
      bgColor: '#eab308'
    };
  }
  
  // Galaxy
  if (name.includes('galaxy')) {
    return {
      type: 'galaxy',
      color: '#059669',
      text: 'GALAXY',
      bgColor: '#059669'
    };
  }
  
  // CGV
  if (name.includes('cgv')) {
    return {
      type: 'cgv',
      color: '#7c3aed',
      text: 'CGV',
      bgColor: '#7c3aed'
    };
  }
  
  // Lotte Cinema
  if (name.includes('lotte')) {
    return {
      type: 'lotte',
      color: '#be185d',
      text: 'LOTTE',
      bgColor: '#be185d'
    };
  }
  
  // Default logo
  return {
    type: 'default',
    color: '#6b7280',
    text: 'CINE',
    bgColor: '#6b7280'
  };
};

// Lấy tất cả rạp chiếu
export const getCinemas = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/cinemas`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching cinemas:', error);
    throw error;
  }
};

// Lấy rạp chiếu theo thành phố
export const getCinemasByCity = async (city) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cinemas/city/${city}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching cinemas by city:', error);
    throw error;
  }
};

// Tìm kiếm rạp chiếu
export const searchCinemas = async (query) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cinemas/search?name=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching cinemas:', error);
    throw error;
  }
};

// Lấy chi tiết rạp chiếu
export const getCinemaById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/cinemas/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching cinema details:', error);
    throw error;
  }
};