const API_BASE_URL = 'http://localhost:8080/api/admin';

// Admin login
export const adminLogin = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (data.success) {
      // Store admin token and user info
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.admin));
      return data.admin;
    } else {
      throw new Error(data.message || 'Đăng nhập admin thất bại');
    }
  } catch (error) {
    console.error('Admin login error:', error);
    throw new Error('Không thể kết nối đến server admin');
  }
};

// Admin logout
export const adminLogout = async (adminId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/logout?adminId=${adminId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data.success) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      return true;
    } else {
      throw new Error(data.message || 'Đăng xuất thất bại');
    }
  } catch (error) {
    console.error('Admin logout error:', error);
    throw new Error('Không thể đăng xuất admin');
  }
};

// Get admin profile
export const getAdminProfile = async (adminId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/profile?adminId=${adminId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data.success) {
      return data.admin;
    } else {
      throw new Error(data.message || 'Không thể lấy thông tin admin');
    }
  } catch (error) {
    console.error('Get admin profile error:', error);
    throw new Error('Không thể lấy thông tin admin');
  }
};

// Get admin stats
export const getAdminStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.warn('Admin stats API not available, using default stats');
      return {
        totalTickets: 0,
        totalUsers: 0,
        confirmedTickets: 0,
        cancelledTickets: 0,
        pendingTickets: 0,
        totalRevenue: 0
      };
    }

    const data = await response.json();

    if (data.success) {
      return data.stats;
    } else {
      throw new Error(data.message || 'Không thể lấy thống kê');
    }
  } catch (error) {
    console.error('Get admin stats error:', error);
    // Trả về stats mặc định thay vì throw error
    return {
      totalTickets: 0,
      totalUsers: 0,
      confirmedTickets: 0,
      cancelledTickets: 0,
      pendingTickets: 0,
      totalRevenue: 0
    };
  }
};

// Create new admin
export const createAdmin = async (adminData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminData),
    });

    const data = await response.json();

    if (data.success) {
      return data.admin;
    } else {
      throw new Error(data.message || 'Tạo admin thất bại');
    }
  } catch (error) {
    console.error('Create admin error:', error);
    throw new Error('Không thể tạo admin mới');
  }
};

// Get all admins
export const getAllAdmins = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/admins`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (data.success) {
      return data.admins;
    } else {
      throw new Error(data.message || 'Không thể lấy danh sách admin');
    }
  } catch (error) {
    console.error('Get all admins error:', error);
    throw new Error('Không thể lấy danh sách admin');
  }
};

// Check if admin is authenticated
export const isAdminAuthenticated = () => {
  const token = localStorage.getItem('adminToken');
  const admin = localStorage.getItem('adminUser');
  return !!(token && admin);
};

// Get current admin
export const getCurrentAdmin = () => {
  try {
    const admin = localStorage.getItem('adminUser');
    return admin ? JSON.parse(admin) : null;
  } catch (error) {
    console.error('Get current admin error:', error);
    return null;
  }
};

// Get all tickets
export const getAllTickets = async () => {
  try {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      console.warn('No admin token, returning empty tickets array');
      return [];
    }

    const response = await fetch(`${API_BASE_URL}/tickets`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
    });

    if (!response.ok) {
      console.warn('Tickets API not available, returning empty array');
      return [];
    }

    const data = await response.json();

    if (data.success) {
      return data.tickets || [];
    } else {
      console.warn('Tickets API error:', data.message);
      return [];
    }
  } catch (error) {
    console.error('Get all tickets error:', error);
    return [];
  }
};

// Get all users
export const getAllUsers = async () => {
  try {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      console.warn('No admin token, returning empty users array');
      return [];
    }

    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
    });

    if (!response.ok) {
      console.warn('Users API not available, returning empty array');
      return [];
    }

    const data = await response.json();

    if (data.success) {
      return data.users || [];
    } else {
      console.warn('Users API error:', data.message);
      return [];
    }
  } catch (error) {
    console.error('Get all users error:', error);
    return [];
  }
};

// Update ticket status
export const updateTicketStatus = async (ticketId, status) => {
  try {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      throw new Error('Không có token admin');
    }

    const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status }),
    });

    const data = await response.json();

    if (data.success) {
      return data.ticket;
    } else {
      throw new Error(data.message || 'Cập nhật trạng thái vé thất bại');
    }
  } catch (error) {
    console.error('Update ticket status error:', error);
    throw new Error('Không thể kết nối đến server admin');
  }
};

// User Management Functions

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      throw new Error('Không có token admin');
    }

    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      return data.user;
    } else {
      throw new Error(data.message || 'Không thể lấy thông tin người dùng');
    }
  } catch (error) {
    console.error('Get user by ID error:', error);
    throw new Error('Không thể kết nối đến server admin');
  }
};

// Update user information
export const updateUser = async (userId, userData) => {
  try {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      throw new Error('Không có token admin');
    }

    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (data.success) {
      return data.user;
    } else {
      throw new Error(data.message || 'Cập nhật thông tin người dùng thất bại');
    }
  } catch (error) {
    console.error('Update user error:', error);
    throw new Error('Không thể kết nối đến server admin');
  }
};

// Delete user
export const deleteUser = async (userId) => {
  try {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      throw new Error('Không có token admin');
    }

    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      return true;
    } else {
      throw new Error(data.message || 'Xóa người dùng thất bại');
    }
  } catch (error) {
    console.error('Delete user error:', error);
    throw new Error('Không thể kết nối đến server admin');
  }
};


// Search users
export const searchUsers = async (keyword) => {
  try {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      throw new Error('Không có token admin');
    }

    const response = await fetch(`${API_BASE_URL}/users/search?keyword=${encodeURIComponent(keyword)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      return data.users;
    } else {
      throw new Error(data.message || 'Tìm kiếm người dùng thất bại');
    }
  } catch (error) {
    console.error('Search users error:', error);
    throw new Error('Không thể kết nối đến server admin');
  }
};