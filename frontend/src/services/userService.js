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
    user.customAvatar = false; 
    
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
      user.customAvatar = false; 
      console.log('Generated default AI avatar for login user:', user.username, 'URL:', avatarUrl);
    }
    
    // Lưu token và user vào localStorage
    localStorage.setItem('authToken', 'user-token-' + user.id);
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    console.log('User logged in:', user.username, 'Last login:', user.lastLoginAt);
    
    try {
      await updateLastLogin(user.id);
    } catch (error) {
      console.warn('Could not update last login time:', error);
    }
    
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

// Cập nhật thời gian đăng nhập cuối
export async function updateLastLogin(userId) {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/update-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!res.ok) {
      throw new Error(`Update last login failed: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Update last login error:', error);
    throw error;
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
    const localUser = getCurrentUserSync();
    if (!localUser || !localUser.id) {
      throw new Error('Không có quyền truy cập');
    }
    const res = await fetch(`${API_BASE_URL}/users/profile?userId=${localUser.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }
      console.warn('API failed, using localStorage data');
      return localUser;
    }

    const userData = await res.json();
    localStorage.setItem('currentUser', JSON.stringify(userData));
    
    return userData;
  } catch (error) {
    const localUser = getCurrentUserSync();
    if (localUser) {
      console.warn('Using localStorage data as fallback');
      return localUser;
    }
    throw new Error(error.message || 'Lấy thông tin thất bại. Vui lòng thử lại.');
  }
}

export async function updateUserProfile(userData) {
  try {
    // Lấy thông tin user hiện tại
    const currentUser = getCurrentUserSync();
    if (!currentUser) {
      throw new Error('Không tìm thấy thông tin người dùng');
    }

    // Chỉ gửi các field cần cập nhật, không gửi password
    const updateData = {
      username: userData.username || currentUser.username,
      fullName: userData.fullName || currentUser.fullName,
      email: userData.email || currentUser.email,
      phone: userData.phone || currentUser.phone,
      address: userData.address || currentUser.address,
      notes: userData.notes || currentUser.notes,
      avatar: userData.avatar || currentUser.avatar
    };

    // Cập nhật localStorage trước
    const updatedUser = {
      ...currentUser,
      ...updateData,
      avatarUrl: currentUser.avatarUrl,
      customAvatar: currentUser.customAvatar
    };
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));

    try {
      const res = await fetch(`${API_BASE_URL}/users/${currentUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (res.ok) {
        const serverUser = await res.json();
        // Merge với thông tin local để giữ avatarUrl và customAvatar
        const finalUser = {
          ...serverUser,
          avatarUrl: currentUser.avatarUrl,
          customAvatar: currentUser.customAvatar
        };
        localStorage.setItem('currentUser', JSON.stringify(finalUser));
        return finalUser;
      } else {
        console.warn('API update failed, but local update succeeded');
        return updatedUser;
      }
    } catch (apiError) {
      console.warn('API call failed, but local update succeeded:', apiError);
      return updatedUser;
    }
  } catch (error) {
    console.error('Update profile error:', error);
    throw new Error(error.message || 'Cập nhật thất bại. Vui lòng thử lại.');
  }
}

export async function changePassword({ currentPassword, newPassword }) {
  try {
    const currentUser = getCurrentUserSync();
    if (!currentUser) {
      throw new Error('Không tìm thấy thông tin người dùng');
    }

    // Gọi API để đổi mật khẩu
    const res = await fetch(`${API_BASE_URL}/users/change-password/${currentUser.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentPassword: currentPassword,
        newPassword: newPassword
      })
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Mật khẩu hiện tại không đúng');
      }
      throw new Error(`Đổi mật khẩu thất bại: ${res.status}`);
    }

    const serverUser = await res.json();
    const finalUser = {
      ...serverUser,
      avatarUrl: currentUser.avatarUrl,
      customAvatar: currentUser.customAvatar
    };
    localStorage.setItem('currentUser', JSON.stringify(finalUser));
    
    return finalUser;
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
