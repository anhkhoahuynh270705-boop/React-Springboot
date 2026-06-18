import { API_BASE_URL, adminFetch } from './apiClient';

// getAllCombos
export const getAllCombos = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/combos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching combos:', error);
    throw error;
  }
};

// get All Combos Admin
export const getAllCombosAdmin = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/combos/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching all combos:', error);
    throw error;
  }
};

// get Combo by ID
export const getComboById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/combos/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching combo by ID:', error);
    throw error;
  }
};

// create Combo (Admin)
export const createCombo = async (comboData) => {
  try {
    const response = await adminFetch(`/combos`, {
      method: 'POST',
      body: JSON.stringify(comboData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating combo:', error);
    throw error;
  }
};

// update Combo (Admin)
export const updateCombo = async (id, comboData) => {
  try {
    const response = await adminFetch(`/combos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(comboData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating combo:', error);
    throw error;
  }
};

// delete Combo (Admin)
export const deleteCombo = async (id) => {
  try {
    const response = await adminFetch(`/combos/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting combo:', error);
    throw error;
  }
};
