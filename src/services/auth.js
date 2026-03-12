export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const setToken = (token) => {
  localStorage.setItem('token', token);
};

export const removeToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('peerProfile');
};

export const getCurrentUser = () => {
  const profile = localStorage.getItem('peerProfile');
  return profile ? JSON.parse(profile) : null;
};

export const setCurrentUser = (user) => {
  localStorage.setItem('peerProfile', JSON.stringify(user));
};

export const logout = () => {
  removeToken();
  window.location.href = '/login';
};