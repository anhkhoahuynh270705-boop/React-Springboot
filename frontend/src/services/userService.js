import { generateAIPersonAvatar } from './avatarService';

const API_BASE_URL = 'http://localhost:8080/api';

export async function registerUser(userData) {
  try {
    const res = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    });

    if (!res.ok) {
      if (res.status === 409) {
        throw new Error('Tên đăng nhập hoặc email đã tồn tại');
      }
      if (res.status === 400) {
        throw new Error('Thông tin không hợp lệ');
      }
      throw new Error(`Đăng ký thất bại: ${res.status}`);
    }

    const user = await res.json();
    const avatarUrl = generateAIPersonAvatar(user.username);
    user.avatarUrl = avatarUrl;
    user.customAvatar = false; // Đánh dấu là avatar AI mặc định
    
    console.log('Generated default AI avatar for user:', user.username, 'URL:', avatarUrl);
    
    // Lưu thông tin user vào localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  } catch (error) {
    console.error('Registration error:', error);
    throw new Error(error.message || 'Đăng ký thất bại. Vui lòng thử lại.');
  }
}

export async function loginUser({ username, password }) {
  try {
    const params = new URLSearchParams({
      username: username,
      password: password
    });

    const res = await fetch(`${API_BASE_URL}/users/login?${params}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
      }
      throw new Error(`Đăng nhập thất bại: ${res.status}`);
    }

    const user = await res.json();
    
    if (!user.avatarUrl) {
      const avatarUrl = generateAIPersonAvatar(user.username);
      user.avatarUrl = avatarUrl;
      user.customAvatar = false; // Đánh dấu là avatar AI mặc định
      console.log('Generated default AI avatar for login user:', user.username, 'URL:', avatarUrl);
    }
    
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  } catch (error) {
    console.error('Login error:', error);
    throw new Error(error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
  }
}

export async function logoutUser() {
  try {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    return true;
  }
}

export async function getCurrentUser() {
  try {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      return null;
    }
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Get current user error:', error);
    localStorage.removeItem('currentUser');
    return null;
  }
}

// Lấy thông tin user từ database
export async function getUserProfile() {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      const localUser = getCurrentUserSync();
      if (localUser) {
        return localUser;
      }
      throw new Error('Không có quyền truy cập');
    }

    const res = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Phiên đăng nhập đã hết hạn');
      }
      if (res.status === 404) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }
      // Nếu API lỗi, fallback về localStorage
      console.warn('API failed, using localStorage data');
      const localUser = getCurrentUserSync();
      if (localUser) {
        return localUser;
      }
      throw new Error(`Lấy thông tin thất bại: ${res.status}`);
    }

    const userData = await res.json();
    
    // Cập nhật localStorage với dữ liệu từ database
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    return userData;
  } catch (error) {
    console.error('Get user profile error:', error);
    // Fallback về localStorage nếu có
    const localUser = getCurrentUserSync();
    if (localUser) {
      console.warn('Using localStorage data as fallback');
      return localUser;
    }
    throw new Error(error.message || 'Lấy thông tin thất bại. Vui lòng thử lại.');
  }
}

// Cập nhật thông tin user trong database
export async function updateUserProfile(userData) {
  try {
    // Lấy thông tin user hiện tại
    const currentUser = getCurrentUserSync();
    if (!currentUser) {
      throw new Error('Không tìm thấy thông tin người dùng');
    }

    // Tạo user object mới với dữ liệu đã cập nhật
    const updatedUser = {
      ...currentUser,
      ...userData,
      id: currentUser.id,
      avatarUrl: currentUser.avatarUrl,
      customAvatar: currentUser.customAvatar
    };

    // Cập nhật localStorage trước
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    // Thử gọi API nếu có token
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const res = await fetch(`${API_BASE_URL}/users/profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData)
        });

        if (res.ok) {
          const serverUser = await res.json();
          // Cập nhật lại với dữ liệu từ server
          localStorage.setItem('currentUser', JSON.stringify(serverUser));
          return serverUser;
        } else {
          console.warn('API update failed, but local update succeeded');
          // Trả về dữ liệu local đã cập nhật
          return updatedUser;
        }
      } catch (apiError) {
        console.warn('API call failed, but local update succeeded:', apiError);
        // Trả về dữ liệu local đã cập nhật
        return updatedUser;
      }
    } else {
      // Không có token, chỉ cập nhật local
      console.warn('No auth token, updating local data only');
      return updatedUser;
    }
  } catch (error) {
    console.error('Update profile error:', error);
    throw new Error(error.message || 'Cập nhật thất bại. Vui lòng thử lại.');
  }
}

export async function changePassword({ currentPassword, newPassword }) {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('Không có quyền truy cập');
    }

    const res = await fetch(`${API_BASE_URL}/users/change-password`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Đổi mật khẩu thất bại: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Change password error:', error);
    throw new Error(error.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại.');
  }
}

export function isAuthenticated() {
  return !!localStorage.getItem('currentUser');
}

export function getCurrentUserSync() {
  try {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    return null;
  }
}

export function generateAvatarForCurrentUser() {
  try {
    const user = getCurrentUserSync();
    if (user && user.username && !user.avatarUrl) {
      const avatarUrl = generateAIPersonAvatar(user.username);
      user.avatarUrl = avatarUrl;
      localStorage.setItem('currentUser', JSON.stringify(user));
      return avatarUrl;
    }
    return user?.avatarUrl || null;
  } catch (error) {
    console.error('Generate avatar error:', error);
    return null;
  }
}

export async function checkUsername(username) {
  try {
    const res = await fetch(`${API_BASE_URL}/users/check-username?username=${encodeURIComponent(username)}`);
    if (!res.ok) {
      throw new Error('Không thể kiểm tra tên đăng nhập');
    }
    return await res.json();
  } catch (error) {
    console.error('Check username error:', error);
    throw error;
  }
}

// Helper function để kiểm tra email có tồn tại không
export async function checkEmail(email) {
  try {
    const res = await fetch(`${API_BASE_URL}/users/check-email?email=${encodeURIComponent(email)}`);
    if (!res.ok) {
      throw new Error('Không thể kiểm tra email');
    }
    return await res.json();
  } catch (error) {
    console.error('Check email error:', error);
    throw error;
  }
}
