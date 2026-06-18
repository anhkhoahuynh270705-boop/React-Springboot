/* eslint-disable no-unused-vars */
import { generateAIPersonAvatar } from './avatarService';
import { googleLogin, initializeGoogleAuth, renderGoogleSignInButton } from './googleAuthService';
import {
  authFetch,
  clearUserSession,
  parseAuthResponse,
  publicFetch,
  saveUserSession,
  adminFetch
} from './apiClient';

function notifyCurrentUserChanged(user = null) {
  window.dispatchEvent(
    new CustomEvent('currentUserChanged', {
      detail: { user }
    })
  );

  window.dispatchEvent(
    new CustomEvent('authChanged', {
      detail: { user }
    })
  );
}

function saveCurrentUser(user, notify = true) {
  localStorage.setItem('currentUser', JSON.stringify(user));

  if (notify) {
    notifyCurrentUserChanged(user);
  }
}

function clearCurrentUser() {
  clearUserSession();
  notifyCurrentUserChanged(null);
}

/* Map backend user.avatar to frontend avatarUrl and customAvatar. */
export function applyAvatarMapping(user) {
  if (!user) return user;

  const uploadedAvatar = user.avatar;
  const oauthAvatar = user.avatarUrl;

  // Avatar user tự upload, dạng base64
  if (uploadedAvatar && String(uploadedAvatar).startsWith('data:')) {
    user.avatarUrl = uploadedAvatar;
    user.customAvatar = true;
    return user;
  }

  // Avatar từ GitHub / Google
  if (oauthAvatar && String(oauthAvatar).startsWith('http')) {
    user.avatarUrl = oauthAvatar;
    user.customAvatar = true;
    return user;
  }

  // Avatar AI mặc định
  user.avatarUrl = generateAIPersonAvatar(
    user.username || user.fullName || user.email
  );
  user.customAvatar = true;

  return user;
}

export async function updateUserAvatar(avatarDataOrNull) {
  const currentUser = getCurrentUserSync();
  if (!currentUser || !currentUser.id) {
    throw new Error('User not found');
  }
  const res = await authFetch(`/users/${currentUser.id}/avatar`, {
    method: 'PUT',
    body: JSON.stringify({ avatar: avatarDataOrNull }),
  });
  if (!res.ok) {
    throw new Error('Failed to save avatar');
  }
  const serverUser = await res.json();
  const finalUser = applyAvatarMapping(serverUser);
  saveCurrentUser(finalUser);
  return finalUser;
}

export async function registerUser(userData) {
  try {
    const res = await publicFetch('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (!res.ok) {
      if (res.status === 409) {
        throw new Error('Username or email already exists');
      }
      if (res.status === 400) {
        throw new Error('Invalid information');
      }
      throw new Error(`Registration failed: ${res.status}`);
    }

    const user = await res.json();
    const avatarUrl = generateAIPersonAvatar(user.username);
    user.avatarUrl = avatarUrl;
    user.customAvatar = false;

    console.log('Generated default AI avatar for user:', user.username, 'URL:', avatarUrl);

    // save user info to localStorage
    saveCurrentUser(user);
    return user;
  } catch (error) {
    console.error('Registration error:', error);
    throw new Error(error.message || 'Registration failed. Please try again.');
  }
}

export async function loginUser({ username, password }) {
  try {
    const params = new URLSearchParams({
      username: username,
      password: password
    });

    const res = await publicFetch(`/users/login?${params}`, {
      method: 'POST',
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Username or password is incorrect');
      }
      throw new Error(`Login failed: ${res.status}`);
    }

    const data = await res.json();
    const { token, user } = parseAuthResponse(data);
    applyAvatarMapping(user);
    saveUserSession(token, user);
    saveCurrentUser(user);

    console.log('User logged in:', user.username, 'Last login:', user.lastLoginAt);

    try {
      await updateLastLogin(user.id);
    } catch (error) {
      console.warn('Could not update last login time:', error);
    }

    return user;
  } catch (error) {
    console.error('Login error:', error);
    throw new Error(error.message || 'Login failed. Please check your information.');
  }
}

export async function logoutUser() {
  try {
    clearCurrentUser();
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    clearCurrentUser();
    return true;
  }
}

