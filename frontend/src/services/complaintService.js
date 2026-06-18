const API_BASE_URL = 'http://localhost:8080/api';

export const submitComplaint = async (complaintData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/complaints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(complaintData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error submitting complaint:', error);
    throw error;
  }
};

export const getAllComplaints = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/complaints`, {
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
    console.error('Error fetching complaints:', error);
    throw error;
  }
};

export const getUnreadComplaints = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/complaints/unread`, {
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
    console.error('Error fetching unread complaints:', error);
    throw error;
  }
};

export const getComplaintsByStatus = async (status) => {
  try {
    const response = await fetch(`${API_BASE_URL}/complaints/status/${status}`, {
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
    console.error('Error fetching complaints by status:', error);
    throw error;
  }
};

export const getComplaintById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/complaints/${id}`, {
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
    console.error('Error fetching complaint:', error);
    throw error;
  }
};

export const updateComplaintStatus = async (id, status) => {
  try {
    const response = await fetch(`${API_BASE_URL}/complaints/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating complaint status:', error);
    throw error;
  }
};

