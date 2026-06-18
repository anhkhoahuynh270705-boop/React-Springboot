  import { adminFetch, clearAdminSession, publicFetch } from './apiClient';

  // Admin login
  export const adminLogin = async (credentials) => {
    try {
      const response = await publicFetch('/admin/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.admin));
        return data.admin;
      }

      throw new Error(data.message || 'Login admin failed');
    } catch (error) {
      console.error('Admin login error:', error);
      throw new Error(error.message || 'Cannot connect to admin server');
    }
  };

  // Admin logout
  export const adminLogout = async (adminId) => {
    try {
      const response = await adminFetch(`/admin/logout?adminId=${adminId}`, {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        clearAdminSession();
        return true;
      }

      throw new Error(data.message || 'Logout failed');
    } catch (error) {
      console.error('Admin logout error:', error);
      clearAdminSession();
      throw new Error(error.message || 'Cannot logout admin');
    }
  };

  // Get admin stats
  export const getAdminStats = async () => {
    try {
      const response = await adminFetch('/admin/stats', {
        method: 'GET',
      });

      if (!response.ok) {
        console.warn('Admin stats API not available');
        return {
          totalTickets: 0,
          totalUsers: 0,
          confirmedTickets: 0,
          cancelledTickets: 0,
          pendingTickets: 0,
          totalRevenue: 0,
          monthlyRevenue: {},
          weeklyTicketSales: {},
          weeklyUserGrowth: {},
          popularMovies: {},
        };
      }

      const data = await response.json();

      if (data.success) {
        return data.stats;
      }

      throw new Error(data.message || 'Cannot get stats');
    } catch (error) {
      console.error('Get admin stats error:', error);
      return {
        totalTickets: 0,
        totalUsers: 0,
        confirmedTickets: 0,
        cancelledTickets: 0,
        pendingTickets: 0,
        totalRevenue: 0,
        monthlyRevenue: {},
        weeklyTicketSales: {},
        weeklyUserGrowth: {},
        popularMovies: {},
      };
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
      const response = await adminFetch('/admin/tickets', {
        method: 'GET',
      });

      if (!response.ok) {
        console.warn('Tickets API not available, returning empty array');
        return [];
      }

      const data = await response.json();

      if (data.success) {
        return data.tickets || [];
      }

      console.warn('Tickets API error:', data.message);
      return [];
    } catch (error) {
      console.error('Get all tickets error:', error);
      return [];
    }
  };

  // Get all users
  export const getAllUsers = async () => {
    try {
      const response = await adminFetch('/admin/users', {
        method: 'GET',
      });

      if (!response.ok) {
        console.warn('Users API not available, returning empty array');
        return [];
      }

      const data = await response.json();

      if (data.success) {
        return data.users || [];
      }

      console.warn('Users API error:', data.message);
      return [];
    } catch (error) {
      console.error('Get all users error:', error);
      return [];
    }
  };

  // Update ticket status
  export const updateTicketStatus = async (ticketId, status) => {
    try {
      const response = await adminFetch(`/admin/tickets/${ticketId}/status`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (data.success) {
        return data.ticket;
      }

      throw new Error(data.message || 'update ticket status failed');
    } catch (error) {
      console.error('Update ticket status error:', error);
      throw new Error(error.message || 'Cannot update ticket status');
    }
  };

  // Get user by ID
  export const getUserById = async (userId) => {
    try {
      const response = await adminFetch(`/admin/users/${userId}`, {
        method: 'GET',
      });

      const data = await response.json();

      if (data.success) {
        return data.user;
      }

      throw new Error(data.message || 'cannot get user information');
    } catch (error) {
      console.error('Get user by ID error:', error);
      throw new Error(error.message || 'Cannot connect to admin server');
    }
  };

  // Create new user
  export const createUser = async (userData) => {
    try {
      const response = await adminFetch('/admin/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        return data.user;
      }

      throw new Error(data.message || 'Create user failed');
    } catch (error) {
      console.error('Create user error:', error);
      throw new Error(error.message || 'Cannot connect to admin server');
    }
  };

  // Update user information
  export const updateUser = async (userId, userData) => {
    try {
      const response = await adminFetch(`/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        return data.user;
      }

      throw new Error(data.message || 'Update user information failed');
    } catch (error) {
      console.error('Update user error:', error);
      throw new Error(error.message || 'Cannot connect to admin server');
    }
  };

  // Delete user
  export const deleteUser = async (userId) => {
    try {
      const response = await adminFetch(`/admin/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        return true;
      }

      throw new Error(data.message || 'Delete user failed');
    } catch (error) {
      console.error('Delete user error:', error);
      throw new Error(error.message || 'Cannot connect to admin server');
    }
  };

  // Search users
  export const searchUsers = async (keyword) => {
    try {
      const response = await adminFetch(`/admin/users/search?keyword=${encodeURIComponent(keyword)}`, {
        method: 'GET',
      });

      const data = await response.json();

      if (data.success) {
        return data.users;
      }

      throw new Error(data.message || 'Search users failed');
    } catch (error) {
      console.error('Search users error:', error);
      throw new Error(error.message || 'Cannot connect to admin server');
    }
  };