// update last login time
export async function updateLastLogin(userId) {
  try {
    const res = await publicFetch(`/users/${userId}/update-login`, {
      method: 'POST',
    });

    if (!res.ok) {
      throw new Error(`Update last login time failed: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Update last login time error:', error);
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

// get user profile from database
export async function getUserProfile() {
  try {
    const localUser = getCurrentUserSync();
    if (!localUser || !localUser.id) {
      throw new Error('No access');
    }
    const res = await authFetch(`/users/profile?userId=${localUser.id}`, {
      method: 'GET',
    });

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('User not found');
      }
      console.warn('API failed');
      return localUser;
    }

    const userData = await res.json();
    applyAvatarMapping(userData);
    saveCurrentUser(userData, false);

    return userData;
  } catch (error) {
    const localUser = getCurrentUserSync();
    if (localUser) {
      console.warn('Using localStorage data as fallback');
      return localUser;
    }
    throw new Error(error.message || 'Get user profile failed. Please try again.');
  }
}

export async function updateUserProfile(userData) {
  try {
    // get current user info
    const currentUser = getCurrentUserSync();
    if (!currentUser) {
      throw new Error('User not found');
    }

    // only send fields to update, do not send password
    const updateData = {
      username: userData.username || currentUser.username,
      fullName: userData.fullName || currentUser.fullName,
      email: userData.email || currentUser.email,
      phone: userData.phone || currentUser.phone,
      address: userData.address || currentUser.address,
      notes: userData.notes || currentUser.notes,
      avatar: userData.avatar || currentUser.avatar
    };

    // update localStorage before
    const updatedUser = {
      ...currentUser,
      ...updateData,
      avatarUrl: currentUser.avatarUrl,
      customAvatar: currentUser.customAvatar
    };
    saveCurrentUser(updatedUser);

    try {
      const res = await authFetch(`/users/${currentUser.id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      if (res.ok) {
        const serverUser = await res.json();
        const finalUser = applyAvatarMapping(serverUser);
        saveCurrentUser(finalUser);
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
    throw new Error(error.message || 'Update profile failed. Please try again.');
  }
}

export async function changePassword({ currentPassword, newPassword }) {
  try {
    const currentUser = getCurrentUserSync();
    if (!currentUser) {
      throw new Error('User not found');
    }

    // call API to change password
    const res = await authFetch(`/users/change-password/${currentUser.id}`, {
      method: 'POST',
      body: JSON.stringify({
        currentPassword: currentPassword,
        newPassword: newPassword,
      }),
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error('Current password is incorrect');
      }
      throw new Error(`Change password failed: ${res.status}`);
    }

    const serverUser = await res.json();
    const finalUser = applyAvatarMapping(serverUser);
    saveCurrentUser(finalUser);

    return finalUser;
  } catch (error) {
    console.error('Change password error:', error);
    throw new Error(error.message || 'Change password failed. Please try again.');
  }
}

export function isAuthenticated() {
  return !!(localStorage.getItem('authToken') && localStorage.getItem('currentUser'));
}

export function getCurrentUserSync() {
  try {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    return null;
  }
}



// Get user profile by userId (for viewing other users' profiles)
export async function getUserProfileById(userId) {
  try {
    const res = await authFetch(`/users/profile?userId=${userId}`, {
      method: 'GET',
    });

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('User not found');
      }
      throw new Error(`Get user profile failed: ${res.status}`);
    }

    const userData = await res.json();
    return userData;
  } catch (error) {
    console.error('Get user profile by ID error:', error);
    throw new Error(error.message || 'Get user profile failed. Please try again.');
  }
}

export async function checkUsername(username) {
  try {
    const res = await publicFetch(`/users/check-username?username=${encodeURIComponent(username)}`);
    if (!res.ok) {
      throw new Error('Cannot check username');
    }
    return await res.json();
  } catch (error) {
    console.error('Check username error:', error);
    throw error;
  }
}

// Helper function to check if email exists
export async function checkEmail(email) {
  try {
    const res = await publicFetch(`/users/check-email?email=${encodeURIComponent(email)}`);
    if (!res.ok) {
      throw new Error('Cannot check email');
    }
    return await res.json();
  } catch (error) {
    console.error('Check email error:', error);
    throw error;
  }
}

// Admin reset password for user
export async function adminResetPassword(userId, newPassword) {
  try {
    const res = await adminFetch(`/users/admin/reset-password/${userId}`, {
      method: 'POST',
      body: JSON.stringify({
        newPassword: newPassword,
      }),
    });

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error('User not found');
      }
      if (res.status === 400) {
        throw new Error('New password is invalid');
      }
      throw new Error(`Reset password failed: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Admin reset password error:', error);
    throw new Error(error.message || 'Reset password failed. Please try again.');
  }
}

// Google OAuth functions 
export async function loginWithGoogle() {
  try {
    await initializeGoogleAuth();
    return new Promise((resolve, reject) => {
      const callbackRef = { resolve, reject };
      window.googleAuthCallback = callbackRef;

      setTimeout(() => {
        if (window.googleAuthCallback === callbackRef) {
          reject(new Error('Google Sign-In timeout. Please try again.'));
          window.googleAuthCallback = null;
        }
      }, 300000);
    });
  } catch (error) {
    console.error('Google login initialization error:', error);
    throw new Error('Failed to initialize Google login: ' + error.message);
  }
}

export async function handleGoogleLoginSuccess(user) {
  try {
    // Update last login time
    await updateLastLogin(user.id);
    return user;
  } catch (error) {
    console.warn('Could not update last login time:', error);
    return user;
  }
}

// Password reset functions
export async function requestPasswordReset(email) {
  try {
    const res = await publicFetch('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to request password reset');
    }

    return data;
  } catch (error) {
    console.error('Password reset request error:', error);
    throw new Error(error.message || 'Failed to request password reset. Please try again.');
  }
}

export async function resetPassword(token, newPassword) {
  try {
    const res = await publicFetch('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to reset password');
    }

    return data;
  } catch (error) {
    console.error('Password reset error:', error);
    throw new Error(error.message || 'Failed to reset password. Please try again.');
  }
}

export async function verifyResetToken(token) {
  try {
    const res = await publicFetch('/auth/verify-reset-token', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Token verification error:', error);
    return { valid: false, message: 'Failed to verify token' };
  }
}

