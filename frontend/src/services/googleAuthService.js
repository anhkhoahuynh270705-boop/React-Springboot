import { parseAuthResponse, publicFetch, saveUserSession } from './apiClient';

// Google OAuth configuration - will be loaded from backend
let GOOGLE_CLIENT_ID = null;

// Initialize Google OAuth
export const initializeGoogleAuth = async () => {
  // Get Client ID from backend
  try {
    const config = await getGoogleOAuthConfig();
    GOOGLE_CLIENT_ID = config.clientId;
  } catch (error) {
    console.error('Failed to get Google OAuth config from backend:', error);
    throw new Error('Failed to get Google OAuth configuration');
  }

  if (window.google && window.google.accounts) {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
      use_fedcm_for_prompt: true
    });
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;

    script.onload = () => {
      try {
        if (!GOOGLE_CLIENT_ID) {
          console.warn('Google Client ID not configured. Google Sign-In will not be available.');
          resolve();
          return;
        }

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: true
        });
        resolve();
      } catch (error) {
        console.warn('Failed to initialize Google OAuth (non-critical):', error);
        resolve();
      }
    };

    script.onerror = () => {
      console.warn('Failed to load Google OAuth script (non-critical)');
      resolve();
    };

    document.head.appendChild(script);
  });
};

// Get Google OAuth configuration from backend
const getGoogleOAuthConfig = async () => {
  try {
    const res = await publicFetch('/users/google-oauth-config');
    if (!res.ok) {
      throw new Error(`Failed to get OAuth config: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error('Error getting Google OAuth config:', error);
    throw error;
  }
};

// Handle Google OAuth response
const handleGoogleResponse = async (response) => {
  try {
    const credential = response.credential;

    // Pass the raw idToken (credential) to googleLogin for secure backend verification
    const user = await googleLogin(credential);

    console.log('Google login successful:', user.fullName);

    // Call the callback if it exists
    if (window.googleAuthCallback) {
      window.googleAuthCallback.resolve(user);
    }

    return user;
  } catch (error) {
    console.error('Google login error:', error);

    // Call the error callback if it exists
    if (window.googleAuthCallback) {
      window.googleAuthCallback.reject(error);
    }

    throw new Error('Google login failed');
  }
};

// Google login API call - accepts raw idToken string from Google SDK
export const googleLogin = async (idToken) => {
  try {
    const res = await publicFetch('/users/google-login', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });

    if (!res.ok) {
      throw new Error(`Google login failed: ${res.status}`);
    }

    const data = await res.json();
    const { token, user } = parseAuthResponse(data);

    // Decode the idToken locally to get the profile picture for avatar fallback
    const payload = JSON.parse(atob(idToken.split('.')[1]));
    if (!user.avatarUrl && payload.picture) {
      user.avatarUrl = payload.picture;
      user.customAvatar = true;
    } else if (!user.avatarUrl && !user.avatar) {
      user.avatarUrl = generateAIPersonAvatar(user.fullName || user.username || user.email);
      user.customAvatar = true;
    }

    // Now save with the avatar already set
    saveUserSession(token, user);
    localStorage.setItem('currentUser', JSON.stringify(user));

    return user;
  } catch (error) {
    console.error('Google login API error:', error);
    throw new Error(error.message || 'Google login failed. Please try again.');
  }
};

// Generate AI avatar
const generateAIPersonAvatar = (name) => {
  const colors = ['FF6B6B', '4ECDC4', '45B7D1', '96CEB4', 'FFEAA7', 'DDA0DD', '98D8C8', 'F7DC6F'];
  const color = colors[name.length % colors.length];
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=fff&size=200`;
};

// Render Google Sign-In button
export const renderGoogleSignInButton = (elementId, onSuccess, onError) => {
  if (!window.google) {
    onError(new Error('Google OAuth not initialized'));
    return;
  }

  window.google.accounts.id.renderButton(
    document.getElementById(elementId),
    {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'rectangular',
      logo_alignment: 'left',
      width: 300
    }
  );
};


