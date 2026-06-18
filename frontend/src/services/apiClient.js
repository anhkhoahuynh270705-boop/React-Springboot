export const API_BASE_URL = 'http://localhost:8080/api';

export function getAuthToken() {
  const userToken = localStorage.getItem('authToken');
  const adminToken = localStorage.getItem('adminToken');
  if (!userToken && window.location.pathname.startsWith('/admin') && adminToken) {
    return adminToken;
  }
  return userToken;
}

export function getAdminToken() {
  return localStorage.getItem('adminToken');
}

export function saveUserSession(token, user) {
  if (token) {
    localStorage.setItem('authToken', token);
  }
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }
}

export function clearUserSession() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
}

export function clearAdminSession() {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
}

export function parseAuthResponse(data) {
  if (data?.token && data?.user) {
    return { token: data.token, user: data.user };
  }

  if (data?.id) {
    return { token: null, user: data };
  }

  return { token: null, user: null };
}

function buildHeaders(options = {}, token) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function handleUnauthorized(type) {
  if (type === 'admin') {
    clearAdminSession();
    if (window.location.pathname.startsWith('/admin')) {
      window.location.href = '/admin/login';
    }
    return;
  }

  clearUserSession();
  window.dispatchEvent(
    new CustomEvent('authChanged', {
      detail: { user: null },
    })
  );
}

export async function publicFetch(path, options = {}) {
  const { headers, ...rest } = options;

  return fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: buildHeaders({ headers }, null),
  });
}

export async function authFetch(path, options = {}) {
  const token = getAuthToken();
  const { headers, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: buildHeaders({ headers }, token),
  });

  if (response.status === 401 || (response.status === 403 && window.location.pathname.startsWith('/admin'))) {
    if (window.location.pathname.startsWith('/admin')) {
      handleUnauthorized('admin');
      throw new Error('Session expired. Please login again.');
    } else {
      handleUnauthorized('user');
      throw new Error('Session expired. Please login again.');
    }
  }

  return response;
}

export async function adminFetch(path, options = {}) {
  const token = getAdminToken();
  const { headers, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: buildHeaders({ headers }, token),
  });

  if (response.status === 401 || response.status === 403) {
    handleUnauthorized('admin');
    throw new Error('Admin session expired. Please login again.');
  }

  return response;
}
